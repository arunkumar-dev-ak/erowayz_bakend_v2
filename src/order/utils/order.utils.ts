import { BadRequestException } from '@nestjs/common';
import {
  Banner,
  Item,
  OfferType,
  OrderStatus,
  PaymentMethod,
  ProductStatus,
  QuantityUnit,
  Role,
  ShopInfo,
  Staff,
  User,
  Vendor,
} from '@prisma/client';
import { CartItemWithItem } from 'src/cart/utils/cartItem_raw_types.utils';
import * as _ from 'lodash';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { capitalize } from 'src/common/functions/utils';

export function getTotalAndDiscountForItem(item: Item, totalQty: number) {
  const totalAmount = totalQty * item.price;
  const discountedAmount = item.discountPrice
    ? totalQty * item.discountPrice
    : totalAmount;

  return { discountedAmount, totalAmount };
}

export function getBestPrice({
  totalAmount,
  discountedAmount,
  banner,
}: {
  totalAmount: number;
  discountedAmount: number;
  banner?: Banner | null;
}) {
  let finalPrice = discountedAmount;

  if (banner) {
    if (banner.offerType === OfferType.FLAT) {
      finalPrice = totalAmount - banner.offerValue;
    } else if (banner.offerType === OfferType.PERCENTAGE) {
      finalPrice = totalAmount - (banner.offerValue / 100) * totalAmount;
    }
  }

  return finalPrice;
}

export function handleVendorForOrder({
  vendor,
}: {
  vendor: Vendor & {
    shopInfo: ShopInfo | null;
    User: User;
  };
}) {
  if (!vendor.shopInfo || !vendor.shopInfo.isShopOpen) {
    throw new BadRequestException(
      `Apologies for the inconvenience. ${
        vendor.shopInfo?.name ?? 'Shop'
      } is currently Closed`,
    );
  }

  if (!vendor.User.status) {
    throw new BadRequestException(
      `Apologies for the inconvenience. ${vendor.shopInfo?.name} is currently inactive`,
    );
  }
}

export const validatePreferredPaymentType = async ({
  preferredPaymentType,
  vendorId,
  vendorSubscriptionService,
}: {
  preferredPaymentType: PaymentMethod;
  vendorId: string;
  vendorSubscriptionService: VendorSubscriptionService;
}) => {
  const currentSubscription =
    await vendorSubscriptionService.checkCurrentVendorSubscriptionForPlanFeatures(
      { vendorId },
    );

  const planFeatures = currentSubscription.planFeatures as Record<string, any>;
  const paymentModes = planFeatures['paymentModes'] as
    | PaymentMethod[]
    | undefined;
  if (!paymentModes) {
    throw new BadRequestException('Currently vendor is not accepting orders');
  } else if (!paymentModes.includes(preferredPaymentType)) {
    throw new BadRequestException(
      `Currently vendor is not accepting ${capitalize(preferredPaymentType.toString())} mode of payment`,
    );
  }
};

export function handleItemVerification({
  item,
  totalQty,
}: {
  item: Item;
  totalQty: number;
}) {
  if (item.remainingQty < totalQty) {
    throw new BadRequestException(
      `Apologies, the requested quantity (${totalQty}) exceeds the available stock (${item.remainingQty}). Please adjust your Quantity.`,
    );
  }

  if (item.productstatus !== ProductStatus.AVAILABLE) {
    throw new BadRequestException(
      `Sorry for inconvenience, ${item.name} is Unavailable`,
    );
  }
}

export function extractUserAndVendorId(
  user: User & { vendor?: Vendor; staff?: Staff },
) {
  const role = user.role;
  const userId = user.id;
  let vendorId: string | undefined = undefined;

  switch (role) {
    case Role.CUSTOMER:
      break;
    case Role.VENDOR:
      vendorId = user.vendor!.id;
      break;
    case Role.STAFF:
      vendorId = user.staff!.vendorId;
      break;
    default:
      throw new BadRequestException(
        `You don't have permission to change the Status`,
      );
  }

  return { userId, vendorId };
}

export function checkValidStatus({
  userRole,
  currentStatus,
  newStatus,
  statusFlowMap,
}: {
  userRole: Role;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  statusFlowMap: Record<OrderStatus, OrderStatus[]>;
}) {
  if (newStatus === currentStatus) {
    throw new BadRequestException(`Order is already ${newStatus}`);
  }
  if (userRole === Role.CUSTOMER) {
    if (newStatus !== 'CANCELLED') {
      throw new BadRequestException('Customers can only cancel the order');
    }
    if (currentStatus !== 'PENDING') {
      throw new BadRequestException('You can only cancel pending orders');
    }
  } else {
    const allowedStatuses = statusFlowMap[currentStatus];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

export function groupedItem(cartItems: CartItemWithItem[]) {
  const grouped = _.groupBy(
    cartItems,
    (item) => `${item.cartId}_${item.itemId}`,
  );

  const orderItemsData = Object.values(grouped).map((group) => {
    const [baseItem] = group;

    return {
      itemId: baseItem.itemId,
      quantity: baseItem.quantity,
      quantityUnit: baseItem.quantityUnit as QuantityUnit,
      price: baseItem.price,
      discountPrice: baseItem.discountPrice,
      orderItemVendorServiceOption: {
        create: group.map((item) => ({
          vendorServiceOptionId: item.vendorServiceOptionId,
        })),
      },
    };
  });

  return orderItemsData;
}
