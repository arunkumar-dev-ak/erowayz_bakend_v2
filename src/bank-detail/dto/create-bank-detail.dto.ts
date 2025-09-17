import { ApiProperty } from '@nestjs/swagger';
import { AccountType, BankPlatformType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBankDetailDto {
  @ApiProperty({
    description: 'Name of the account holder',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Account holder name should not be empty' })
  accountHolderName: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '123456789012',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Account number should not be empty' })
  accountNumber: string;

  @ApiProperty({
    description: 'IFSC code of the bank',
    example: 'HDFC0001234',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'IFSC code should not be empty' })
  ifscCode: string;

  @ApiProperty({
    description: 'Name of the bank',
    example: 'HDFC Bank',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Bank name should not be empty' })
  bankName: string;

  @ApiProperty({
    description: 'Branch name of the bank',
    example: 'MG Road Branch',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Branch name should not be empty' })
  branchName: string;

  @ApiProperty({
    description: 'Type of the bank account',
    enum: AccountType,
    example: AccountType.SAVINGS,
    required: true,
  })
  @IsEnum(AccountType, {
    message: `AccountType must be one of: ${Object.values(AccountType).join(', ')}`,
  })
  accountType: AccountType;

  @ApiProperty({
    description: 'Type of the paying platform',
    enum: BankPlatformType,
    example: BankPlatformType.AMAZON_PAY,
    required: true,
  })
  @IsOptional()
  @IsEnum(BankPlatformType, {
    message: `AccountType must be one of: ${Object.values(BankPlatformType).join(', ')}`,
  })
  bankPlatformType?: BankPlatformType;

  @ApiProperty({
    description: 'Linked phone number',
    example: '6578835647',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number should not be empty' })
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  linkedPhoneNumber?: string;

  @ApiProperty({
    description: 'Optional UPI ID linked to the bank account',
    example: 'john.doe@upi',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Upi Id should not be empty, if provided' })
  @IsString()
  @Matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, {
    message: 'UPI ID must be in a valid format (e.g., john.doe@upi)',
  })
  upiId?: string;
}
