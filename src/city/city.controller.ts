import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CityService } from './city.service';
import { UpdateCityDto } from './dto/update-city.dto';
import { GetCityQueryDto } from './dto/get-city.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { CreateCityDto } from './dto/create-city-category.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiOperation({ summary: 'Get Cities with filtering & pagination' })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Pagination limit',
  })
  @Get()
  async getCities(@Res() res: Response, @Query() query: GetCityQueryDto) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.cityService.getCity({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new City' })
  @ApiBody({
    description: 'City creation payload',
    type: CreateCityDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Post('/create')
  async createCity(@Res() res: Response, @Body() body: CreateCityDto) {
    return await this.cityService.createCity({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing City' })
  @ApiParam({ name: 'cityId', type: String, description: 'City ID' })
  @ApiBody({
    description: 'City update payload',
    type: UpdateCityDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:cityId')
  async updateCity(
    @Res() res: Response,
    @Body() body: UpdateCityDto,
    @Param('cityId') cityId: string,
  ) {
    return await this.cityService.updateCity({
      res,
      body,
      cityId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a City' })
  @ApiParam({ name: 'cityId', type: String, description: 'City ID' })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:cityId')
  async deleteCity(@Res() res: Response, @Param('cityId') cityId: string) {
    return await this.cityService.deleteCity({
      res,
      cityId,
    });
  }
}
