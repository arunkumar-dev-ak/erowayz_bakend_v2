import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { resolveAndValidateVendorReportTarget } from './create-vendor-report.utils';
import { VendorReportTargetConstraint } from '../dto/create-vendor-report.dto';

describe('create-vendor-report.utils', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      order: {
        findFirst: jest.fn(),
      },
      booking: {
        findFirst: jest.fn(),
      },
    };
  });

  describe('VendorReportTargetConstraint', () => {
    const validator = new VendorReportTargetConstraint();

    it('validates true when orderId is provided and bookingId is omitted', () => {
      const isValid = validator.validate(null, {
        object: { orderId: 'ord-123' },
      } as any);
      expect(isValid).toBe(true);
    });

    it('validates true when bookingId is provided and orderId is omitted', () => {
      const isValid = validator.validate(null, {
        object: { bookingId: 'bkg-123' },
      } as any);
      expect(isValid).toBe(true);
    });

    it('validates false when both orderId and bookingId are provided', () => {
      const isValid = validator.validate(null, {
        object: { orderId: 'ord-123', bookingId: 'bkg-123' },
      } as any);
      expect(isValid).toBe(false);
    });

    it('validates false when neither orderId nor bookingId are provided', () => {
      const isValid = validator.validate(null, {
        object: {},
      } as any);
      expect(isValid).toBe(false);
    });
  });

  describe('resolveAndValidateVendorReportTarget (Booking flow)', () => {
    it('successfully resolves banner booking when vendor owns the banner', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'booking-uuid-1',
        bannerBooking: { vendorId: 'vendor-123' },
        serviceBooking: [],
        vendorReport: null,
      });

      const result = await resolveAndValidateVendorReportTarget({
        prisma: prismaMock,
        vendorId: 'vendor-123',
        body: { bookingId: 'booking-uuid-1', reason: 'Customer never answered' },
      });

      expect(result).toEqual({
        orderId: null,
        bookingId: 'booking-uuid-1',
        trimmedReason: 'Customer never answered',
      });
    });

    it('successfully resolves service booking when vendor owns the service', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'booking-uuid-2',
        bannerBooking: null,
        serviceBooking: [
          {
            vendorSubService: {
              service: { vendorId: 'vendor-123' },
            },
          },
        ],
        vendorReport: null,
      });

      const result = await resolveAndValidateVendorReportTarget({
        prisma: prismaMock,
        vendorId: 'vendor-123',
        body: { bookingId: 'booking-uuid-2', reason: 'Customer cancelled at doorstep' },
      });

      expect(result).toEqual({
        orderId: null,
        bookingId: 'booking-uuid-2',
        trimmedReason: 'Customer cancelled at doorstep',
      });
    });

    it('throws ForbiddenException if vendor does not own the booking', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'booking-uuid-2',
        bannerBooking: { vendorId: 'other-vendor' },
        serviceBooking: [],
        vendorReport: null,
      });

      await expect(
        resolveAndValidateVendorReportTarget({
          prisma: prismaMock,
          vendorId: 'vendor-123',
          body: { bookingId: 'booking-uuid-2', reason: 'Some reason' },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException if booking already has a vendor report', async () => {
      prismaMock.booking.findFirst.mockResolvedValue({
        id: 'booking-uuid-2',
        bannerBooking: { vendorId: 'vendor-123' },
        serviceBooking: [],
        vendorReport: { id: 'report-exists' },
      });

      await expect(
        resolveAndValidateVendorReportTarget({
          prisma: prismaMock,
          vendorId: 'vendor-123',
          body: { bookingId: 'booking-uuid-2', reason: 'Some reason' },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
