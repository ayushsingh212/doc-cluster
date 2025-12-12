import { Response, NextFunction } from 'express';
import { CustomOtpRequest } from '../types/customOtpRequest';
import { CustomError } from '../types/customError';
import { prisma } from '../config/prisma.config';

const loginOtp = async (req: CustomOtpRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let { email } = req.body;
        
        if (!email || typeof email !== 'string') {
            next(new CustomError("Email is required", 400));
            return;
        }
        
        email = email.trim().toLowerCase();
        
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            next(new CustomError("User not found", 404));
            return;
        }
        
        if (!user.isVerified) {
            next(new CustomError("User not verified. Please verify your email first.", 403));
            return;
        }
        
        req.type = 'login';
        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        next(new CustomError("Something went wrong", 500, errorMessage));
    }
}

const registerOtp = async (req: CustomOtpRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let { email } = req.body;
        
        if (!email || typeof email !== 'string') {
            next(new CustomError("Email is required", 400));
            return;
        }
        
        email = email.trim().toLowerCase();
        
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            if (existingUser.isVerified) {
                next(new CustomError("Email already registered and verified", 409));
                return;
            } else {
                next(new CustomError("Email already registered but not verified", 409));
                return;
            }
        }
        
        req.type = 'register';
        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        next(new CustomError("Something went wrong", 500, errorMessage));
    }
}

export { loginOtp, registerOtp };