import crypto from "crypto";
import { prisma } from "../prisma/client.js";

// Generate a lease invite link
export const generateLeaseInviteController = async (req, res) => {
    try {
        const { tenantId, leaseType } = req.body;
        const leaseId = req.params.id;

        if (!["STANDARD", "CUSTOM"].includes(leaseType)) {
            return res.status(400).json({ message: "Invalid leaseType" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const url = `${baseUrl}/leases-invite/sign/${token}`;

        const invite = await prisma.LeaseInvite.create({
            data: {
                leaseId,
                tenantId: null,
                leaseType,
                token,
                url,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            },
        });

        res.json({ invite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating lease invite" });
    }
};

// Get lease info from invite token
export const getLeaseInviteController = async (req, res) => {
    try {
        const { token } = req.params;

        const invite = await prisma.LeaseInvite.findUnique({ where: { token } });
        if (!invite) return res.status(404).json({ message: "Invalid token" });
        if (invite.expiresAt < new Date()) return res.status(400).json({ message: "Invite expired" });

        let lease;
        if (invite.leaseType === "CUSTOM") {
            lease = await prisma.CustomLease.findUnique({ where: { id: invite.leaseId } });
        } else {
            lease = await prisma.Lease.findUnique({ where: { id: invite.leaseId } });
        }

        // Return invite and lease data even if already signed (so frontend can check status)
        res.json({ invite, lease });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching lease invite" });
    }
};

// Mark lease as signed
// export const signLeaseController = async (req, res) => {
//     try {
//         const { token } = req.params;

//         const invite = await prisma.LeaseInvite.findUnique({ where: { token } });
//         if (!invite) return res.status(404).json({ message: "Invalid token" });
//         if (invite.expiresAt < new Date()) return res.status(400).json({ message: "Invite expired" });

//         await prisma.LeaseInvite.update({
//             where: { token },
//             data: { 
//                 tenantId: userId,
//                 signed: true 
//             },
//         });

//         res.json({ message: "Lease signed successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error signing lease" });
//     }
// };

export const signLeaseController = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user?.id; // must be authenticated

        if (!userId)
            return res.status(401).json({ message: "Login required to sign lease" });

        const invite = await prisma.LeaseInvite.findUnique({
            where: { token },
        });

        if (!invite) return res.status(404).json({ message: "Invalid token" });
        if (invite.expiresAt < new Date())
            return res.status(400).json({ message: "Invite expired" });
        if (invite.signed)
            return res.status(400).json({ message: "This lease has already been signed" });

        // Fetch the correct lease type
        let leaseModel =
            invite.leaseType === "CUSTOM" ? prisma.customLease : prisma.lease;

        const lease = await leaseModel.findUnique({
            where: { id: invite.leaseId },
        });

        if (!lease) return res.status(404).json({ message: "Lease not found" });

        // Update invite (mark signed + attach tenant)
        await prisma.LeaseInvite.update({
            where: { token },
            data: { tenantId: userId, signed: true },
        });

        // Update lease (attach tenant + activate)
        await leaseModel.update({
            where: { id: invite.leaseId },
            data: {
                tenantId: userId,
                leaseStatus: "ACTIVE",
            },
        });

        // Update the associated listing status to RENTED
        await prisma.Listing.update({
            where: { id: lease.listingId },
            data: { status: "RENTED" },
        });

        res.json({ message: "Lease signed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error signing lease" });
    }
};




