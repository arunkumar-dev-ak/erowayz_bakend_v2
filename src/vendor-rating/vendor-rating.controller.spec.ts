import { VendorRatingController } from './vendor-rating.controller';

describe('VendorRatingController', () => {
  let controller: VendorRatingController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getVendorRatings: jest.fn().mockResolvedValue({
        statusCode: 200,
        message: 'Vendor ratings and reviews retrieved successfully',
        data: {},
      }),
      upsertRating: jest.fn(),
    };

    controller = new VendorRatingController(serviceMock);
  });

  it('calls getVendorRatings for unified GET /vendor-rating/vendor/:vendorId', async () => {
    const req = { user: { id: 'usr-1' } } as any;
    const res = {} as any;
    const query = { offset: 0, limit: 10 };

    await controller.getVendorRatings(req, res, 'vendor-uuid-1', query);

    expect(serviceMock.getVendorRatings).toHaveBeenCalledWith({
      vendorId: 'vendor-uuid-1',
      query,
      userId: 'usr-1',
      res,
    });
  });
});
