import { BadRequestException } from '@nestjs/common';
import { CityService } from '../city.service';

export const DeleteCityUtils = async ({
  cityId,
  cityService,
}: {
  cityId: string;
  cityService: CityService;
}) => {
  const existingCity = await cityService.getCityById(cityId);
  if (!existingCity) {
    throw new BadRequestException('City not found');
  }

  const cityWithLicense = await cityService.checkCityHasShop(cityId);
  if (cityWithLicense) {
    throw new BadRequestException(
      'Vendor Utilized license category.You cannot delete',
    );
  }
};
