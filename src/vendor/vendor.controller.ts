import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Request, Response } from 'express';
import { LogoutDto } from './dto/logout.dto';
import { TestRegisterVendorDto } from './dto/testregistervendor.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  extractUserFromRequest,
  extractUserIdFromRequest,
} from 'src/common/functions/extractUserId';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TestVendorLoginDto } from 'src/auth/dto/testvendorlogin.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, User } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { GetPopularVendorQueryDto } from './dto/get-popularvendor-query.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { GetVendorQueryDto } from './dto/get-vendor-query.dto';
import { GetHomePageQueryDto } from './dto/get-home-page-query.dto';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import { GetVendorQueryForAdminDto } from './dto/get-vendor-admin-query.dto';
import { TempRegisterVendorDto } from './dto/temp-registervendor.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';

@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('getAllVendors')
  @ApiOperation({ summary: 'Retrieve all registered vendors' })
  @UseGuards(FetchUserGuard)
  async getAllVendors(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetVendorQueryDto,
  ) {
    const user: User | undefined = extractUserFromRequest(req);
    await this.vendorService.getAllVendor({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
      userId: user?.id || undefined,
    });
  }

  @Get('getAllVendors/admin')
  @ApiOperation({ summary: 'Retrieve all registered vendors' })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async getAllVendorsForAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetVendorQueryForAdminDto,
  ) {
    await this.vendorService.getVendorForAdmin({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }

  @Get('homePage')
  async getForHomePage(
    @Res() res: Response,
    @Query() query: GetHomePageQueryDto,
  ) {
    await this.vendorService.getVendorForHomePage({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }

  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('getVendorByVendorId')
  async getVendorByVendorId(@Req() req: Request, @Res() res: Response) {
    const vendorId = extractVendorIdFromRequest(req);
    await this.vendorService.getVendorByVendorId({ res, vendorId });
  }

  @ApiOperation({ summary: 'Get Popular vendors with filtering options' })
  @Get('popular')
  @UseGuards(FetchUserGuard)
  async getPopularProductBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetPopularVendorQueryDto,
  ) {
    const user: User | undefined = extractUserFromRequest(req);
    return await this.vendorService.getPopularVendor({
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
      res,
      userId: user?.id || undefined,
    });
  }

  @Post('tempRegister')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shopImageRef', maxCount: 1 },
      { name: 'vendorImageRef', maxCount: 1 },
      { name: 'licenseImage', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register a new vendor with images' })
  async tempRegisterVendor(
    @Res() res: Response,
    @UploadedFiles()
    files: {
      shopImageRef?: Express.Multer.File[];
      vendorImageRef?: Express.Multer.File[];
      licenseImage?: Express.Multer.File[];
    },
    @Body() body: TempRegisterVendorDto,
  ) {
    const shopImage = files.shopImageRef?.[0];
    const vendorImage = files.vendorImageRef?.[0];
    const licenseImage = files.licenseImage?.[0];

    if (!shopImage) throw new BadRequestException('Shop Image Ref is required');
    if (!vendorImage)
      throw new BadRequestException('Vendor Image Ref is required');
    if (!licenseImage)
      throw new BadRequestException(`License Image is required`);

    await this.vendorService.tempRegister({
      res,
      body,
      shopImageRef: shopImage,
      vendorImageRef: vendorImage,
      licenseImageRef: licenseImage,
    });
  }

  @Post('register/validate-otp')
  @ApiOperation({ summary: 'Register a new vendor with images' })
  async registerVendor(@Res() res: Response, @Body() body: RegisterVendorDto) {
    await this.vendorService.RegisterVendor({
      res,
      body,
    });
  }

  @Put('update')
  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('vendorImageRef'))
  @ApiConsumes('multipart/form-data')
  async updateVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateVendorDto,
    @UploadedFile() vendorImageRef: Express.Multer.File,
  ) {
    const userId = extractUserIdFromRequest(req);
    const vendorId = extractVendorIdFromRequest(req);

    await this.vendorService.updateVendor({
      body,
      res,
      vendorImageRef,
      vendorId,
      userId,
    });
  }

  // @Post('login')
  // @ApiOperation({ summary: 'Login as a vendor' })
  // @UsePipes(new ValidationPipe())
  // async loginVendor(@Res() res: Response, @Body() body: LoginVendorDto) {
  //   await this.vendorService.LoginVendor({ res, body });
  // }

  @Post('logout')
  @ApiOperation({ summary: 'Logout from the current device' })
  @UsePipes(new ValidationPipe())
  async logout(@Res() res: Response, @Body() body: LogoutDto) {
    await this.vendorService.logout({ res, token: body.refreshToken });
  }

  @Post('logout-on-all-device')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async logoutOnAllDevice(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    return await this.vendorService.logoutOnAllDevice({ res, userId });
  }

  @Post('test-register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shopImageRef', maxCount: 1 },
      { name: 'vendorImageRef', maxCount: 1 },
      { name: 'licenseImage', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Test vendor registration with images' })
  @UsePipes(new ValidationPipe())
  async testRegisterUser(
    @Res() res: Response,
    @Body() body: TestRegisterVendorDto,
    @UploadedFiles()
    files: {
      shopImageRef?: Express.Multer.File[];
      vendorImageRef?: Express.Multer.File[];
      licenseImage?: Express.Multer.File[];
    },
  ) {
    const shopImage = files.shopImageRef?.[0];
    const vendorImage = files.vendorImageRef?.[0];
    const licenseImage = files.licenseImage?.[0];

    if (!shopImage) throw new BadRequestException('Shop Image Ref is required');
    if (!vendorImage)
      throw new BadRequestException('Vendor Image Ref is required');
    if (!licenseImage)
      throw new BadRequestException(`License Image is required`);

    await this.vendorService.testRegisterUser({
      res,
      body,
      shopImageRef: shopImage,
      vendorImageRef: vendorImage,
      licenseImage,
    });
  }

  @Post('test-login')
  @ApiOperation({ summary: 'Test vendor login' })
  async testLogin(@Res() res: Response, @Body() body: TestVendorLoginDto) {
    await this.vendorService.TestLoginVendor({ res, body });
  }
}
