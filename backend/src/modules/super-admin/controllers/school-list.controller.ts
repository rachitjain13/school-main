
import { Request, Response, NextFunction } from "express";
import { getSchools } from "../services/school-list.service";
import { SchoolStatus } from "../models/school.model";

const VALID_STATUSES: SchoolStatus[] = [
  "provisioning",
  "provisioning_failed",
  "admin_invited",
  "onboarding",
  "active",
  "suspended",
  "archived",
];

const getQueryString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

export const listSchoolsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageValue = getQueryString(req.query.page) ?? "1";
    const limitValue = getQueryString(req.query.limit) ?? "25";
    const search = getQueryString(req.query.search);
    const statusValue = getQueryString(req.query.status);
    const sortValue = getQueryString(req.query.sortOrder) ?? "desc";

    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
      return;
    }

    if (statusValue && !VALID_STATUSES.includes(statusValue as SchoolStatus)) {
      res.status(400).json({
        success: false,
        message: "Invalid school status",
      });
      return;
    }

    if (!["asc", "desc"].includes(sortValue)) {
      res.status(400).json({
        success: false,
        message: "sortOrder must be asc or desc",
      });
      return;
    }

    const result = await getSchools({
      page,
      limit,
      search,
      status: statusValue as SchoolStatus | undefined,
      sortOrder: sortValue as "asc" | "desc",
    });

    res.status(200).json({
      success: true,
      message: "Schools retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
