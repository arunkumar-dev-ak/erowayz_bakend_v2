import { BadRequestException } from '@nestjs/common';
import { BankNameNameService } from '../bank-name.service';

export const DeleteBankNameUtils = async ({
  bankNameId,
  bankNameService,
}: {
  bankNameId: string;
  bankNameService: BankNameNameService;
}) => {
  const existingBankName = await bankNameService.getBankNameById(bankNameId);
  if (!existingBankName) {
    throw new BadRequestException('BankName not found');
  }

  const bankNameWithBankDetial =
    await bankNameService.checkBankNameHasBankDetail(bankNameId);
  if (bankNameWithBankDetial) {
    throw new BadRequestException(
      'Vendor Utilized Bank Name.You cannot delete',
    );
  }
};
