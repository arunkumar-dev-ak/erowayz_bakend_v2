import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { VendorService } from 'src/vendor/vendor.service';
import { ItemService } from 'src/item/item.service';
import { KeywordService } from 'src/keyword/keyword.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { ProductUnitService } from 'src/product-unit/product-unit.service';

describe('BannerService', () => {
  let service: BannerService;
  let prismaMock: any;
  let responseMock: any;

  beforeEach(async () => {
    prismaMock = {
      banner: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      item: {
        findMany: jest.fn(),
      },
      bannerItem: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    responseMock = {
      successResponse: jest.fn(({ data }) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ResponseService, useValue: responseMock },
        { provide: MetadataService, useValue: {} },
        { provide: FileUploadService, useValue: {} },
        { provide: VendorService, useValue: {} },
        { provide: ItemService, useValue: {} },
        { provide: KeywordService, useValue: {} },
        { provide: VendorSubscriptionService, useValue: {} },
        { provide: ProductUnitService, useValue: {} },
      ],
    }).compile();

    service = module.get<BannerService>(BannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setBannerItems', () => {
    it('successfully configures combo items for a vendor banner', async () => {
      const bannerId = 'ban-1';
      const vendorId = 'ven-1';
      const items = [
        { itemId: 'item-1', quantity: 1.0 },
        { itemId: 'item-2', quantity: 2.0 },
      ];

      prismaMock.banner.findFirst.mockResolvedValue({ id: bannerId, vendorId });
      prismaMock.item.findMany.mockResolvedValue([
        { id: 'item-1' },
        { id: 'item-2' },
      ]);
      prismaMock.banner.findUnique.mockResolvedValue({
        id: bannerId,
        vendorId,
        bannerItems: [
          { itemId: 'item-1', quantity: 1.0 },
          { itemId: 'item-2', quantity: 2.0 },
        ],
      });

      const res = {} as any;
      await service.setBannerItems({
        bannerId,
        vendorId,
        items,
        res,
      });

      expect(prismaMock.bannerItem.deleteMany).toHaveBeenCalledWith({
        where: { bannerId },
      });
      expect(prismaMock.bannerItem.createMany).toHaveBeenCalledWith({
        data: [
          { bannerId, itemId: 'item-1', quantity: 1.0 },
          { bannerId, itemId: 'item-2', quantity: 2.0 },
        ],
      });
    });

    it('throws BadRequestException if an item does not belong to the vendor', async () => {
      const bannerId = 'ban-1';
      const vendorId = 'ven-1';
      const items = [
        { itemId: 'item-1', quantity: 1.0 },
        { itemId: 'foreign-item', quantity: 1.0 },
      ];

      prismaMock.banner.findFirst.mockResolvedValue({ id: bannerId, vendorId });
      prismaMock.item.findMany.mockResolvedValue([{ id: 'item-1' }]);

      const res = {} as any;
      await expect(
        service.setBannerItems({
          bannerId,
          vendorId,
          items,
          res,
        }),
      ).rejects.toThrow('One or more items do not belong to this vendor');
    });

    it('throws BadRequestException if street food vendor exceeds max items limit', async () => {
      const bannerId = 'ban-1';
      const vendorId = 'ven-1';
      const items = Array.from({ length: 11 }, (_, i) => ({
        itemId: `item-${i + 1}`,
        quantity: 1.0,
      }));

      prismaMock.banner.findFirst.mockResolvedValue({
        id: bannerId,
        vendorId,
        vendor: { vendorType: { type: 'PRODUCT' } },
      });

      const res = {} as any;
      await expect(
        service.setBannerItems({
          bannerId,
          vendorId,
          items,
          res,
        }),
      ).rejects.toThrow('Street food vendors can attach a maximum of 10 products under a combo banner.');
    });
  });
});
