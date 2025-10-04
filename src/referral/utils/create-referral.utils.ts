import { SubscriptionService } from 'src/subscription/subscription.service';
import { CreateReferralDto } from '../dto/create-referral.dto';

export const CreateReferralUtils = ({
  userId,
  body,
  referralCodeUsageLimit,
  subscriptionService,
}: {
  userId: string;
  body: CreateReferralDto;
  referralCodeUsageLimit: number;
  subscriptionService: SubscriptionService;
}) => {
  //check referral code validity
  //check the no of time referralCode is Used
  //check the target user current and future subscription
  //create a subscription
};
