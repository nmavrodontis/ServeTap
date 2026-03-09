const PASSKEY_ID_STORAGE_KEY = "serveTapPasskeyIdV1";

function getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function toBase64Url(uint8Array) {
    const binary = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64Url) {
    const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
    const normalized = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

function getStoredPasskeyId() {
    try {
        return localStorage.getItem(PASSKEY_ID_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function setStoredPasskeyId(passkeyId) {
    try {
        localStorage.setItem(PASSKEY_ID_STORAGE_KEY, passkeyId);
    } catch {
        // Ignore storage failures and keep runtime-only verification.
    }
}

export async function canUsePlatformVerification() {
    if (typeof window === "undefined") {
        return { ok: false, reason: "no-window", details: "No browser window context." };
    }

    if (!window.isSecureContext) {
        return {
            ok: false,
            reason: "insecure-context",
            details: "Biometrics require HTTPS (or localhost).",
        };
    }

    if (!window.PublicKeyCredential || !navigator.credentials) {
        return {
            ok: false,
            reason: "no-webauthn",
            details: "This browser does not expose WebAuthn APIs.",
        };
    }

    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
        return {
            ok: false,
            reason: "no-platform-authenticator",
            details: "No platform authenticator API found.",
        };
    }

    if (window.top !== window.self) {
        return {
            ok: false,
            reason: "embedded-context",
            details: "Biometrics may be blocked inside embedded/in-app browsers.",
        };
    }

    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available
            ? { ok: true, reason: "ok", details: "Platform authenticator available." }
            : {
                ok: false,
                reason: "platform-unavailable",
                details: "No Face ID/Touch ID/passcode authenticator available on this device/browser.",
            };
    } catch {
        return {
            ok: false,
            reason: "platform-check-failed",
            details: "Platform authenticator check failed.",
        };
    }
}

async function registerPasskey() {
    const challenge = getRandomBytes(32);
    const userId = getRandomBytes(16);

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: { name: "ServeTap" },
            user: {
                id: userId,
                name: `guest-${Date.now()}@servetap.local`,
                displayName: "ServeTap Guest",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            timeout: 30000,
            attestation: "none",
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
            },
        },
    });

    if (!credential || !(credential.rawId instanceof ArrayBuffer)) {
        throw new Error("PASSKEY_REGISTRATION_FAILED");
    }

    const passkeyId = toBase64Url(new Uint8Array(credential.rawId));
    setStoredPasskeyId(passkeyId);
    return passkeyId;
}

async function authenticateWithPasskey(passkeyId) {
    const challenge = getRandomBytes(32);

    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge,
            timeout: 30000,
            userVerification: "required",
            allowCredentials: [
                {
                    id: fromBase64Url(passkeyId),
                    type: "public-key",
                },
            ],
        },
    });

    if (!assertion) {
        throw new Error("PASSKEY_AUTH_FAILED");
    }

    return true;
}

export async function verifyWithBiometrics() {
    const storedPasskeyId = getStoredPasskeyId();
    const passkeyId = storedPasskeyId || (await registerPasskey());
    await authenticateWithPasskey(passkeyId);
    return true;
}

export function getVerificationFallbackMessage(reason) {
    if (reason === "insecure-context") {
        return "Biometric verification needs HTTPS. Using code verification.";
    }

    if (reason === "no-webauthn" || reason === "no-platform-authenticator") {
        return "This phone/browser does not support passkeys. Using code verification.";
    }

    if (reason === "embedded-context") {
        return "This page is opened inside an embedded browser. Open the link in Safari/Chrome to use biometrics.";
    }

    return "Biometric verification is not available. Using code verification.";
}

export function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
