import sys
import types
import uuid

def apply_patches():
    """
    Patch Windows DLL blocking issues (e.g. uuid_utils blocked by Application Control)
    """
    try:
        import uuid_utils
    except Exception:
        class MockUUID:
            @staticmethod
            def uuid7():
                return uuid.uuid4()
            @staticmethod
            def uuid4():
                return uuid.uuid4()
            UUID = uuid.UUID

        mock_mod = types.ModuleType("uuid_utils")
        mock_mod.uuid7 = lambda: uuid.uuid4()
        mock_mod.uuid4 = lambda: uuid.uuid4()
        mock_mod.UUID = uuid.UUID
        mock_mod.UUID7 = uuid.UUID

        compat_mod = types.ModuleType("uuid_utils.compat")
        compat_mod.uuid7 = lambda: uuid.uuid4()
        compat_mod.uuid4 = lambda: uuid.uuid4()
        compat_mod.UUID = uuid.UUID

        sys.modules["uuid_utils"] = mock_mod
        sys.modules["uuid_utils.compat"] = compat_mod

apply_patches()
