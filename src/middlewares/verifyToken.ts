import { CustomError } from "../types/customError";
import { CustomRequest } from "../types/customRequest";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma.config";

interface DecodedToken {
    userId: string;
    version: string;
}

const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new CustomError("Unauthorized - No token provided", 401));
        return;
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        next(new CustomError("Unauthorized - Invalid token format", 401));
        return;
    }
    
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    
    if (!accessTokenSecret) {
        next(new CustomError("Server configuration error", 500));
        return;
    }
    
    try {
        const decoded = jwt.verify(token, accessTokenSecret) as DecodedToken;
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user) {
            next(new CustomError("Unauthorized - User not found", 401));
            return;
        }
        
        if (user.version !== decoded.version) {
            next(new CustomError("Unauthorized - Invalid token version", 401));
            return;
        }
        
        req.user = {
            id: user.id,
            version: user.version
        };
        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new CustomError("Unauthorized - Token expired", 401));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new CustomError("Unauthorized - Invalid token", 401));
        } else {
            next(new CustomError("Unauthorized", 401));
        }
    }
}

export default verifyToken;
export { verifyToken };