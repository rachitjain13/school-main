
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { SchoolMembership } from "../../super-admin/models/school-membership.model";
import { TenantRegistry } from "../../super-admin/models/tenant-registry.model";
import { getTenantConnection } from "../../../infrastructure/tenant-connection.manager";

export const requireSchoolTenant = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const auth = res.locals.auth as
            | { userId: string; role: string }
            | undefined;

        if (!auth) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        if (auth.role !== "school_main_admin") {
            res.status(403).json({
                success: false,
                message: "School access is not permitted for this role",
            });
            return;
        }

        if (!mongoose.isValidObjectId(auth.userId)) {
            res.status(401).json({
                success: false,
                message: "Invalid authenticated user",
            });
            return;
        }

        const membership = await SchoolMembership.findOne({
            userId: new mongoose.Types.ObjectId(auth.userId),
            status: "active",
        }).lean();

        if (!membership) {
            res.status(403).json({
                success: false,
                message: "Active school membership not found",
            });
            return;
        }

        const memberships = await SchoolMembership.countDocuments({
            userId: new mongoose.Types.ObjectId(auth.userId),
            status: "active",
        });

        if (memberships !== 1) {
            res.status(403).json({
                success: false,
                message: "User must have exactly one active school membership",
            });
            return;
        }

        const tenant = await TenantRegistry.findOne({
            schoolId: membership.schoolId,
            status: "active",
        }).lean();

        if (!tenant) {
            res.status(403).json({
                success: false,
                message: "School tenant is unavailable",
            });
            return;
        }

        const connection = await getTenantConnection(tenant.databaseName);

        res.locals.tenant = {
            schoolId: tenant.schoolId,
            databaseName: tenant.databaseName,
            connection,
        };

        next();
    } catch (error) {
        next(error);
    }
};
