function getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

export async function canUsePlatformVerification() {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
        return false;
    }

    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
        return false;
    }

    try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

export async function verifyWithBiometrics() {
    const challenge = getRandomBytes(32);
    const userId = getRandomBytes(16);

    await navigator.credentials.create({
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
                residentKey: "discouraged",
            },
        },
    });

    return true;
}

export function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
