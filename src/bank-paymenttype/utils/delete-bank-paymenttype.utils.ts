import { BadRequestException } from '@nestjs/common';
import { BankPaymenttypeService } from '../bank-paymenttype.service';

export const DeletePaymentTypeUtils = async ({
  bankPaymentTypeId,
  bankPaymentTypeService,
}: {
  bankPaymentTypeId: string;
  bankPaymentTypeService: BankPaymenttypeService;
}) => {
  const existingPaymentType =
    await bankPaymentTypeService.getBankPaymentTypeById(bankPaymentTypeId);
  if (!existingPaymentType) {
    throw new BadRequestException('PaymentType not found');
  }

  const bankPaymentTypeWithLicense =
    await bankPaymentTypeService.checkBankPaymentTypeHasShop(bankPaymentTypeId);
  if (bankPaymentTypeWithLicense) {
    throw new BadRequestException(
      'Vendor Utilized In Bank Detail.You cannot delete',
    );
  }
};
