import multer from "multer";
import { uploadToS3 } from "../utils/s3Upload.js";
import { SuccessResponse, HandleError } from "../utils/httpResponse.js";
import { prisma } from "../prisma/client.js";

export const upload = multer({ storage: multer.memoryStorage() });

export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.user?.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    const payments = await prisma.payment.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return SuccessResponse(res, 200, "Payments fetched successfully", {
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("getTenantPayments error:", error);
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

    const fileUrl = await uploadToS3(file, `payments/${paymentId}`);

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
