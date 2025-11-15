import { BadRequestException } from '@nestjs/common';
import { MultipleFileUploadInterface } from 'src/vendor/vendor.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { Prisma } from '@prisma/client';
import { ServiceOptionService } from 'src/service-option/service-option.service';
import { UpdateVendorServiceDto } from '../dto/update-vendor-service.dto';
import { VendorServiceService } from '../vendor-service.service';

function parseAndValidateSubServices(
  subServiceName: string[],
  price: string[],
): { name: string; price: number }[] {
  if (!Array.isArray(subServiceName) || !Array.isArray(price)) {
    throw new BadRequestException('subServiceName and price must be arrays.');
  }

  if (subServiceName.length !== price.length) {
    throw new BadRequestException(
      'subServiceName and price arrays must be of equal length.',
    );
  }

  return subServiceName.map((name, index) => {
    const rawPrice = price[index];
    const parsedPrice = Number(rawPrice);

    if (!name || typeof name !== 'string') {
      throw new BadRequestException(`Invalid subServiceName at index ${index}`);
    }

    if (isNaN(parsedPrice)) {
      throw new BadRequestException(
        `Invalid price at index ${index}: "${rawPrice}" is not a number`,
      );
    }

    return { name, price: parsedPrice };
  });
}

export const updateVendorServiceUtils = async ({
  body,
  vendorId,
  images,
  serviceOptionService,
  fileUploadService,
  vendorServiceService,
  serviceId,
}: {
  body: UpdateVendorServiceDto;
  vendorId: string;
  images?: Express.Multer.File[];
  serviceOptionService: ServiceOptionService;
  fileUploadService: FileUploadService;
  vendorServiceService: VendorServiceService;
  serviceId: string;
}) => {
  const {
    name,
    serviceOptId,
    description,
    price,
    subServiceName,
    status,
    deletedServiceImageIds,
    nameTamil,
  } = body;

  const [vendorService, serviceOption, deletedServiceImages] =
    await Promise.all([
      vendorServiceService.findServiceById(serviceId),
      serviceOptId ? serviceOptionService.findServiceById(serviceOptId) : null,
      deletedServiceImageIds
        ? vendorServiceService.findServiceImages(deletedServiceImageIds)
        : [],
    ]);

  if (!vendorService) {
    throw new BadRequestException('Service not found.');
  }

  if (serviceOptId && !serviceOption) {
    throw new BadRequestException('Service option not found.');
  }

  if (
    deletedServiceImageIds &&
    deletedServiceImageIds.length !== deletedServiceImages.length
  ) {
    throw new BadRequestException(
      'Some of the provided service image IDs for deletion are invalid.',
    );
  }

  if (name || serviceOptId) {
    const vendorServiceByName = await vendorServiceService.findServiceByName({
      name: name ?? vendorService.name,
      vendorId,
      serviceOptId: serviceOptId ?? vendorService.serviceOptionId,
    });

    if (vendorServiceByName && vendorServiceByName.id !== vendorService.id) {
      throw new BadRequestException(
        `${name} already exists under ${vendorService.serviceOption.name}.`,
      );
    }
  }

  const updateQuery: Prisma.ServiceUpdateInput = {
    ...(name && { name }),
    ...(nameTamil && { nameTamil }),
    ...(serviceOptId && {
      serviceOption: {
        connect: { id: serviceOptId },
      },
    }),
    ...(description !== undefined && { description }),
    ...(status && { status }),
  };

  let services: { name: string; price: number }[] = [];
  if (subServiceName && price) {
    services = parseAndValidateSubServices(subServiceName, price);
  }

  if (services.length > 0) {
    const existingSubServices =
      await vendorServiceService.findSubServicesByServiceId(serviceId);

    const existingNames = new Set(existingSubServices.map((s) => s.name));

    for (const s of services) {
      if (!existingNames.has(s.name)) {
        throw new BadRequestException(
          `Subservice "${s.name}" does not exist or is not allowed to be modified.`,
        );
      }
    }

    updateQuery.vendorSubService = {
      updateMany: services.map((s) => ({
        where: {
          serviceId,
          name: s.name,
        },
        data: {
          price: s.price,
        },
      })),
    };
  }

  let imageUrls: MultipleFileUploadInterface | undefined;

  if (images && images.length > 0) {
    imageUrls = fileUploadService.handleMultipleFileUpload({
      files: images,
      body: { type: ImageTypeEnum.SERVICE },
    });

    updateQuery.serviceImage = {
      createMany: {
        data: imageUrls.filePaths.map((image) => ({
          absoluteUrl: image.imageUrl,
          relativeUrl: image.relativePath,
        })),
      },
    };
  }

  return { updateQuery, imageUrls, deletedServiceImages };
};
