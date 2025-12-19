import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { BonafideService } from './bonafide.service';
import { CreateBonafideDto } from './dto/create-bonafide.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('bonafide')
export class BonafideController {
    constructor(private readonly bonafideService: BonafideService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FilesInterceptor('documents', 5, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    create(@Request() req, @Body() dto: CreateBonafideDto, @UploadedFiles() files: Array<Express.Multer.File>) {
        const filePaths = files ? files.map(f => f.path) : [];
        return this.bonafideService.create(req.user.userId, dto, filePaths);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('reasons')
    getReasons() {
        return this.bonafideService.getReasons();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Request() req) {
        return this.bonafideService.findAll(req.user.role, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('pending')
    findPending(@Request() req) {
        return this.bonafideService.findPending(req.user.role, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/approve')
    approve(@Request() req, @Param('id') id: string) {
        return this.bonafideService.approve(id, req.user.userId, req.user.role);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/reject')
    reject(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
        return this.bonafideService.reject(id, req.user.userId, req.user.role, reason);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/download')
    async download(@Request() req, @Param('id') id: string, @Res() res) {
        const buffer = await this.bonafideService.download(id, req.user.userId, req.user.role);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="bonafide.pdf"',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
