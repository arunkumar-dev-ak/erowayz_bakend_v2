import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetBankQueryDto {
  @ApiPropertyOptional({ description: 'Account holder name', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'accountHolderName must not empty' })
  accountHolderName?: string;

  @ApiPropertyOptional({ description: 'Bank account number', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'accountNumber must not empty' })
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'IFSC code of the bank', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'ifscCode must not empty' })
  ifscCode?: string;

  @ApiPropertyOptional({ description: 'Bank name', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'bankName must not empty' })
  bankName?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'vendorId must not empty' })
  vendorId?: string;

  @ApiPropertyOptional({ description: 'Vendor name', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'vendorName must not empty' })
  vendorName?: string;
}
