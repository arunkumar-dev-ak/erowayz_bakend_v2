import { BadRequestException } from '@nestjs/common';
import { UpdateCityDto } from '../dto/update-city.dto';
import { Prisma } from '@prisma/client';
import { CityService } from '../city.service';

export const UpdateCityUtils = async ({
  body,
  cityService,
  cityId,
}: {
  body: UpdateCityDto;
  cityService: CityService;
  cityId: string;
}) => {
  const { name, status, tamilName } = body;

  const existingCity = await cityService.getCityById(cityId);
  if (!existingCity) {
    throw new BadRequestException('City not found');
  }

  if (name) {
    const existingCity = await cityService.getCityByName(name);
    if (existingCity && existingCity.id !== cityId) {
      throw new BadRequestException(`Name already exists`);
    }

    const cityInLicense = await cityService.checkCityHasShop(cityId);
    if (cityInLicense) {
      throw new BadRequestException(
        'License Category utilized by vendor.Cant update name',
      );
    }
  }

  const updateQuery: Prisma.ShopCityUpdateInput = {};

  if (name !== undefined) {
    updateQuery.name = name;
  }

  if (tamilName !== undefined) {
    updateQuery.tamilName = tamilName;
  }

  if (status !== undefined) {
    updateQuery.status = status;
  }

  return { updateQuery };
};
