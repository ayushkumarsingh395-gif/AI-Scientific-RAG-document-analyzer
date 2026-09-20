import patch_env  # noqa: F401
import os
import time
import pickle
import traceback
from typing import List, Optional
import numpy as np
import requests
import pypdf
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

_embedding_instance = None

HF_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL_ID}/pipeline/feature-extraction"
class LocalEmbeddings:
    """
    Uses Hugging Face's hosted Inference API instead of loading the model
    locally, so no heavy model/PyTorch is loaded into RAM on the server.
    """
    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN")
        if not self.hf_token:
            raise RuntimeError("HF_TOKEN is not set. Required for embeddings via Hugging Face Inference API.")
        self.headers = {"Authorization": f"Bearer {self.hf_token}"}

    def _call_api(self, texts: List[str], max_retries: int = 4) -> List[List[float]]:
        payload = {"inputs": texts, "options": {"wait_for_model": True}}
        for attempt in range(max_retries):
            try:
                response = requests.post(HF_API_URL, headers=self.headers, json=payload, timeout=60)
                if response.status_code == 200:
                    data = response.json()
                    # Some models return token-level embeddings (3D); mean-pool if so.
                    result = []
                    for item in data:
                        arr = np.array(item)
                        if arr.ndim == 2:
                            arr = arr.mean(axis=0)
                        result.append(arr.tolist())
                    return result
                elif response.status_code == 503:
                    # Model is loading on HF's side, wait and retry
                    time.sleep(3)
                    continue
                else:
                    raise RuntimeError(f"HF Inference API error {response.status_code}: {response.text[:300]}")
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"Failed to reach HF Inference API: {e}")
                time.sleep(2)
        raise RuntimeError("HF Inference API did not respond after retries.")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        # Batch to avoid overly large single requests
        batch_size = 32
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            all_embeddings.extend(self._call_api(batch))
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        if not text:
            return []
        return self._call_api([text])[0]

def get_embeddings():
    global _embedding_instance
    if _embedding_instance is None:
        _embedding_instance = LocalEmbeddings()
    return _embedding_instance

class NexusVectorStore:
    """
    High-performance vector store using Pure NumPy Cosine Similarity.
    100% immune to Windows Application Control / DLL blocking errors.
    """
    def __init__(self, embeddings: LocalEmbeddings):
        self.embeddings = embeddings
        self.docs: List[dict] = []
        self.vectors: List[List[float]] = []

    @classmethod
    def from_documents(cls, documents: List[Document], embeddings: LocalEmbeddings):
        vs = cls(embeddings)
        vs.add_documents(documents)
        return vs

    def add_documents(self, documents: List[Document]):
        if not documents:
            return
        texts = [doc.page_content for doc in documents]
        vecs = self.embeddings.embed_documents(texts)
        for doc, vec in zip(documents, vecs):
            self.docs.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata
            })
            self.vectors.append(vec)

    def similarity_search(self, query: str, k: int = 6) -> List[Document]:
        if not self.docs or not self.vectors:
            return []
        try:
            q_vec = np.array(self.embeddings.embed_query(query))
            doc_matrix = np.array(self.vectors)
            
            # Cosine similarity
            q_norm = np.linalg.norm(q_vec)
            doc_norms = np.linalg.norm(doc_matrix, axis=1)
            denominator = (doc_norms * q_norm) + 1e-10
            scores = np.dot(doc_matrix, q_vec) / denominator

            top_indices = np.argsort(scores)[::-1][:k]
            results = []
            for idx in top_indices:
                d = self.docs[idx]
                results.append(Document(page_content=d["page_content"], metadata=d.get("metadata", {})))
            return results
        except Exception as e:
            traceback.print_exc()
            return []

    def save_local(self, folder_path: str):
        os.makedirs(folder_path, exist_ok=True)
        index_file = os.path.join(folder_path, "index.pkl")
        with open(index_file, "wb") as f:
            pickle.dump({"docs": self.docs, "vectors": self.vectors}, f)

    @classmethod
    def load_local(cls, folder_path: str, embeddings: LocalEmbeddings, **kwargs) -> Optional['NexusVectorStore']:
        index_file = os.path.join(folder_path, "index.pkl")
        if not os.path.isfile(index_file):
            return None
        try:
            with open(index_file, "rb") as f:
                data = pickle.load(f)
            vs = cls(embeddings)
            vs.docs = data.get("docs", [])
            vs.vectors = data.get("vectors", [])
            return vs
        except Exception as e:
            print(f"❌ Failed to load vector store from {folder_path}: {e}")
            return None

def get_vector_store(session_id: str) -> Optional[NexusVectorStore]:
    """
    Safely load vector store for a session.
    """
    if not session_id:
        return None

    path = os.path.join(".", "faiss_db", str(session_id))
    embeddings = get_embeddings()
    return NexusVectorStore.load_local(path, embeddings)

def load_file_documents(file_path: str) -> List[Document]:
    ext = os.path.splitext(file_path)[1].lower()
    filename = os.path.basename(file_path)
    docs = []

    if ext == ".pdf":
        reader = pypdf.PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                docs.append(Document(page_content=text, metadata={"source": filename, "page": idx + 1}))
    elif ext in [".txt", ".md", ".json"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if content.strip():
            docs.append(Document(page_content=content, metadata={"source": filename}))
    elif ext == ".csv":
        import csv
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            rows = [", ".join(row) for row in reader if row]
        if rows:
            docs.append(Document(page_content="\n".join(rows), metadata={"source": filename}))
    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(file_path)
            full_text = [p.text for p in doc.paragraphs if p.text.strip()]
            if full_text:
                docs.append(Document(page_content="\n\n".join(full_text), metadata={"source": filename}))
        except Exception:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                docs.append(Document(page_content=f.read(), metadata={"source": filename}))
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            docs.append(Document(page_content=f.read(), metadata={"source": filename}))

    if not docs:
        docs.append(Document(page_content="", metadata={"source": filename}))

    return docs

def process_and_index_file(file_path: str, session_id: str):
    """
    Read supported file (PDF, DOCX, TXT, CSV, MD), split into chunks, and index into Vector Store.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    filename = os.path.basename(file_path)
    documents = load_file_documents(file_path)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(documents)

    if not chunks or (len(chunks) == 1 and not chunks[0].page_content.strip()):
        return {"chunks_count": 0, "message": f"No text could be extracted from {filename}"}

    path = os.path.join(".", "faiss_db", str(session_id))
    os.makedirs(path, exist_ok=True)

    embeddings = get_embeddings()
    vector_store = get_vector_store(session_id)
    if vector_store is None:
        vector_store = NexusVectorStore.from_documents(chunks, embeddings)
    else:
        vector_store.add_documents(chunks)

    vector_store.save_local(path)
    return {"chunks_count": len(chunks), "message": f"Indexed {len(chunks)} chunks from {filename}"}

def process_and_index_pdf(file_path: str, session_id: str):
    return process_and_index_file(file_path, session_id)
