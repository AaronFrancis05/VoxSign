import { createRemoteJWKSet, jwtVerify } from "jose";
const JWKS_URL = process.env.NEON_AUTH_JWKS_URL;
let jwks = null;
function getJWKS() {
    if (!jwks && JWKS_URL) {
        jwks = createRemoteJWKSet(new URL(JWKS_URL));
    }
    return jwks;
}
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const jwksInstance = getJWKS();
    if (!jwksInstance) {
        return res.status(500).json({ message: "Auth not configured" });
    }
    try {
        const { payload } = await jwtVerify(token, jwksInstance);
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
//# sourceMappingURL=auth.js.map