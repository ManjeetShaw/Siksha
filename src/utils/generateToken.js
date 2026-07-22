import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion || 0,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
};

export default generateToken;
