import axios, { AxiosError } from 'axios';
import {
  WhatsappErrorResponse,
  WhatsappResponseInterface,
} from '../auth.service';
import { BadRequestException } from '@nestjs/common';

export async function ResendOtpUtils(
  mobile: string,
  otpRequestUrl: string,
  signatureHash: string,
  integrationToken: string,
) {
  try {
    const whatsappResponse = await axios.post<WhatsappResponseInterface>(
      otpRequestUrl,

      {
        phoneNumber: `+91${mobile}`,
        signatureHash,
      },
      {
        headers: {
          'integration-token': `${integrationToken}`,
        },
      },
    );

    const { sessionId, expiresAt } = whatsappResponse.data.data;

    if (!sessionId || !expiresAt) {
      throw new Error('Failed to get Otp from whatsapp');
    }

    return { sessionId, expiresAt };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<WhatsappErrorResponse>;
      if (axiosError.response?.data.message) {
        throw new BadRequestException(axiosError.response?.data?.message);
      }
    }
    throw new BadRequestException('Failed to send OTP via WhatsApp');
  }
}
