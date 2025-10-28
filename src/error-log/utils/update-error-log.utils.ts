import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { UpdateErrorLogDto } from '../dto/update-error-log.dto';
import { ErrorLogService } from '../error-log.service';

export const UpdateErrorLogUtils = async ({
  body,
  errorLogId,
  errorLogService,
}: {
  body: UpdateErrorLogDto;
  errorLogId: string;
  errorLogService: ErrorLogService;
}) => {
  const { errorLogStatus, uploadedFileIds } = body;

  const paymentError = await errorLogService.findErrorLogById(errorLogId);
  if (!paymentError) {
    throw new BadRequestException('Payment Error Not found');
  }

  const updateQuery: Prisma.PaymentErrorLogUpdateInput = {};

  if (uploadedFileIds && uploadedFileIds.length > 0) {
    updateQuery.paymentErrorLogFile = {
      set: [],
      connect: uploadedFileIds.map((id) => ({ id })),
    };
  }

  if (errorLogStatus) {
    updateQuery.status = errorLogStatus;
  }

  return { updateQuery, paymentError };
};
