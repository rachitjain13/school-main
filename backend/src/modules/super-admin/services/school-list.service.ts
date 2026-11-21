import { School, SchoolStatus } from "../models/school.model";

export interface SchoolListOptions {
  page: number;
  limit: number;
  search?: string;
  status?: SchoolStatus;
  sortOrder: "asc" | "desc";
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getSchools = async (options: SchoolListOptions) => {
  const { page, limit, search, status, sortOrder } = options;

 const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (search?.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, "i");

    filter.$or = [
      { schoolId: searchRegex },
      { schoolName: searchRegex },
      { normalizedSchoolName: searchRegex },
      { registrationNumber: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [schools, total] = await Promise.all([
    School.find(filter)
      .select(
        "schoolId schoolName schoolType registrationNumber officialEmail phone address.city address.state mainAdmin.fullName mainAdmin.email status createdAt updatedAt"
      )
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    School.countDocuments(filter),
  ]);

  return {
    schools,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};
