import { getVendorAvgRating } from './get-vendor.utils';

describe('getVendorAvgRating', () => {
  it('aggregates overallRating from VendorRating and attaches overallRating, avgRating, and totalRatings', async () => {
    const vendors = [
      { id: 'ven-1', name: 'Vendor 1' },
      { id: 'ven-2', name: 'Vendor 2' },
      { id: 'ven-3', name: 'Vendor 3' },
    ] as any[];

    const prismaMock = {
      vendorRating: {
        groupBy: jest.fn().mockResolvedValue([
          {
            vendorId: 'ven-1',
            _avg: { overallRating: 4.6333 },
            _count: { _all: 15 },
          },
        ]),
      },
      review: {
        groupBy: jest.fn().mockResolvedValue([
          {
            vendorId: 'ven-2',
            _avg: { rating: 3.8 },
            _count: { _all: 5 },
          },
        ]),
      },
    } as any;

    const result = await getVendorAvgRating({
      vendors,
      prisma: prismaMock,
    });

    expect(result).toHaveLength(3);

    // Vendor 1 from VendorRating
    expect(result[0].overallRating).toBe(4.6);
    expect(result[0].avgRating).toBe(4.6);
    expect(result[0].totalRatings).toBe(15);

    // Vendor 2 from fallback Review
    expect(result[1].overallRating).toBe(3.8);
    expect(result[1].avgRating).toBe(3.8);
    expect(result[1].totalRatings).toBe(5);

    // Vendor 3 unrated
    expect(result[2].overallRating).toBeNull();
    expect(result[2].avgRating).toBeNull();
    expect(result[2].totalRatings).toBe(0);
  });

  it('returns empty array when vendors array is empty', async () => {
    const prismaMock = {
      vendorRating: { groupBy: jest.fn() },
      review: { groupBy: jest.fn() },
    } as any;

    const result = await getVendorAvgRating({
      vendors: [],
      prisma: prismaMock,
    });

    expect(result).toEqual([]);
    expect(prismaMock.vendorRating.groupBy).not.toHaveBeenCalled();
  });
});
