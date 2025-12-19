import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(data.passwordHash, salt);
        return this.prisma.user.create({
            data: {
                ...data,
                passwordHash: hash,
            },
        });
    }

    async updateRole(userId: string, role: string) {
        // Cast role string to enum if valid
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: role as any }, // unsafe cast but works if validated in controller
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            orderBy: { email: 'asc' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                department: true,
                section: true,
            }
        });
    }
}
