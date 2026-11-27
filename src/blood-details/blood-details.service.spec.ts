import { Test, TestingModule } from '@nestjs/testing';
import { BloodDetailsService } from './blood-details.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { BloodDocumentType, BloodVerificationStatus } from '@prisma/client';
import { AdminBloodVerificationAction } from './dto/verify-blood-request.dto';

describe('BloodDetailsService', () => {
  let service: BloodDetailsService;
  let prismaMock: any;
  let responseMock: any;
  let metaDataMock: any;
  let fileUploadMock: any;
  let firebaseNotificationMock: any;

  beforeEach(async () => {
    prismaMock = {
      bloodDetails: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      bloodRequest: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      dynamicField: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    responseMock = {
      successResponse: jest.fn(({ data, message }) => ({ data, message })),
    };

    metaDataMock = {
      createMetaData: jest.fn(() => ({ totalCount: 0 })),
    };

    fileUploadMock = {
      handleSingleFileUpload: jest.fn().mockReturnValue({
        imageUrl: 'http://localhost:3000/client/bloodDocument/doc.jpg',
        relativePath: './uploads/bloodDocument/doc.jpg',
      }),
      handleSingleFileDeletion: jest.fn(),
    };

    firebaseNotificationMock = {
      sendNotificationToAllSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloodDetailsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ResponseService, useValue: responseMock },
        { provide: MetadataService, useValue: metaDataMock },
        { provide: FileUploadService, useValue: fileUploadMock },
        {
          provide: FirebaseNotificationService,
          useValue: firebaseNotificationMock,
        },
      ],
    }).compile();

    service = module.get<BloodDetailsService>(BloodDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestBloodDetail (Feature 10: Document Verification)', () => {
    const donorDetail = {
      id: 'bd-1',
      userId: 'donor-1',
      isDonor: true,
      User: { id: 'donor-1', name: 'Donor User' },
    };

    const baseBody = {
      patientName: 'John Doe',
      hospitalName: 'Apollo Hospital',
      patientMobileNumber: '9876543210',
    };

    beforeEach(() => {
      prismaMock.bloodDetails.findUnique.mockResolvedValue(donorDetail);
      prismaMock.bloodRequest.findFirst.mockResolvedValue(null);
    });

    it('creates a PENDING blood request when document file and documentType are provided', async () => {
      const mockFile = {
        originalname: 'case-sheet.jpg',
        path: '/tmp/upload_123',
      } as Express.Multer.File;

      prismaMock.bloodRequest.create.mockResolvedValue({
        id: 'req-1',
        verificationStatus: BloodVerificationStatus.PENDING,
        documentType: BloodDocumentType.PATIENT_CASE_SHEET,
        documentUrl: 'http://localhost:3000/client/bloodDocument/doc.jpg',
      });

      const res = {} as any;
      await service.requestBloodDetail({
        res,
        bloodDetailId: 'bd-1',
        currentUserId: 'requester-1',
        body: {
          ...baseBody,
          documentType: BloodDocumentType.PATIENT_CASE_SHEET,
        },
        document: mockFile,
      });

      expect(fileUploadMock.handleSingleFileUpload).toHaveBeenCalledWith({
        file: mockFile,
        body: { type: 'bloodDocument' },
      });
      expect(prismaMock.bloodRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentType: BloodDocumentType.PATIENT_CASE_SHEET,
          documentUrl: 'http://localhost:3000/client/bloodDocument/doc.jpg',
          documentRelativeUrl: './uploads/bloodDocument/doc.jpg',
          verificationStatus: BloodVerificationStatus.PENDING,
        }),
      });
    });

    it('creates an UNVERIFIED blood request when neither document nor documentType is provided', async () => {
      prismaMock.bloodRequest.create.mockResolvedValue({
        id: 'req-2',
        verificationStatus: BloodVerificationStatus.UNVERIFIED,
      });

      const res = {} as any;
      await service.requestBloodDetail({
        res,
        bloodDetailId: 'bd-1',
        currentUserId: 'requester-1',
        body: baseBody,
      });

      expect(fileUploadMock.handleSingleFileUpload).not.toHaveBeenCalled();
      expect(prismaMock.bloodRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentType: null,
          documentUrl: null,
          documentRelativeUrl: null,
          verificationStatus: BloodVerificationStatus.UNVERIFIED,
        }),
      });
    });

    it('throws BadRequestException and cleans up file if document is uploaded without documentType', async () => {
      const mockFile = {
        originalname: 'letter.jpg',
        path: '/tmp/upload_456',
      } as Express.Multer.File;

      await expect(
        service.requestBloodDetail({
          res: {} as any,
          bloodDetailId: 'bd-1',
          currentUserId: 'requester-1',
          body: baseBody,
          document: mockFile,
        }),
      ).rejects.toThrow(
        'documentType (PATIENT_CASE_SHEET or CAMP_LETTERHEAD) is required when uploading a document',
      );

      expect(fileUploadMock.handleSingleFileDeletion).toHaveBeenCalledWith(
        '/tmp/upload_456',
      );
    });

    it('throws BadRequestException if documentType is set without a document file', async () => {
      await expect(
        service.requestBloodDetail({
          res: {} as any,
          bloodDetailId: 'bd-1',
          currentUserId: 'requester-1',
          body: {
            ...baseBody,
            documentType: BloodDocumentType.CAMP_LETTERHEAD,
          },
        }),
      ).rejects.toThrow(
        'Document photo is required when documentType is selected',
      );
    });
  });

  describe('verifyBloodRequest', () => {
    const existingReq = {
      id: 'req-1',
      userId: 'requester-1',
      donorId: 'donor-1',
      patientName: 'John Doe',
      hospitalName: 'Apollo Hospital',
      verificationStatus: BloodVerificationStatus.PENDING,
    };

    it('verifies a blood request and notifies both requester and donor', async () => {
      prismaMock.bloodRequest.findUnique.mockResolvedValue(existingReq);
      prismaMock.bloodRequest.update.mockResolvedValue({
        ...existingReq,
        verificationStatus: BloodVerificationStatus.VERIFIED,
        user: { id: 'requester-1', name: 'Requester' },
        donor: { id: 'donor-1', name: 'Donor' },
      });

      await service.verifyBloodRequest({
        res: {} as any,
        bloodRequestId: 'req-1',
        body: { verificationStatus: AdminBloodVerificationAction.VERIFIED },
      });

      expect(prismaMock.bloodRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'req-1' },
          data: expect.objectContaining({
            verificationStatus: BloodVerificationStatus.VERIFIED,
            rejectionReason: null,
          }),
        }),
      );
      expect(
        firebaseNotificationMock.sendNotificationToAllSession,
      ).toHaveBeenCalledTimes(2);
    });

    it('rejects a blood request with rejectionReason and notifies requester only', async () => {
      prismaMock.bloodRequest.findUnique.mockResolvedValue(existingReq);
      prismaMock.bloodRequest.update.mockResolvedValue({
        ...existingReq,
        verificationStatus: BloodVerificationStatus.REJECTED,
        rejectionReason: 'Blurry image',
        user: { id: 'requester-1', name: 'Requester' },
        donor: { id: 'donor-1', name: 'Donor' },
      });

      await service.verifyBloodRequest({
        res: {} as any,
        bloodRequestId: 'req-1',
        body: {
          verificationStatus: AdminBloodVerificationAction.REJECTED,
          rejectionReason: 'Blurry image',
        },
      });

      expect(prismaMock.bloodRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'req-1' },
          data: expect.objectContaining({
            verificationStatus: BloodVerificationStatus.REJECTED,
            verifiedAt: null,
            rejectionReason: 'Blurry image',
          }),
        }),
      );
      expect(
        firebaseNotificationMock.sendNotificationToAllSession,
      ).toHaveBeenCalledTimes(1);
    });

    it('throws BadRequestException when rejecting without rejectionReason', async () => {
      prismaMock.bloodRequest.findUnique.mockResolvedValue(existingReq);

      await expect(
        service.verifyBloodRequest({
          res: {} as any,
          bloodRequestId: 'req-1',
          body: {
            verificationStatus: AdminBloodVerificationAction.REJECTED,
            rejectionReason: '   ',
          },
        }),
      ).rejects.toThrow(
        'rejectionReason is required when rejecting a blood request',
      );
    });
  });

  describe('getBloodDetailRequest', () => {
    it('filters blood requests by verificationStatus and documentType for Admin', async () => {
      prismaMock.bloodRequest.count.mockResolvedValue(1);
      prismaMock.bloodRequest.findMany.mockResolvedValue([{ id: 'req-1' }]);

      await service.getBloodDetailRequest({
        res: {} as any,
        offset: 0,
        limit: 10,
        query: {
          verificationStatus: BloodVerificationStatus.PENDING,
          documentType: BloodDocumentType.PATIENT_CASE_SHEET,
        },
      });

      expect(prismaMock.bloodRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verificationStatus: BloodVerificationStatus.PENDING,
            documentType: BloodDocumentType.PATIENT_CASE_SHEET,
          }),
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });
});
