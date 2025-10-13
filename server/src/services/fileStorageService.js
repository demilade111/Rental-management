import { s3 } from "../config/aws.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function generateUploadUrl(fileName, fileType) {
  const Key = `listings/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key,
    ContentType: fileType,
  });

  const uploadURL = await getSignedUrl(s3, command, {
    expiresIn: Number(process.env.AWS_SIGNED_URL_EXPIRATION),
  });

  return { uploadURL, key: Key };
}
