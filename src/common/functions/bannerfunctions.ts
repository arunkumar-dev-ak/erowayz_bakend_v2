import { Request } from 'express';

export function extractFileFromReq({
  req,
  fieldName,
  files,
}: {
  req: Request;
  fieldName: string;
  files: { [key: string]: Express.Multer.File[] } | undefined;
}) {
  let image: undefined | Express.Multer.File[] | null = undefined;

  if (fieldName in req.body) {
    image = null;
  } else if (files && files[fieldName]) {
    image = files[fieldName];
  }

  return image;
}
