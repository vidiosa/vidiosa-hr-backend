import { paginationHelpers } from "@/lib/paginationHelper";
import { PaginationType } from "@/types";
import { PipelineStage } from "mongoose";
import { EmployeeOffboarding } from "./employee-offboarding.model";
import {
  EmployeeOffboardingFilterOptions,
  EmployeeOffboardingType,
} from "./employee-offboarding.type";

// get all data
const getAllEmployeeOffboardingService = async (
  paginationOptions: Partial<PaginationType>,
  filterOptions: Partial<EmployeeOffboardingFilterOptions>
) => {
  let matchStage: any = {
    $match: {},
  };
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Extract search and filter options
  const { search } = filterOptions;

  // Search condition
  if (search) {
    const searchKeyword = String(search).replace(/\+/g, " ");
    const keywords = searchKeyword.split("|");
    const searchConditions = keywords.map((keyword) => ({
      $or: [{ employee_id: { $regex: keyword, $options: "i" } }],
    }));
    matchStage.$match.$or = searchConditions;
  }

  let pipeline: PipelineStage[] = [matchStage];

  pipeline.push({ $sort: { updatedAt: -1 } });

  if (skip) {
    pipeline.push({ $skip: skip });
  }
  if (limit) {
    pipeline.push({ $limit: limit });
  }

  pipeline.push(
    {
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "id",
        as: "employee",
      },
    },
    {
      $project: {
        _id: 0,
        employee_id: 1,
        fingerprint: 1,
        id_card: 1,
        appointment_letter: 1,
        employment_contract: 1,
        welcome_kit: 1,
        office_intro: 1,
        "employee.name": 1,
        "employee.image": 1,
      },
    }
  );

  const result = await EmployeeOffboarding.aggregate(pipeline);
  const total = await EmployeeOffboarding.countDocuments();
  return {
    result: result,
    meta: {
      total: total,
    },
  };
};

// get single data
const getEmployeeOffboardingService = async (id: string) => {
  const result = await EmployeeOffboarding.findOne({ employee_id: id });
  return result;
};

// add or update
const updateEmployeeOffboardingService = async (
  id: string,
  updateData: EmployeeOffboardingType
) => {
  const result = await EmployeeOffboarding.findOneAndUpdate(
    { employee_id: id },
    updateData,
    {
      new: true,
      upsert: true,
    }
  );
  return result;
};

// delete
const deleteEmployeeOffboardingService = async (id: string) => {
  await EmployeeOffboarding.findOneAndDelete({ employee_id: id });
};

export const employeeOffboardingService = {
  getAllEmployeeOffboardingService,
  getEmployeeOffboardingService,
  deleteEmployeeOffboardingService,
  updateEmployeeOffboardingService,
};
