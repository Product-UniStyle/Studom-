import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

const client = new S3Client({ region });

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export function sanitizeFolderSegment(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unnamed';
}

export async function uploadImageToS3(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder: string
): Promise<string> {
  if (!bucket || !region) throw new Error('AWS_S3_BUCKET / AWS_REGION is not set');

  const key = `${folder}/${randomUUID()}-${sanitizeFilename(originalName)}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
