import { Controller, Get, UseGuards, Request, NotFoundException, Patch, Body, Param, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Only Admins can view users');
        }
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.usersService.findOne(req.user.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            section: user.section,
            year: user.year,
            registerNumber: user.registerNumber,
            fatherName: user.fatherName,
            quota: user.quota,
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/role')
    async updateRole(@Request() req, @Param('id') id: string, @Body('role') role: string) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Only Admins can assign roles');
        }
        return this.usersService.updateRole(id, role);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/quota')
    async updateQuota(@Request() req, @Param('id') id: string, @Body('quota') quota: string) {
        if (req.user.userId !== id && req.user.role !== 'ADMIN') {
            throw new ForbiddenException('You can only update your own quota');
        }
        return this.usersService.updateQuota(id, quota);
    }
}
