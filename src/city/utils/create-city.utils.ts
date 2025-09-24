import { BadRequestException } from '@nestjs/common';
import { CreateCityDto } from '../dto/create-city-category.dto';
import { Prisma } from '@prisma/client';
import { CityService } from '../city.service';

export const CreateCityUtils = async ({
  body,
  cityService,
}: {
  body: CreateCityDto;
  cityService: CityService;
}) => {
  const { name, status, tamilName } = body;

  const existingCity = await cityService.getCityByName(name);
  if (existingCity) {
    throw new BadRequestException(`Name already exists`);
  }

  const createQuery: Prisma.ShopCityCreateInput = {
    name,
    status,
    tamilName,
  };

  return { createQuery };
};
