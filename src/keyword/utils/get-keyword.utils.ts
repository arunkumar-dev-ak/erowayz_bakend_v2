import { Prisma } from '@prisma/client';
import { GetKeyWordQueryDto } from '../dto/get-keyword-query.dto';

export function buildKeywordWhereFilter({
  query,
}: {
  query: GetKeyWordQueryDto;
}): Prisma.keyWordWhereInput {
  const where: Prisma.keyWordWhereInput = {};

  const {
    keyWordType,
    vendorTypeId,
    status,
    keywordName,
    keywordId,
    vendorCategoryType,
  } = query;

  if (keyWordType) {
    where.keyWordType = keyWordType;
  }
  if (vendorTypeId) where.vendorTypeId = vendorTypeId;
  if (status) where.status = status;
  if (keywordName) where.name = { contains: keywordName, mode: 'insensitive' };
  if (keywordId) where.id = keywordId;
  if (vendorCategoryType)
    where.vendorType = {
      type: vendorCategoryType,
    };

  return where;
}
