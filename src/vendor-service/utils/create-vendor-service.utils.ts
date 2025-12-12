import { BadRequestException } from '@nestjs/common';
import {
  MultipleFileUploadInterface,
  VendorService,
} from 'src/vendor/vendor.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { Prisma, VendorCategoryType } from '@prisma/client';
import { ServiceOptionService } from 'src/service-option/service-option.service';
import { CreateVendorServiceDto } from '../dto/create-vendor-service.dto';
import { VendorServiceService } from '../vendor-service.service';

export const createVendorServiceUtils = async ({
  body,
  vendorId,
  images,
  serviceOptionService,
  fileUploadService,
  vendorServiceService,
  vendorService,
}: {
  body: CreateVendorServiceDto;
  vendorId: string;
  images: Express.Multer.File[];
  serviceOptionService: ServiceOptionService;
  fileUploadService: FileUploadService;
  vendorServiceService: VendorServiceService;
  vendorService: VendorService;
}) => {
  const {
    name,
    serviceOptId,
    description,
    price,
    subServiceName,
    status,
    nameTamil,
  } = body;

  // Fetch vendor, service option, and check for duplicate service name
  const [vendor, serviceOption, existingService] = await Promise.all([
    vendorService.findVendorById({ id: vendorId }),
    serviceOptionService.findServiceById(serviceOptId),
    vendorServiceService.findServiceByName({ name, vendorId, serviceOptId }),
  ]);

  // Validate vendor category
  if (vendor?.vendorType.type !== VendorCategoryType.SERVICE) {
    throw new BadRequestException(
      'The vendor is not categorized under "Service".',
    );
  }

  // Validate service option existence
  if (!serviceOption || serviceOption.status == 'INACTIVE') {
    throw new BadRequestException('Service option not found.');
  }

  // Ensure service option is of correct type
  if (serviceOption.vendorType.type !== VendorCategoryType.SERVICE) {
    throw new BadRequestException(
      `Subservice creation is not allowed for vendor type "${serviceOption.vendorType.name}".`,
    );
  }

  // Check for service name uniqueness
  if (existingService) {
    throw new BadRequestException(
      `A service with the name "${name}" already exists.`,
    );
  }

  // Validate duplicate subservice names
  const uniqueNames = new Set(subServiceName);

  if (uniqueNames.size !== subServiceName.length) {
    throw new BadRequestException(
      'Duplicate subservice names are not allowed.',
    );
  }

  // Upload images
  const imageUrls: MultipleFileUploadInterface =
    fileUploadService.handleMultipleFileUpload({
      files: images,
      body: { type: ImageTypeEnum.SERVICE },
    });

  // Construct Prisma create query
  const createQuery: Prisma.ServiceCreateInput = {
    name,
    description,
    status,
    nameTamil,
    vendor: {
      connect: { id: vendorId },
    },
    serviceOption: {
      connect: { id: serviceOptId },
    },
    vendorSubService: {
      createMany: {
        data: subServiceName.map((name, index) => {
          const rawPrice = price[index];
          const parsedPrice = Number(rawPrice);

          if (isNaN(parsedPrice)) {
            throw new Error(
              `Invalid price at index ${index}: "${rawPrice}" is not a number`,
            );
          }

          return {
            name,
            price: parsedPrice,
          };
        }),
      },
    },
    serviceImage: {
      createMany: {
        data: imageUrls.filePaths.map((img) => ({
          absoluteUrl: img.imageUrl,
          relativeUrl: img.relativePath,
        })),
      },
    },
  };

  return { createQuery, imageUrls };
};
