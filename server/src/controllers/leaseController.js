import {
  createLease,
  getAllLeases,
  getLeaseById,
  updateLeaseById,
  deleteLeaseById,
} from "../services/leaseService.js";
import {
  createLeaseSchema,
  updateLeaseSchema,
} from "../validations/leaseValidation.js";
import {
  SuccessResponse,
  HandleError,
  CreatedResponse,
} from "../utils/httpResponse.js";
import { prisma } from "../prisma/client.js";

export const createLeaseController = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const body = createLeaseSchema.parse(req.body);
    const lease = await createLease(landlordId, body);
    return CreatedResponse(res, "Lease created successfully", lease);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const getAllLeasesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filters = {
      leaseStatus: req.query.leaseStatus,
      listingId: req.query.listingId,
    };

    const leases = await getAllLeases(userId, userRole, filters);
    return SuccessResponse(res, 200, "Leases retrieved successfully", leases);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const getLeaseByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lease = await getLeaseById(id, userId, userRole);
    return SuccessResponse(res, 200, "Lease retrieved successfully", lease);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const updateLeaseController = async (req, res) => {
  try {
    const { id } = req.params;
    const body = updateLeaseSchema.parse(req.body);
    const userId = req.user.id;

    const updatedLease = await updateLeaseById(id, userId, body);
    return SuccessResponse(
      res,
      200,
      "Lease updated successfully",
      updatedLease
    );
  } catch (error) {
    return HandleError(res, error);
  }
};

export const deleteLeaseController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await deleteLeaseById(id, userId);
    return SuccessResponse(res, 200, result.message, null);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const bulkDeleteLeasesController = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return ErrorResponse(res, 400, "Lease IDs array is required and must not be empty");
    }

    // Delete each lease with authorization check
    let deletedCount = 0;
    const errors = [];

    for (const leaseId of ids) {
      try {
        await deleteLeaseById(leaseId, userId);
        deletedCount++;
      } catch (error) {
        errors.push({ leaseId, error: error.message });
      }
    }

    if (deletedCount === 0) {
      return ErrorResponse(res, 400, "No leases were deleted", { errors });
    }

    return SuccessResponse(res, 200, `${deletedCount} lease(s) deleted successfully`, {
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return HandleError(res, error);
  }
};

export const getTenantLeasesController = async (req, res) => {
  try {
    console.log('herer')
    const tenantId = req.user.id;

    // 1. Find the invite for this tenant
    const invite = await prisma.leaseInvite.findFirst({
      where: { tenantId },
    });

    if (!invite) {
      return res.json({ data: [], type: null });
    }

    // 2. Based on CUSTOM vs STANDARD
    if (invite.leaseType === "CUSTOM") {
      const customLeases = await prisma.customLease.findMany({
        where: { tenantId },
        include: {
          listing: true,
          landlord: true,
          tenant: true,
        },
      });

      return res.json({ data: customLeases, type: "CUSTOM" });
    }

    // 3. STANDARD leases fallback
    const leases = await prisma.lease.findMany({
      where: { tenantId },
      include: {
        listing: true,
        landlord: true,
        tenant: true,
      },
    });

    return res.json({ data: leases, type: "STANDARD" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tenant leases" });
  }
}
