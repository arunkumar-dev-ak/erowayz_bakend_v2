import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PrismaService } from 'src/prisma/prisma.service';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function createBookingId(prisma: PrismaService) {
  const istNow = dayjs().tz('Asia/Kolkata'); // Get current time in IST
  const prefix = `BO${istNow.format('YYMMDD')}`;

  const count = await prisma.booking.count({
    where: {
      createdAt: {
        gte: istNow.startOf('day').toDate(),
        lt: istNow.endOf('day').toDate(),
      },
    },
  });

  const incremented = (count + 1).toString().padStart(3, '0');
  return `${prefix}${incremented}`;
}
