import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Response } from 'express';
import { GetBloodDetailsQueryDto } from './dto/get-blood-details-query.dto';
import {
  buildBloodDetailsWhereFilter,
  includeBloodDetails,
} from './utils/get-bloodetails.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { RequestBloodDetailDto } from './dto/request-blood-details.dto';
import {
  checkDynamicFieldForBloodRequest,
  RequestBloodDetailsVerification,
} from './utils/request-blood-details.utils';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { GetAdminBloodDetailQueryDto } from './dto/get-blood-detail-admin.dto';
import { GetBloodDetailAdminUtils } from './utils/get-blood-detail-admin.utils';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { BloodVerificationStatus } from '@prisma/client';
import {
  AdminBloodVerificationAction,
  VerifyBloodRequestDto,
} from './dto/verify-blood-request.dto';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';

@Injectable()
export class BloodDetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
    @Optional()
    private readonly firebaseNotificationService?: FirebaseNotificationService,
  ) {}

  /*----- blood details -----*/
  async getBloodDetail({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetBloodDetailsQueryDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = buildBloodDetailsWhereFilter({
      query,
    });

    const totalCount = await this.prisma.bloodDetails.count({ where });

    const bloodDetails = await this.prisma.bloodDetails.findMany({
      where,
      include: includeBloodDetails(userId),
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      id: query.id,
      userName: query.userName,
      bloodGroup: query.bloodGroup,
      isDonor: 'true',
      land: query.land,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'blood-details',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      meta,
      message: 'BloodDetails retrieved successfully',
      statusCode: 200,
    });
  }

  async getBloodDetailRequest({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetAdminBloodDetailQueryDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const { where } = GetBloodDetailAdminUtils({
      query,
    });

    const totalCount = await this.prisma.bloodRequest.count({ where });

    const bloodRequest = await this.prisma.bloodRequest.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            mobile: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            mobile: true,
          },
        },
      },
    });

    const {
      startDate,
      endDate,
      requesterName,
      donorName,
      verificationStatus,
      documentType,
    } = query;

    const queries = buildQueryParams({
      startDate,
      endDate,
      requesterName,
      donorName,
      verificationStatus,
      documentType,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'blood-details/blood-request',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodRequest,
      meta,
      message: 'BloodRequest retrieved successfully',
      statusCode: 200,
    });
  }

  async updateDonorStatus({
    res,
    body,
    userId,
  }: {
    res: Response;
    body: UpdateDonorDto;
    userId: string;
  }) {
    const initialDate = new Date();

    const { isDonor } = body;

    const existingBloodDetails = await this.findBloodDetailsByUser(userId);
    if (!existingBloodDetails) {
      throw new BadRequestException(
        'None of the blood details found for this user',
      );
    }

    const bloodDetails = await this.prisma.bloodDetails.update({
      where: {
        id: existingBloodDetails.id,
      },
      data: {
        isDonor: TrueOrFalseMap[isDonor],
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      message: `Donor status change to ${isDonor} successfully`,
      statusCode: 200,
    });
  }

  async removeBloodDetail({ userId, res }: { userId: string; res: Response }) {
    const initialDate = new Date();

    const existingBloodDetails = await this.findBloodDetailsByUser(userId);
    if (!existingBloodDetails) {
      throw new BadRequestException(
        'None of the blood details found for this user',
      );
    }

    const bloodDetails = await this.prisma.bloodDetails.delete({
      where: {
        id: existingBloodDetails.id,
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      message: `Blood Details deleted successfully`,
      statusCode: 200,
    });
  }

  /*----- Requesting blood details -----*/
  async requestBloodDetail({
    res,
    body,
    bloodDetailId,
    currentUserId,
    document,
  }: {
    res: Response;
    body: RequestBloodDetailDto;
    bloodDetailId: string;
    currentUserId: string;
    document?: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { patientName, hospitalName, patientMobileNumber, documentType } =
      body;

    if (document && !documentType) {
      if (document.path) {
        this.fileUploadService.handleSingleFileDeletion(document.path);
      }
      throw new BadRequestException(
        'documentType (PATIENT_CASE_SHEET or CAMP_LETTERHEAD) is required when uploading a document',
      );
    }

    if (documentType && !document) {
      throw new BadRequestException(
        'Document photo is required when documentType is selected',
      );
    }

    let uploadedDoc: { imageUrl: string; relativePath: string } | null = null;

    try {
      //verification
      const { donorBloodDetail } = await RequestBloodDetailsVerification({
        bloodDetailService: this,
        currentUserId,
        bloodDetailId,
      });

      //validating dynamic field
      const { inputFields } = await checkDynamicFieldForBloodRequest({
        body,
        prisma: this.prisma,
      });

      if (document) {
        uploadedDoc = this.fileUploadService.handleSingleFileUpload({
          file: document,
          body: {
            type: ImageTypeEnum.BLOOD_DOCUMENT,
          },
        });
      }

      // Create new blood request
      const bloodRequest = await this.prisma.bloodRequest.create({
        data: {
          userId: currentUserId,
          donorId: donorBloodDetail.userId,
          patientName,
          hospitalName,
          patientMobileNumber,
          dynamicFieldData: inputFields,
          documentType: documentType ?? null,
          documentUrl: uploadedDoc?.imageUrl ?? null,
          documentRelativeUrl: uploadedDoc?.relativePath ?? null,
          verificationStatus: uploadedDoc
            ? BloodVerificationStatus.PENDING
            : BloodVerificationStatus.UNVERIFIED,
        },
      });

      return this.response.successResponse({
        initialDate,
        res,
        data: bloodRequest,
        message: `Blood request sent successfully`,
        statusCode: 200,
      });
    } catch (err) {
      if (uploadedDoc?.relativePath) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedDoc.relativePath,
        );
      } else if (document?.path) {
        this.fileUploadService.handleSingleFileDeletion(document.path);
      }
      throw err;
    }
  }

  /*----- Admin Document Verification (Feature 10) -----*/
  async verifyBloodRequest({
    res,
    bloodRequestId,
    body,
  }: {
    res: Response;
    bloodRequestId: string;
    body: VerifyBloodRequestDto;
  }) {
    const initialDate = new Date();
    const existing = await this.findBloodRequestById(bloodRequestId);
    if (!existing) {
      throw new NotFoundException('Blood request not found');
    }

    const { verificationStatus, rejectionReason } = body;

    if (
      verificationStatus === AdminBloodVerificationAction.REJECTED &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      throw new BadRequestException(
        'rejectionReason is required when rejecting a blood request',
      );
    }

    const isVerified =
      verificationStatus === AdminBloodVerificationAction.VERIFIED;

    const updatedRequest = await this.prisma.bloodRequest.update({
      where: { id: bloodRequestId },
      data: {
        verificationStatus: isVerified
          ? BloodVerificationStatus.VERIFIED
          : BloodVerificationStatus.REJECTED,
        verifiedAt: isVerified ? new Date() : null,
        rejectionReason: isVerified ? null : rejectionReason?.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            mobile: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            mobile: true,
          },
        },
      },
    });

    if (this.firebaseNotificationService) {
      await this.firebaseNotificationService.sendNotificationToAllSession({
        receiverId: existing.userId,
        isReceiverVendor: false,
        title: isVerified
          ? '🩸 Blood Request Verified'
          : '❌ Blood Request Document Rejected',
        content: isVerified
          ? `Your blood request document for ${existing.patientName} has been verified.`
          : `Your blood request document for ${existing.patientName} was rejected. Reason: ${rejectionReason?.trim()}`,
        bloodRequestId: existing.id,
        verificationStatus: updatedRequest.verificationStatus,
      });

      if (isVerified) {
        await this.firebaseNotificationService.sendNotificationToAllSession({
          receiverId: existing.donorId,
          isReceiverVendor: false,
          title: '🩸 Verified Blood Request Received',
          content: `${updatedRequest.user.name} has a verified emergency blood request at ${existing.hospitalName} for ${existing.patientName}.`,
          bloodRequestId: existing.id,
          verificationStatus: updatedRequest.verificationStatus,
        });
      }
    }

    return this.response.successResponse({
      initialDate,
      res,
      data: updatedRequest,
      message: isVerified
        ? 'Blood request verified successfully'
        : 'Blood request rejected successfully',
      statusCode: 200,
    });
  }

  /*----- helper funcs -----*/
  async findBloodDetailsByUser(userId: string) {
    return await this.prisma.bloodDetails.findUnique({
      where: {
        userId,
      },
    });
  }

  async findBloodDetailById(id: string) {
    return await this.prisma.bloodDetails.findUnique({
      where: {
        id,
      },
      include: {
        User: true,
      },
    });
  }

  async findLastBloodDetails(requesterId: string, donorId: string) {
    return await this.prisma.bloodRequest.findFirst({
      where: {
        userId: requesterId,
        donorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBloodRequestById(bloodRequestId: string) {
    return await this.prisma.bloodRequest.findUnique({
      where: {
        id: bloodRequestId,
      },
    });
  }
}
