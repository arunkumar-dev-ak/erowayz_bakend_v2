import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFavouriteVendorForCustomerDto {
  @ApiPropertyOptional({
    description: 'Vendor ID of the customer who is marking favorite',
    example: 'vendor-uuid-1234',
  })
  @IsString({ message: 'vendorId must be a string' })
  vendorId: string;
}
