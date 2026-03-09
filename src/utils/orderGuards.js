const SUBMIT_GUARD_STORAGE_KEY = "orderSubmitGuardV1";

export const ORDER_LIMITS = {
    maxTotalItems: 25,
    maxDistinctProducts: 15,
    maxPerProduct: 8,
    maxOrderTotal: 120,
    submitCooldownSeconds: 1,
    maxSubmitsPerWindow: 1,
    submitWindowSeconds: 1,
};

function toSafePrice(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function validateCartForAdd(cart, product) {
    const cartList = Array.isArray(cart) ? cart : [];
    const productId = String(product?.id || "");
    const productPrice = toSafePrice(product?.price);
    const totalItems = cartList.length;

    if (!productId) {
        return { ok: false, message: "Μη έγκυρο προϊόν." };
    }

    if (totalItems >= ORDER_LIMITS.maxTotalItems) {
        return {
            ok: false,
            message: `Μέχρι ${ORDER_LIMITS.maxTotalItems} τεμάχια ανά παραγγελία.`,
        };
    }

    const distinctProducts = new Set(cartList.map((item) => String(item.id)));
    if (
        !distinctProducts.has(productId) &&
        distinctProducts.size >= ORDER_LIMITS.maxDistinctProducts
    ) {
        return {
            ok: false,
            message: `Μέχρι ${ORDER_LIMITS.maxDistinctProducts} διαφορετικά είδη ανά παραγγελία.`,
        };
    }

    const currentProductCount = cartList.filter((item) => String(item.id) === productId).length;
    if (currentProductCount >= ORDER_LIMITS.maxPerProduct) {
        return {
            ok: false,
            message: `Μέχρι ${ORDER_LIMITS.maxPerProduct} τεμάχια από το ίδιο προϊόν.`,
        };
    }

    const currentTotal = cartList.reduce((sum, item) => sum + toSafePrice(item.price), 0);
    if (currentTotal + productPrice > ORDER_LIMITS.maxOrderTotal) {
        return {
            ok: false,
            message: `Μέγιστο σύνολο παραγγελίας ${ORDER_LIMITS.maxOrderTotal.toFixed(2)} €.`,
        };
    }

    return { ok: true };
}

export function validateCartForSubmit(cart, total) {
    const cartList = Array.isArray(cart) ? cart : [];

    if (cartList.length === 0) {
        return { ok: false, message: "Το καλάθι είναι άδειο." };
    }

    if (cartList.length > ORDER_LIMITS.maxTotalItems) {
        return {
            ok: false,
            message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxTotalItems} τεμάχια ανά παραγγελία.`,
        };
    }

    const distinctProducts = new Set(cartList.map((item) => String(item.id)));
    if (distinctProducts.size > ORDER_LIMITS.maxDistinctProducts) {
        return {
            ok: false,
            message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxDistinctProducts} διαφορετικά είδη.`,
        };
    }

    const productCounts = new Map();
    cartList.forEach((item) => {
        const key = String(item.id);
        productCounts.set(key, (productCounts.get(key) || 0) + 1);
    });

    for (const count of productCounts.values()) {
        if (count > ORDER_LIMITS.maxPerProduct) {
            return {
                ok: false,
                message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxPerProduct} τεμάχια ανά προϊόν.`,
            };
        }
    }

    if (toSafePrice(total) > ORDER_LIMITS.maxOrderTotal) {
        return {
            ok: false,
            message: `Υπέρβαση ορίου: μέγιστο σύνολο ${ORDER_LIMITS.maxOrderTotal.toFixed(2)} €.`,
        };
    }

    return { ok: true };
}

function loadSubmitGuardStore() {
    try {
        const raw = localStorage.getItem(SUBMIT_GUARD_STORAGE_KEY);
        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function saveSubmitGuardStore(store) {
    try {
        localStorage.setItem(SUBMIT_GUARD_STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Ignore local storage write failures.
    }
}

function normalizeTimestamps(timestamps, now) {
    const windowMs = ORDER_LIMITS.submitWindowSeconds * 1000;
    return (Array.isArray(timestamps) ? timestamps : []).filter(
        (value) => Number.isFinite(value) && now - value <= windowMs
    );
}

export function canSubmitOrderNow(tableId) {
    const normalizedTableId = String(tableId || "").trim();
    if (!normalizedTableId) {
        return { ok: false, message: "Δεν εντοπίστηκε τραπέζι." };
    }

    const now = Date.now();
    const store = loadSubmitGuardStore();
    const tableState = store[normalizedTableId] || {};
    const timestamps = normalizeTimestamps(tableState.timestamps, now);
    const lastSubmitAt = Number.isFinite(tableState.lastSubmitAt) ? tableState.lastSubmitAt : 0;
    const cooldownMs = ORDER_LIMITS.submitCooldownSeconds * 1000;

    if (lastSubmitAt > 0 && now - lastSubmitAt < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - (now - lastSubmitAt)) / 1000);
        return {
            ok: false,
            message: `Περίμενε ${remainingSeconds} δευτ. πριν ξαναστείλεις παραγγελία.`,
        };
    }

    if (timestamps.length >= ORDER_LIMITS.maxSubmitsPerWindow) {
        return {
            ok: false,
            message: "Πολλές παραγγελίες σε λίγο χρόνο. Δοκίμασε ξανά σε 1 δευτ.",
        };
    }

    return { ok: true };
}

export function registerSuccessfulSubmit(tableId) {
    const normalizedTableId = String(tableId || "").trim();
    if (!normalizedTableId) {
        return;
    }

    const now = Date.now();
    const store = loadSubmitGuardStore();
    const currentTableState = store[normalizedTableId] || {};
    const timestamps = normalizeTimestamps(currentTableState.timestamps, now);

    store[normalizedTableId] = {
        lastSubmitAt: now,
        timestamps: [...timestamps, now],
    };

    saveSubmitGuardStore(store);
}