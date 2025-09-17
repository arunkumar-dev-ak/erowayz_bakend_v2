import { BadRequestException } from '@nestjs/common';
import { UpdatedBankDetailDto } from '../dto/update-bank-detail.dto';
import { BankDetailService } from '../bank-detail.service';
import { Prisma } from '@prisma/client';

export const bankDetailUpdateUtils = async ({
  body,
  vendorId,
  bankDetailService,
  bankDetailId,
}: {
  body: UpdatedBankDetailDto;
  vendorId: string;
  bankDetailService: BankDetailService;
  bankDetailId: string;
}) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    branchName,
    accountType,
    upiId,
    linkedPhoneNumber,
    bankPlatformType,
  } = body;

  // Check if bank detail exists
  const existingBankDetails =
    await bankDetailService.checkBankDetailsById(bankDetailId);
  if (!existingBankDetails) {
    throw new BadRequestException('BankDetails not found');
  }
  if (existingBankDetails.vendorId !== vendorId) {
    throw new BadRequestException('Vendor does not match to update the record');
  }

  const updateQuery: Prisma.BankDetailUpdateInput = {};

  if (accountHolderName !== undefined) {
    updateQuery.accountHolderName = accountHolderName;
  }
  if (accountNumber !== undefined) {
    updateQuery.accountNumber = accountNumber;
  }
  if (ifscCode !== undefined) {
    updateQuery.ifscCode = ifscCode;
  }
  if (bankName !== undefined) {
    updateQuery.bankName = bankName;
  }
  if (branchName !== undefined) {
    updateQuery.branchName = branchName;
  }
  if (accountType !== undefined) {
    updateQuery.accountType = accountType;
  }
  if (upiId !== undefined) {
    updateQuery.upiId = upiId;
  }
  if (linkedPhoneNumber !== undefined) {
    updateQuery.linkedPhoneNumber = linkedPhoneNumber;
  }
  if (bankPlatformType !== undefined) {
    updateQuery.bankPlatformType = bankPlatformType;
  }

  return { updateQuery };
};
