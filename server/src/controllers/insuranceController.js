import {
  createInsurance,
  getInsuranceById,
  getAllInsurances,
  updateInsurance,
  verifyInsurance,
  rejectInsurance,
} from "../services/insuranceService.js";
import {
  generateUploadUrl,
  generateDownloadUrl,
} from "../services/fileStorageService.js";
import { SuccessResponse, HandleError } from "../utils/httpResponse.js";
import {
  createInsuranceVerifiedNotification,
  createInsuranceRejectedNotification,
} from "../services/notificationService.js";
import {
  sendInsuranceVerifiedEmail,
  sendInsuranceRejectedEmail,
} from "../services/emailService.js";

export async function getPresignedUploadUrl(req, res) {
  try {
    const { fileName, fileType } = req.query;
    const tenantId = req.user.id;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Missing fileName or fileType",
      });
    }

    const result = await generateUploadUrl(
      fileName,
      fileType,
      `insurance/${tenantId}`
    );

    return SuccessResponse(
      res,
      200,
      "Upload URL generated successfully",
      result
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function getPresignedDownloadUrl(req, res) {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Missing file key",
      });
    }

    const downloadURL = await generateDownloadUrl(key);

    return SuccessResponse(res, 200, "Download URL generated successfully", {
      downloadURL,
    });
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function createInsuranceController(req, res) {
  try {
    const tenantId = req.user.id;
    const insuranceData = {
      ...req.body,
      tenantId,
    };

    const insurance = await createInsurance(insuranceData);

    return SuccessResponse(
      res,
      201,
      "Insurance record created successfully",
      insurance
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function getInsuranceByIdController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const insurance = await getInsuranceById(id);

    if (userRole === "TENANT" && insurance.tenantId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this insurance record",
      });
    }

    if (userRole === "ADMIN") {
      const isLandlord =
        insurance.lease?.landlordId === userId ||
        insurance.customLease?.landlordId === userId;

      if (!isLandlord) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this insurance record",
        });
      }
    }

    return SuccessResponse(
      res,
      200,
      "Insurance record retrieved successfully",
      insurance
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function getAllInsurancesController(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, leaseId, customLeaseId, page, limit } = req.query;

    const filters = {
      status,
      leaseId,
      customLeaseId,
      page,
      limit,
    };

    if (userRole === "TENANT") {
      filters.tenantId = userId;
    } else if (userRole === "ADMIN") {
      filters.landlordId = userId;
    }

    const result = await getAllInsurances(filters);

    return SuccessResponse(
      res,
      200,
      "Insurance records retrieved successfully",
      result
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function updateInsuranceController(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;
    const updateData = req.body;

    const updatedInsurance = await updateInsurance(id, tenantId, updateData);

    return SuccessResponse(
      res,
      200,
      "Insurance record updated successfully",
      updatedInsurance
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function verifyInsuranceController(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;

    const verifiedInsurance = await verifyInsurance(id, landlordId);

    const tenantName = verifiedInsurance.tenant?.firstName && verifiedInsurance.tenant?.lastName
      ? `${verifiedInsurance.tenant.firstName} ${verifiedInsurance.tenant.lastName}`
      : "Tenant";

    await createInsuranceVerifiedNotification(
      verifiedInsurance,
      verifiedInsurance.tenantId
    );

    await sendInsuranceVerifiedEmail(
      verifiedInsurance,
      verifiedInsurance.tenant.email,
      tenantName
    );

    return SuccessResponse(
      res,
      200,
      "Insurance record verified successfully",
      verifiedInsurance
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function rejectInsuranceController(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const rejectedInsurance = await rejectInsurance(
      id,
      landlordId,
      rejectionReason
    );

    const tenantName = rejectedInsurance.tenant?.firstName && rejectedInsurance.tenant?.lastName
      ? `${rejectedInsurance.tenant.firstName} ${rejectedInsurance.tenant.lastName}`
      : "Tenant";

    await createInsuranceRejectedNotification(
      rejectedInsurance,
      rejectedInsurance.tenantId
    );

    await sendInsuranceRejectedEmail(
      rejectedInsurance,
      rejectedInsurance.tenant.email,
      tenantName
    );

    return SuccessResponse(
      res,
      200,
      "Insurance record rejected",
      rejectedInsurance
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function sendReminderController(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    const { message } = req.body;

    const insurance = await getInsuranceById(id);

    const isLandlord =
      insurance.lease?.landlordId === landlordId ||
      insurance.customLease?.landlordId === landlordId;

    if (!isLandlord) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to send reminder for this insurance record",
      });
    }

    return SuccessResponse(res, 200, "Reminder sent successfully", {
      insuranceId: id,
      tenantEmail: insurance.tenant.email,
    });
  } catch (error) {
    return HandleError(res, error);
  }
}

