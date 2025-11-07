import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { uploadToS3 } from "../utils/s3Upload.js";
import { SuccessResponse, HandleError } from "../utils/httpResponse.js";

const prisma = new PrismaClient();

// Configure Multer to store files in memory (for S3 upload)
export const upload = multer({ storage: multer.memoryStorage() });

export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { tenantId },
      orderBy: { date: "desc" },
    });

    return SuccessResponse(res, 200, "Payments fetched successfully", payments);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    // ✅ Upload file to S3, get public URL
    const fileUrl = await uploadToS3(file, `payments/${paymentId}`);

    // ✅ Update database with file URL & status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        proofUrl: fileUrl,
        status: "paid",
      },
    });

    return SuccessResponse(
      res,
      200,
      "Payment proof uploaded successfully",
      updatedPayment
    );
  } catch (error) {
    console.error(error);
    return HandleError(res, error);
  }
};
