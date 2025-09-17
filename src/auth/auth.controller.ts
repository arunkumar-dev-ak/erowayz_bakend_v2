import {
  BadRequestException,
  Body,
  Controller,
  NotAcceptableException,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RefreshTokenDto } from './dto/logout.dto';
import { AccessTokenDto } from './dto/acesstoken.dto';
import { LoginDto } from './dto/login.dto';
import { TestRegisterDto } from './dto/testregister.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { User } from '@prisma/client';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TempRegisterDto } from './dto/temp-register.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('tempRegister')
  @UseInterceptors(FileInterceptor('imageRef'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account. Requires an image upload.',
  })
  @UsePipes(new ValidationPipe())
  async registerUser(
    @Res() res: Response,
    @Body() body: TempRegisterDto,
    @UploadedFile() imageRef: Express.Multer.File,
  ) {
    if (!imageRef) {
      throw new BadRequestException('Image Ref is required');
    }
    return await this.authService.tempRegister({ res, body, imageRef });
  }

  @Post('register/validate-otp')
  @ApiOperation({ summary: 'Register a new vendor with images' })
  async registerCustomer(
    @Res() res: Response,
    @Body() body: RegisterCustomerDto,
  ) {
    await this.authService.RegisterCustomer({
      res,
      body,
    });
  }

  @Post('resendOtp')
  @ApiOperation({ summary: 'Register a new vendor with images' })
  async resendOtp(@Res() res: Response, @Body() body: ResendOtpDto) {
    await this.authService.resendOtp({
      res,
      body,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Verifies user credentials and returns an authentication token.',
  })
  @UsePipes(new ValidationPipe())
  async loginUser(@Res() res: Response, @Body() body: LoginDto) {
    return await this.authService.loginUser({ res, body });
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Verifies user credentials and returns an authentication token.',
  })
  @UsePipes(new ValidationPipe())
  async verifyOtp(@Res() res: Response, @Body() body: VerifyOtpDto) {
    return await this.authService.verifyOtp({ res, body });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a refresh token. Authentication required.',
  })
  @UsePipes(new ValidationPipe())
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AccessTokenDto,
  ) {
    const user: User | null = req['user'] as User | null;
    if (!user) {
      throw new NotAcceptableException('Refresh token is not valid');
    }
    return await this.authService.getAccessByRefreshToken({
      user,
      res,
      token: body.refreshToken,
    });
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Invalidates the refresh token, logging the user out of the current session.',
  })
  @UsePipes(new ValidationPipe())
  async logout(@Res() res: Response, @Body() body: RefreshTokenDto) {
    return await this.authService.logout({ res, body });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('logout-on-all-device')
  @UsePipes(new ValidationPipe())
  async logoutOnAllDevice(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    return await this.authService.logoutOnAllDevice({ res, userId });
  }

  @Post('test-register')
  @ApiOperation({
    summary: 'Register test user',
    description: 'Creates a test user account. Requires an image upload.',
  })
  @UseInterceptors(FileInterceptor('imageRef'))
  @ApiConsumes('multipart/form-data')
  @UsePipes(new ValidationPipe())
  async registerTestUser(
    @Res() res: Response,
    @Body() body: TestRegisterDto,
    @UploadedFile() imageRef?: Express.Multer.File,
  ) {
    return await this.authService.testRegister({ res, body, imageRef });
  }
}
