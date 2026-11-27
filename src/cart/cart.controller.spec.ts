import { CartController } from './cart.controller';

describe('CartController', () => {
  let controller: CartController;
  let cartServiceMock: any;

  beforeEach(() => {
    cartServiceMock = {
      getAllCartsByUser: jest.fn(),
      getCartItemByUser: jest.fn(),
      getCartItemById: jest.fn(),
      addCartItem: jest.fn(),
      updateCartItemQty: jest.fn(),
      updateCartItemService: jest.fn(),
      deleteCartItemById: jest.fn(),
      deleteCartById: jest.fn(),
    };

    controller = new CartController(cartServiceMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
