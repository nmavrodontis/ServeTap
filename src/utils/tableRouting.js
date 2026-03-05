const TABLE_STORAGE_KEY = "activeTableId";

export function getTableIdFromSearch(search) {
    const params = new URLSearchParams(search || "");
    const tableId = params.get("table");
    return tableId ? tableId.trim() : "";
}

export function getStoredTableId() {
    const value = localStorage.getItem(TABLE_STORAGE_KEY);
    return value ? value.trim() : "";
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

export function withTable(path, tableId) {
    const normalized = tableId ? tableId.trim() : "";
    if (!normalized) {
        return path;
    }

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}table=${encodeURIComponent(normalized)}`;
}
