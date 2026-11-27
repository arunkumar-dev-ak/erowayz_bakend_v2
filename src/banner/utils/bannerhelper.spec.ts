import { BadRequestException } from '@nestjs/common';
import { BannerType, OfferType, VendorCategoryType } from '@prisma/client';
import { checkFieldsForBanner } from './bannerhelper';
import { OfferValueConstraint } from '../dto/create-banner.dto';

describe('bannerhelper - checkFieldsForBanner', () => {
  const commonShopVendorType: any = {
    id: 'type-1',
    name: 'Common Store',
    type: VendorCategoryType.BANNER,
  };

  const streetFoodVendorType: any = {
    id: 'type-2',
    name: 'Street Food Stall',
    type: VendorCategoryType.PRODUCT,
  };

  describe('Common Shop (REGULAR banner)', () => {
    it('throws BadRequestException if qty is missing', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            originalPricePerUnit: 100,
            productUnitId: 'unit-1',
            minApplyValue: 50,
            keyWordIds: ['kw-1'],
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if originalPricePerUnit is missing', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            qty: 1,
            productUnitId: 'unit-1',
            minApplyValue: 50,
            keyWordIds: ['kw-1'],
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if productUnitId is missing', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            qty: 1,
            originalPricePerUnit: 100,
            minApplyValue: 50,
            keyWordIds: ['kw-1'],
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if minApplyValue is missing', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            qty: 1,
            originalPricePerUnit: 100,
            productUnitId: 'unit-1',
            keyWordIds: ['kw-1'],
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if keyWordIds is missing', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            qty: 1,
            originalPricePerUnit: 100,
            productUnitId: 'unit-1',
            minApplyValue: 50,
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('passes when all required common shop fields are provided', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.REGULAR,
          body: {
            qty: 2,
            originalPricePerUnit: 150,
            productUnitId: 'unit-1',
            minApplyValue: 100,
            keyWordIds: ['kw-1'],
          } as any,
          vendorType: commonShopVendorType,
        }),
      ).not.toThrow();
    });
  });

  describe('Street Food (PRODUCT combo banner)', () => {
    it('passes when qty, productUnitId, originalPricePerUnit, minApplyValue, and keyWordIds are omitted', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.PRODUCT,
          body: {} as any,
          vendorType: streetFoodVendorType,
        }),
      ).not.toThrow();
    });

    it('throws BadRequestException if qty is provided for street food banner', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.PRODUCT,
          body: { qty: 2 } as any,
          vendorType: streetFoodVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if originalPricePerUnit is provided for street food banner', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.PRODUCT,
          body: { originalPricePerUnit: 50 } as any,
          vendorType: streetFoodVendorType,
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException if productUnitId is provided for street food banner', () => {
      expect(() =>
        checkFieldsForBanner({
          bannerType: BannerType.PRODUCT,
          body: { productUnitId: 'unit-1' } as any,
          vendorType: streetFoodVendorType,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('OfferValueConstraint', () => {
    const validator = new OfferValueConstraint();

    it('validates PERCENTAGE offerValue < 100', () => {
      expect(
        validator.validate(25, {
          object: { offerType: OfferType.PERCENTAGE },
        } as any),
      ).toBe(true);

      expect(
        validator.validate(100, {
          object: { offerType: OfferType.PERCENTAGE },
        } as any),
      ).toBe(false);
    });

    it('validates FLAT offerValue < minApplyValue when minApplyValue is set', () => {
      expect(
        validator.validate(40, {
          object: { offerType: OfferType.FLAT, minApplyValue: 50 },
        } as any),
      ).toBe(true);

      expect(
        validator.validate(60, {
          object: { offerType: OfferType.FLAT, minApplyValue: 50 },
        } as any),
      ).toBe(false);
    });

    it('validates FLAT offerValue when minApplyValue is omitted (street food banner)', () => {
      expect(
        validator.validate(40, {
          object: { offerType: OfferType.FLAT },
        } as any),
      ).toBe(true);
    });
  });
});
