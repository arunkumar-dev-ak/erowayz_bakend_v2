import { Prisma } from '@prisma/client';
import { GetHomePageQueryDto } from '../dto/get-home-page-query.dto';

export enum MatchedBy {
  ITEM = 'item',
  SHOP = 'shop',
  BANNER = 'banner',
  BANNER_KEYWORD = 'bannerKeyword',
  SERVICE = 'service',
  SERVICE_KEYWORD = 'serviceKeyword',
}

export function getHomePageUtils({ query }: { query: GetHomePageQueryDto }) {
  const where: Prisma.VendorWhereInput = {};
  const { name } = query;

  if (name) {
    const orConditions: Prisma.VendorWhereInput[] = [];

    orConditions.push({
      item: {
        some: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      },
    });

    orConditions.push({
      shopInfo: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });

    orConditions.push({
      banner: {
        some: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      },
    });

    orConditions.push({
      banner: {
        some: {
          keyWordBanner: {
            some: {
              keyWord: {
                name: {
                  contains: name,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
    });

    orConditions.push({
      service: {
        some: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      },
    });

    orConditions.push({
      serviceVendorKeyword: {
        some: {
          keyword: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
      },
    });

    where.OR = orConditions;
  }

  return { where };
}

export function getIncludeHomePageUtils({
  query,
}: {
  query: GetHomePageQueryDto;
}): Prisma.VendorInclude {
  const { name } = query;

  const include: Prisma.VendorInclude = {
    vendorType: true,
    User: {
      select: {
        id: true,
        name: true,
        nameTamil: true,
        imageRef: true,
        status: true,
      },
    },
  };

  if (name) {
    include.shopInfo = {
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        license: true,
      },
    };

    include.item = {
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        itemImage: true,
      },
    };

    include.banner = {
      where: {
        OR: [
          {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            keyWordBanner: {
              some: {
                keyWord: {
                  name: {
                    contains: name,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        keyWordBanner: {
          // Only include keyWordBanner records where the keyword name matches
          where: {
            keyWord: {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            },
          },
          include: {
            keyWord: true,
          },
        },
      },
    };

    include.service = {
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    };

    include.serviceVendorKeyword = {
      where: {
        keyword: {
          name,
        },
      },
      include: {
        keyword: true,
      },
    };
  }

  return include;
}
