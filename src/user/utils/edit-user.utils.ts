import { Prisma } from '@prisma/client';
import { EditUserDto, TrueOrFalseMap } from '../dto/edit-user.dto';

export function buildEditUserUpdateInput({
  body,
  imageUrl,
  relativePath,
}: {
  body: EditUserDto;
  imageUrl?: string;
  relativePath?: string;
}): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};

  const { name, email, nameTamil } = body;

  if (name) data.name = name;
  if (imageUrl) data.imageRef = imageUrl;
  if (relativePath) data.relativeUrl = relativePath;
  if (email) data.email = email;
  if (nameTamil) data.nameTamil = nameTamil;

  return data;
}

export function buildBloodDetailsInput({
  body,
  userId,
  existingBloodDetails,
}: {
  body: EditUserDto;
  userId: string;
  existingBloodDetails: boolean;
}):
  | { mode: 'create'; data: Prisma.BloodDetailsCreateInput }
  | { mode: 'update'; data: Prisma.BloodDetailsUpdateInput }
  | undefined {
  const { isDonor, bloodGroup, city, area } = body;

  const shouldUpdate =
    isDonor !== undefined || bloodGroup !== undefined || city || area;

  if (!shouldUpdate) return undefined;

  if (existingBloodDetails) {
    const data: Prisma.BloodDetailsUpdateInput = {};
    if (isDonor !== undefined) data.isDonor = TrueOrFalseMap[isDonor];
    if (bloodGroup) data.bloodGroup = bloodGroup;
    if (city) data.city = city;
    if (area) data.area = area;
    return { mode: 'update', data };
  } else {
    if (isDonor === undefined || !bloodGroup || !city || !area) {
      throw new Error(
        'All blood details fields such as city, area,bloodGroup are required for creation.',
      );
    }

    const data: Prisma.BloodDetailsCreateInput = {
      User: {
        connect: {
          id: userId,
        },
      },
      isDonor: TrueOrFalseMap[isDonor],
      bloodGroup,
      city,
      area,
    };
    return { mode: 'create', data };
  }
}
