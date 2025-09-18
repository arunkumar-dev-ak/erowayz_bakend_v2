import { BadRequestException } from '@nestjs/common';
import { UpdatedBankDetailDto } from '../dto/update-bank-detail.dto';
import { BankDetailService } from '../bank-detail.service';
import { Prisma, Status } from '@prisma/client';
import { BankNameNameService } from 'src/bank-name/bank-name.service';
import { BankPaymenttypeService } from 'src/bank-paymenttype/bank-paymenttype.service';

export const bankDetailUpdateUtils = async ({
  body,
  vendorId,
  bankDetailService,
  bankDetailId,
  bankNameService,
  bankPaymentTypeService,
}: {
  body: UpdatedBankDetailDto;
  vendorId: string;
  bankDetailService: BankDetailService;
  bankDetailId: string;
  bankNameService: BankNameNameService;
  bankPaymentTypeService: BankPaymenttypeService;
}) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankNameId,
    branchName,
    accountType,
    upiId,
    linkedPhoneNumber,
    bankPaymentTypeId,
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
  if (bankNameId) {
    const existingBankName = await bankNameService.getBankNameById(bankNameId);
    if (!existingBankName || existingBankName.status === Status.INACTIVE) {
      throw new BadRequestException('Bank Name Not found or Inactive');
    }
  }
  if (bankPaymentTypeId) {
    const banPaymentType =
      await bankPaymentTypeService.getBankPaymentTypeById(bankPaymentTypeId);
    if (!banPaymentType) {
      throw new BadRequestException('Bank Payment Type not found');
    }
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
  if (bankNameId !== undefined) {
    updateQuery.bankNameRel = {
      connect: {
        id: bankNameId,
      },
    };
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
  if (bankPaymentTypeId !== undefined) {
    updateQuery.bankPaymentRel = {
      connect: {
        id: bankPaymentTypeId,
      },
    };
  }

  return { updateQuery };
};
