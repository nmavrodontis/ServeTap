const TABLE_STORAGE_KEY = "activeTableId";
const VISIT_CONTEXT_STORAGE_KEY = "activeTableVisitV1";
const VISIT_TTL_MS = 1000 * 60 * 60 * 3;

function makeToken() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getTableTokenFromSearch(search) {
    const params = new URLSearchParams(search || "");
    const token = params.get("tableToken");
    return token ? token.trim() : "";
}

function loadVisitContext() {
    try {
        const raw = localStorage.getItem(VISIT_CONTEXT_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        const tableId = String(parsed.tableId || "").trim();
        const tableToken = String(parsed.tableToken || "").trim();
        const updatedAt = Number(parsed.updatedAt || 0);

        if (!tableId || !tableToken || !Number.isFinite(updatedAt)) {
            return null;
        }

        if (Date.now() - updatedAt > VISIT_TTL_MS) {
            return null;
        }

        return { tableId, tableToken, updatedAt };
    } catch {
        return null;
    }
}

function persistVisitContext(tableId, tableToken) {
    const normalizedTableId = String(tableId || "").trim();
    const normalizedToken = String(tableToken || "").trim();
    if (!normalizedTableId || !normalizedToken) {
        return;
    }

    try {
        localStorage.setItem(
            VISIT_CONTEXT_STORAGE_KEY,
            JSON.stringify({
                tableId: normalizedTableId,
                tableToken: normalizedToken,
                updatedAt: Date.now(),
            })
        );
    } catch {
        // Ignore local storage write failures.
    }
}

export function getTableIdFromSearch(search) {
    const params = new URLSearchParams(search || "");
    const tableId = params.get("table");
    return tableId ? tableId.trim() : "";
}

export function getStoredTableId() {
    const value = localStorage.getItem(TABLE_STORAGE_KEY);
    return value ? value.trim() : "";
}

export function getStoredTableToken() {
    const context = loadVisitContext();
    return context?.tableToken || "";
}

export function persistTableId(tableId) {
    const normalized = tableId ? tableId.trim() : "";
    if (!normalized) {
        return;
    }

    localStorage.setItem(TABLE_STORAGE_KEY, normalized);
}

export function getActiveTableId(search) {
    return getTableIdFromSearch(search) || getStoredTableId();
}

export function getOrCreateActiveVisitToken(search, explicitTableId) {
    const tableId = String(explicitTableId || getActiveTableId(search) || "").trim();
    if (!tableId) {
        return "";
    }

    const tokenFromSearch = getTableTokenFromSearch(search);
    if (tokenFromSearch) {
        persistVisitContext(tableId, tokenFromSearch);
        return tokenFromSearch;
    }

    const storedContext = loadVisitContext();
    if (storedContext?.tableId === tableId) {
        persistVisitContext(tableId, storedContext.tableToken);
        return storedContext.tableToken;
    }

    const createdToken = makeToken();
    persistVisitContext(tableId, createdToken);
    return createdToken;
}

export function syncTableVisitFromSearch(search) {
    const tableId = getTableIdFromSearch(search);
    if (!tableId) {
        return;
    }

    persistTableId(tableId);
    getOrCreateActiveVisitToken(search, tableId);
}

export function withTable(path, tableId, tableToken) {
    const normalized = tableId ? tableId.trim() : "";
    if (!normalized) {
        return path;
    }

    const separator = path.includes("?") ? "&" : "?";
    let nextPath = `${path}${separator}table=${encodeURIComponent(normalized)}`;
    const normalizedToken = String(tableToken || "").trim();
    if (normalizedToken) {
        nextPath += `&tableToken=${encodeURIComponent(normalizedToken)}`;
    }

    return nextPath;
}
