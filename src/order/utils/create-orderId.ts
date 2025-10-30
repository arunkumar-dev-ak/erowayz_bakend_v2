import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PrismaService } from 'src/prisma/prisma.service';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function createOrderId(prisma: PrismaService) {
  const istNow = dayjs().tz('Asia/Kolkata'); // current time in IST
  const prefix = `OD${istNow.format('YYMMDD')}`; // Order ID prefix like OD250729

  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: istNow.startOf('day').toDate(), // start of current day
        lt: istNow.endOf('day').toDate(), // end of current day
      },
    },
  });

  const incremented = (count + 1).toString().padStart(3, '0'); // e.g., 001, 002, ...
  return `${prefix}${incremented}`;
}
