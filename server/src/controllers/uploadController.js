import { generateUploadUrl } from "../services/fileStorageService.js";

export async function getawsS3PresignedUrl(req, res, next) {
  try {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: "Missing fileName or fileType" });
    }

    const { uploadURL, key } = await generateUploadUrl(fileName, fileType);
    return res.status(200).json({ uploadURL, key });
  } catch (err) {
    next(err);
  }
}
