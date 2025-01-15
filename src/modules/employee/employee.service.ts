import ApiError from "@/errors/ApiError";
import { generateEmployeeId } from "@/lib/employeeIdGenerator";
import { paginationHelpers } from "@/lib/paginationHelper";
import { PaginationType } from "@/types";
import httpStatus from "http-status";
import { PipelineStage } from "mongoose";
import { Employee } from "./employee.model";
import {
  EmployeeCreateType,
  EmployeeFilterOptions,
  EmployeeType,
} from "./employee.type";

// get all employees
const getAllEmployeeService = async (
  paginationOptions: Partial<PaginationType>,
  filterOptions: EmployeeFilterOptions
) => {
  const { limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Extract search and filter options
  const { search, department } = filterOptions;

  // Create a text search stage for multiple fields
  let matchStage: any = {
    $match: {},
  };

  // Search condition
  if (search) {
    const searchKeyword = String(search).replace(/\+/g, " ");
    const keywords = searchKeyword.split("|");
    const searchConditions = keywords.map((keyword) => ({
      $or: [
        { work_email: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
      ],
    }));
    matchStage.$match.$or = searchConditions;
  }

  // department condition
  if (department) {
    matchStage.$match.department = department;
  }

  let pipeline: PipelineStage[] = [matchStage];

  // Sorting stage
  pipeline.push({
    $sort: {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
      _id: 1,
    },
  });

  if (skip) {
    pipeline.push({ $skip: skip });
  }
  if (limit) {
    pipeline.push({ $limit: limit });
  }

  pipeline.push(
    {
      $lookup: {
        from: "employee_personas",
        localField: "id",
        foreignField: "id",
        as: "persona",
      },
    },
    {
      $project: {
        id: 1,
        name: 1,
        image: 1,
        createdAt: 1,
        "persona.image": 1,
      },
    }
  );

  // Reapply sorting after grouping
  pipeline.push({
    $sort: {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    },
  });

  // result
  const result = await Employee.aggregate(pipeline);
  const total = await Employee.countDocuments(matchStage.$match);

  return {
    result: result,
    meta: {
      total: total,
    },
  };
};

// get single employee
const getSingleEmployeeService = async (
  id: string
): Promise<EmployeeType | null> => {
  const employee = await Employee.aggregate([
    {
      $match: { id: id },
    },
    {
      $lookup: {
        from: "employee_personas",
        localField: "id",
        foreignField: "id",
        as: "persona",
      },
    },
    {
      $project: {
        id: 1,
        name: 1,
        image: 1,
        createdAt: 1,
        "persona.image": 1,
      },
    },
  ]);

  return employee[0];
};

// insert employee
const createEmployeeService = async (employeeData: EmployeeCreateType) => {
  // count data by department
  const departmentSerial =
    (await Employee.countDocuments({ department: employeeData.department })) +
    1;

  const employeeId = generateEmployeeId(
    employeeData.department,
    employeeData.joining_date,
    departmentSerial
  );

  const newEmployeeData = {
    id: employeeId,
    department: employeeData.department,
    personal_email: employeeData.personal_email,
  };

  const newData = new Employee(newEmployeeData);
  const insertedEmployee = await newData.save();

  return insertedEmployee;
};

// update
const updateEmployeeService = async (updatedData: EmployeeType, id: string) => {
  // const employee = await Employee.findOne({ id });
  // if (
  //   employee?.image !== updatedData.image &&
  //   employee?.image &&
  //   !employee.image.startsWith("http")
  // ) {
  //   await deleteFile(employee?.image);
  // }
  const result = await Employee.findOneAndUpdate({ id: id }, updatedData, {
    new: true,
  });
  return result;
};

// update employee note
const updateEmployeeNoteService = async (note: string, id: string) => {
  const result = await Employee.findOneAndUpdate(
    { id: id },
    { note },
    {
      new: true,
    }
  );
  return result;
};

// delete employee
const deleteEmployeeService = async (id: string) => {
  try {
    const deleteEmployee = await Employee.findOneAndDelete(
      { id: id },
      { new: true }
    );

    if (!deleteEmployee) {
      throw new ApiError("employee is not delete", httpStatus.FORBIDDEN, "");
    }
  } catch (error) {
    throw new ApiError("employee is not delete", httpStatus.FORBIDDEN, "");
  }
};

export const employeeService = {
  getAllEmployeeService,
  createEmployeeService,
  getSingleEmployeeService,
  updateEmployeeService,
  updateEmployeeNoteService,
  deleteEmployeeService,
};
