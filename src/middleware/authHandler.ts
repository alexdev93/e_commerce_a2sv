import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    username: string;
    role: string;
}

// Augment Express Request type to include `user`
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Middleware to verify JWT token
 */
export const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.json({
                success: false,
                message: "Missing or invalid token",
                object: null,
                errors: ["Unauthorized"]
            });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "your_default_secret";

        const decoded = jwt.verify(token, secret) as JwtPayload;

        console.log("decoded token: ", decoded);


        // Attach user info to request object
        req.user = decoded;

        console.log("req.user: ", req.user);
        next();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.json({
            success: false,
            message: "Invalid token",
            object: null,
            errors: [message]
        });
    }
};

/**
 * Middleware factory to authorize by roles
 * @param roles array of roles allowed to access the route
 */
export const authorizeRoles = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.json({
                    success: false,
                    message: "Unauthorized",
                    object: null,
                    errors: ["No user info found"]
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.json({
                    success: false,
                    message: "Access forbidden",
                    object: null,
                    errors: ["Forbidden"]
                });
            }
            next();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return res.json({
                success: false,
                message: "Access forbidden",
                object: null,
                errors: [message]
            });
        }
    };
};

