import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: LoginDto) {
        return this.authService.signIn(signInDto);
    }


    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('initiate-signup')
    initiateSignup(@Body('email') email: string) {
        return this.authService.initiateSignup(email);
    }

    @Post('verify-email')
    verifyEmail(@Body('email') email: string, @Body('otp') otp: string) {
        return this.authService.verifyEmail(email, otp);
    }
}
