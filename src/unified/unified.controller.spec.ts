import { UnifiedController } from './unified.controller';

describe('UnifiedController', () => {
  let controller: UnifiedController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getStorefront: jest.fn().mockResolvedValue({
        statusCode: 200,
        message: 'Unified storefront retrieved successfully',
        data: {},
      }),
    };

    controller = new UnifiedController(serviceMock);
  });

  it('calls getStorefront for GET /unified/storefront/:vendorId', async () => {
    const req = { user: { id: 'user-1' } } as any;
    const res = {} as any;
    const query = { offset: 0, limit: 10 };

    await controller.getStorefront('vendor-1', query, req, res);

    expect(serviceMock.getStorefront).toHaveBeenCalledWith({
      vendorId: 'vendor-1',
      query,
      userId: 'user-1',
      res,
    });
  });
});
