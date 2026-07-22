import jwt from "jsonwebtoken";            
import User from "../models/User.js";    

export const admin = (req, res, next) => {
    if(!req.user) {
        return res.status(401).json({
            message: "Not authorizer, no user"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Not authorised as admin",
        });
    }
    next();
};

export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized, user not found"
            });
        }

        // If the token was issued before the user's last password change,
        // reject it — this is what actually invalidates other sessions.
        if ((decoded.tokenVersion ?? 0) !== (req.user.tokenVersion ?? 0)) {
            return res.status(401).json({
                message: "Session expired, please log in again"
            });
        }

        next();
    } catch (error) {
        console.error(error);
        
        res.status(401).json({
            message: "Not authorized, token failed"
        });
    }
};