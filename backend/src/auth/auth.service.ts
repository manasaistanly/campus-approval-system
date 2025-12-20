import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) { }

    async signIn(dto: LoginDto) {
        const user = await this.usersService.findOne(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                department: user.department,
                section: user.section,
                year: user.year,
                registerNumber: user.registerNumber,
                fatherName: user.fatherName,
            },
        };
    }

    async initiateSignup(email: string) {
        const existing = await this.usersService.findOne(email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit random OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await this.prisma.otpVerification.upsert({
            where: { email },
            update: { otp, expiresAt, isVerified: false },
            create: { email, otp, expiresAt, isVerified: false },
        });

        console.log(`[DEBUG] OTP for ${email}: ${otp}`);

        // Send OTP via email (try/catch so we don't crash if email fails)
        try {
            await this.notificationService.sendOtp(email, otp);
        } catch (error) {
            console.error(`[WARNING] Failed to send OTP email: ${error.message}`);
        }

        return { message: 'OTP sent to your email.' };
    }

    async verifyEmail(email: string, otp: string) {
        const record = await this.prisma.otpVerification.findUnique({
            where: { email },
        });

        if (!record) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        if (record.expiresAt < new Date()) {
            throw new UnauthorizedException('OTP expired');
        }

        if (record.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        await this.prisma.otpVerification.update({
            where: { email },
            data: { isVerified: true },
        });

        return { message: 'Email verified successfully', verified: true };
    }

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findOne(dto.email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        // Check verification
        const verification = await this.prisma.otpVerification.findUnique({
            where: { email: dto.email }
        });

        if (!verification || !verification.isVerified) {
            throw new UnauthorizedException('Email not verified. Please verify OTP first.');
        }

        const { password, ...rest } = dto;

        const newUser = await this.usersService.createUser({
            ...rest,
            passwordHash: password, // UsersService will hash this
        });

        // Cleanup OTP
        await this.prisma.otpVerification.delete({ where: { email: dto.email } });

        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role,
                department: newUser.department,
                section: newUser.section,
                year: newUser.year,
                registerNumber: newUser.registerNumber,
                fatherName: newUser.fatherName,
            },
        };
    }
    async initiateForgotPassword(email: string) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            // For security, do not reveal if user exists. 
            // But for now, we can throw not found or just return success fake.
            // Let's return success to prevent enumeration, but log internal.
            // Actually, for this internal app, let's be explicit for better UX.
            throw new UnauthorizedException('Email not found');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await this.prisma.otpVerification.upsert({
            where: { email },
            update: { otp, expiresAt, isVerified: false },
            create: { email, otp, expiresAt, isVerified: false },
        });

        console.log(`[DEBUG] Forgot Password OTP for ${email}: ${otp}`);
        await this.notificationService.sendOtp(email, otp);

        return { message: 'OTP sent to your email.' };
    }

    async resetPassword(email: string, otp: string, newPassword: string) {
        const record = await this.prisma.otpVerification.findUnique({
            where: { email },
        });

        if (!record || record.expiresAt < new Date() || record.otp !== otp) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update User
        await this.prisma.user.update({
            where: { email },
            data: { passwordHash },
        });

        // Cleanup OTP
        await this.prisma.otpVerification.delete({ where: { email } });

        return { message: 'Password reset successfully. You can now login.' };
    }
}
