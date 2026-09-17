import patch_env
import os
import re
import json
import asyncio
import traceback
from typing import List, Dict, Any, AsyncGenerator, Optional
from dotenv import load_dotenv
from groq import Groq
from embeddings import get_vector_store

load_dotenv()

SUPPORTED_MODELS = {
    "openai/gpt-oss-120b": "GPT-OSS 120B (Deep Reasoning & RAG)",
    "openai/gpt-oss-20b": "GPT-OSS 20B (Ultra Fast)",
    "qwen/qwen3.8-27b": "Qwen 3.8 27B (High Intelligence)"
}

DEFAULT_MODEL = "openai/gpt-oss-120b"


def get_groq_client():
    key = os.getenv("GROQ_API_KEY", "")
    if not key:
        return None
    return Groq(api_key=key)

def generate_ai_image_url(prompt: str, style: str = "photorealistic, 8k") -> Dict[str, str]:
    clean_prompt = prompt.replace(" ", "%20")
    seed = abs(hash(prompt)) % 100000
    image_url = f"https://image.pollinations.ai/prompt/{clean_prompt}?seed={seed}&nologo=true"
    return {"image_url": image_url, "prompt": prompt}

def generate_smart_title(message: str, model_name: str = DEFAULT_MODEL) -> str:

    """
    Generate a concise, elegant 3-5 word title representing the chat topic.
    """
    client = get_groq_client()
    if not client or not message.strip():
        return message[:25] + "..." if len(message) > 25 else message

    try:
        prompt = f"""Generate a concise, informative 3 to 5 word title that describes the core topic of this inquiry.
Do NOT use quotes, markdown, or punctuation. Just return the raw title.

Inquiry: {message[:250]}
Title:"""

        res = client.chat.completions.create(
            model=model_name if model_name in SUPPORTED_MODELS else DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=20
        )
        title = res.choices[0].message.content.strip().replace('"', '').replace("'", "")
        return title if len(title) > 2 else message[:25]
    except Exception:
        clean = re.sub(r'[^a-zA-Z0-9\s]', '', message[:30]).strip()
        return clean or "Document Session"

def get_document_context(question: str, vector_store):
    try:
        docs = vector_store.similarity_search(question, k=6)
        if not docs:
            return "", []

        context_parts = []
        sources = []

        for doc in docs:
            if doc.page_content and doc.page_content.strip():
                context_parts.append(doc.page_content)
            source = doc.metadata.get("source")
            if source:
                clean_src = source.replace("\\", "/").split("/")[-1]
                if clean_src not in sources:
                    sources.append(clean_src)

        context = "\n\n".join(context_parts)
        return context, sources
    except Exception as e:
        traceback.print_exc()
        return "", []

def generate_follow_ups(client: Groq, context: str, question: str, answer: str, model_name: str = DEFAULT_MODEL) -> List[str]:
    try:
        prompt = f"""Based on the user question and the AI response below, generate exactly 3 short follow-up questions the user would find valuable.
Context: {context[:300] if context else 'General intelligence'}
User Question: {question}
AI Answer: {answer[:300]}
Return ONLY a raw JSON array of 3 string questions. Example: ["Question 1?", "Question 2?", "Question 3?"]"""

        res = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150
        )
        content = res.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        parsed = json.loads(content)
        if isinstance(parsed, list):
            return [str(q).strip() for q in parsed[:3]]
    except Exception:
        pass

    return [
        "Can you break down the key steps into a flowchart?",
        "What are the most critical takeaways?",
        "Are there any practical recommendations or risks?"
    ]

SYSTEM_INTELLIGENCE_PROMPT = """You are NEXUS AI, a cutting-edge Enterprise AI Assistant and Document Intelligence Platform (delivering ChatGPT-4o / Claude 3.5 Sonnet level precision and reasoning).

CORE INSTRUCTIONS & CAPABILITIES:

1. LANGUAGE INTELLIGENCE & ADAPTABILITY:
   - Automatically match the user's language and tone.
   - If the user asks in Hinglish (e.g., "bhai iska process explain kr do", "summary batao"), answer in natural, fluent, intelligent Hinglish.
   - If the user asks in Hindi, reply in clear Hindi.
   - If English -> English. If any other language -> respond in that exact language.

2. MATHEMATICS & FORMULAS (LaTeX & Intuitive Explanation):
   - Whenever explaining mathematical functions, equations, formulas, calculus, stats, or metrics:
     * NEVER output confusing raw unicode symbols without explanation.
     * Use standard LaTeX math formatting with `$$ ... $$` for block formulas and `$ ... $` for inline variables (e.g. `$$ f(x) = \\int_{0}^{\\infty} e^{-x^2} dx $$`, `$E = mc^2$`, `$\\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}$`).
     * Always provide an **Intuitive, Plain-Language Explanation**: Explain what every variable/symbol represents in simple terms and provide a step-by-step breakdown of how the formula works.

3. VISUAL FLOWCHARTS & DIAGRAMS (Mermaid.js):
   - Whenever the user asks for a flowchart, diagram, process, workflow, sequence, architecture, or lifecycle (OR whenever a visual breakdown makes a complex process much easier to understand), generate a clean, valid Mermaid code block:
     ```mermaid
     graph TD
         A["Start Process"] --> B["Calculate Values / Step 1"]
         B --> C{"Decision Point"}
         C -->|"Condition True"| D["Output Result 1"]
         C -->|"Condition False"| E["Output Result 2"]
     ```
   - Rules for Mermaid:
     * ALWAYS enclose all node text and descriptions in double quotes: `A["Step 1: Process Description"]`.
     * Never use unescaped special characters or raw brackets inside node labels without quotes.

4. PROACTIVE EXTRA VALUE & RELEVANT INSIGHTS:
   - In addition to directly answering the user's question, always provide proactive, high-value extra context at the end:
     ---
     ### 💡 Relevant Insights & Next Steps
     - **Key Nuance / Context**: [Crucial practical insight from the document or domain]
     - **Actionable Next Step**: [What the user or team should do next with this information]

5. PRECISION & FORMATTING:
   - Use structured Markdown with headings (###), bold key terms, clean bullet points, and syntax-highlighted code blocks.
   - Extract data into clean tables whenever comparing items or listing metrics.
"""

def ask_rag(question: str, session_id: str, model_name: str = DEFAULT_MODEL, chat_history: Optional[List[Dict[str, str]]] = None):
    try:
        clean_question = question.strip() if question else ""
        if not clean_question:
            return {
                "answer": "Hello! How can I assist you with your inquiries, documents, or process flowcharts today?",
                "sources": [],
                "follow_ups": ["Can you generate a flowchart of the document?", "What are the key points?"]
            }

        client = get_groq_client()
        if not client:
            return {
                "answer": "GROQ_API_KEY is not configured in backend/.env.",
                "sources": [],
                "follow_ups": []
            }

        active_model = model_name if model_name in SUPPORTED_MODELS else DEFAULT_MODEL
        vector_store = get_vector_store(session_id)

        messages = [{"role": "system", "content": SYSTEM_INTELLIGENCE_PROMPT}]

        if chat_history:
            for turn in chat_history[-6:]:
                role = "assistant" if turn.get("role") in ["ai", "assistant"] else "user"
                content = turn.get("content", "")
                if content:
                    messages.append({"role": role, "content": content})

        sources = []
        context = ""

        if vector_store is not None:
            context, sources = get_document_context(clean_question, vector_store)
            if context:
                messages.append({"role": "user", "content": f"DOCUMENT CONTEXT FOR RETRIEVAL:\n{context[:12000]}\n\nUSER QUESTION:\n{clean_question}"})
            else:
                messages.append({"role": "user", "content": clean_question})
        else:
            messages.append({"role": "user", "content": clean_question})

        res = client.chat.completions.create(
            model=active_model,
            messages=messages,
            temperature=0.3,
            max_tokens=1600
        )
        answer = res.choices[0].message.content.strip()
        follow_ups = generate_follow_ups(client, context, clean_question, answer, active_model)
        return {"answer": answer, "sources": sources, "follow_ups": follow_ups}
    except Exception as e:
        traceback.print_exc()
        return {"answer": f"Error communicating with AI service: {str(e)}", "sources": [], "follow_ups": []}

async def ask_rag_stream(question: str, session_id: str, model_name: str = DEFAULT_MODEL, chat_history: Optional[List[Dict[str, str]]] = None) -> AsyncGenerator[str, None]:
    try:
        clean_question = question.strip() if question else ""
        if not clean_question:
            yield f"data: {json.dumps({'chunk': 'Hello! How can I assist you today?', 'done': True, 'sources': [], 'follow_ups': []})}\n\n"
            return

        client = get_groq_client()
        if not client:
            yield f"data: {json.dumps({'chunk': 'GROQ_API_KEY is not configured.', 'done': True, 'sources': [], 'follow_ups': []})}\n\n"
            return

        active_model = model_name if model_name in SUPPORTED_MODELS else DEFAULT_MODEL
        vector_store = get_vector_store(session_id)

        messages = [{"role": "system", "content": SYSTEM_INTELLIGENCE_PROMPT}]

        if chat_history:
            for turn in chat_history[-6:]:
                role = "assistant" if turn.get("role") in ["ai", "assistant"] else "user"
                content = turn.get("content", "")
                if content:
                    messages.append({"role": role, "content": content})

        sources = []
        context = ""

        if vector_store is not None:
            context, sources = get_document_context(clean_question, vector_store)
            if context:
                messages.append({"role": "user", "content": f"DOCUMENT CONTEXT:\n{context[:12000]}\n\nUSER QUESTION:\n{clean_question}"})
            else:
                messages.append({"role": "user", "content": clean_question})
        else:
            messages.append({"role": "user", "content": clean_question})

        stream = client.chat.completions.create(
            model=active_model,
            messages=messages,
            temperature=0.3,
            max_tokens=1600,
            stream=True
        )


        full_answer = []
        for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                full_answer.append(delta)
                yield f"data: {json.dumps({'chunk': delta, 'done': False})}\n\n"
                await asyncio.sleep(0.005)

        joined_answer = "".join(full_answer)
        follow_ups = generate_follow_ups(client, context, clean_question, joined_answer, active_model)
        yield f"data: {json.dumps({'chunk': '', 'done': True, 'sources': sources, 'follow_ups': follow_ups})}\n\n"

    except Exception as e:
        traceback.print_exc()
        yield f"data: {json.dumps({'chunk': f'\\n\\n[Error: {str(e)}]', 'done': True, 'sources': [], 'follow_ups': []})}\n\n"
