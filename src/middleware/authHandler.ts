import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    username: string;
    role: string;
}

// Augment Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Middleware: Verify JWT and attach user info to request
 */
export const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Missing or invalid token",
                object: null,
                errors: ["Unauthorized"],
            });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "your_default_secret";

        const decoded = jwt.verify(token, secret) as Partial<JwtPayload> & { id?: string };

        // ✅ Normalize payload for consistency
        req.user = {
            userId: decoded.userId || decoded.id || "",
            username: decoded.username || "",
            role: decoded.role || "",
        };

        // Reject if missing critical data
        if (!req.user.userId || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
                object: null,
                errors: ["Token missing required fields"],
            });
        }

        next();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            object: null,
            errors: [message],
        });
    }
};

/**
 * Middleware: Authorize based on roles
 */
export const authorizeRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                    object: null,
                    errors: ["No user info found"],
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access forbidden",
                    object: null,
                    errors: [`Role '${req.user.role}' is not allowed`],
                });
            }

            next();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(403).json({
                success: false,
                message: "Access forbidden",
                object: null,
                errors: [message],
            });
        }
    };
};
