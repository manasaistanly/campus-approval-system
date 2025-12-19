import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PdfModule } from './pdf/pdf.module';
import { BonafideModule } from './bonafide/bonafide.module';
import { ScholarshipModule } from './scholarship/scholarship.module';
import { NotificationModule } from './notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'uploads'), // Assuming dist/src/.. -> root -> uploads
            serveRoot: '/uploads',
        }),
        AuthModule,
        UsersModule,
        PrismaModule,
        PdfModule,
        BonafideModule,
        ScholarshipModule,
        NotificationModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
