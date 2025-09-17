import { Injectable } from '@nestjs/common';

@Injectable()
export class MetadataService {
  createMetaData({
    totalCount,
    offset,
    limit,
    path,
    queries,
  }: {
    totalCount: number;
    offset: number;
    limit: number;
    path: string;
    queries?: string;
  }) {
    const baseUrl = `${process.env.DOMAIN_URL || 'http://localhost:3000'}/${path}`;

    if (totalCount === 0) {
      return {
        paging: {
          links: {
            prev: null,
            next: null,
            current: `${baseUrl}?offset=${offset}&limit=${limit}${queries}`,
          },
          pages: {
            total: 1,
            prev: null,
            next: null,
            current: 1,
          },
          totalCount,
        },
      };
    }

    const totalPages = Math.ceil(totalCount / limit); // ✅ Fix
    const currentPage = Math.floor(offset / limit) + 1;

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const meta = {
      paging: {
        links: {
          prev: hasPrev
            ? `${baseUrl}?offset=${offset - limit}&limit=${limit}${queries}`
            : null,
          next: hasNext
            ? `${baseUrl}?offset=${offset + limit}&limit=${limit}${queries}`
            : null,
          current: `${baseUrl}?offset=${offset}&limit=${limit}${queries}`,
        },
        pages: {
          total: totalPages,
          prev: hasPrev ? currentPage - 1 : null,
          next: hasNext ? currentPage + 1 : null,
          current: currentPage,
        },
        totalCount,
      },
    };

    return meta;
  }
}
