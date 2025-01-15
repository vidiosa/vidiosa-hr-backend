import { paginationField } from "@/config/constants";
import catchAsync from "@/lib/catchAsync";
import pick from "@/lib/filterPicker";
import { sendResponse } from "@/lib/sendResponse";
import { Request, Response } from "express";
import { leaveService } from "./leave.service";

// get all data
const getAllLeaveController = catchAsync(
  async (req: Request, res: Response) => {
    const paginationOptions = pick(req.query, paginationField);
    const filterOption = pick(req.query, ["search"]);

    const leave = await leaveService.getAllLeaveService(
      paginationOptions,
      filterOption
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      result: leave.result,
      meta: leave.meta,
      message: "data get successfully",
    });
  }
);

// get single data
const getLeaveController = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const leave = await leaveService.getLeaveService(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    result: leave,
    message: "data get successfully",
  });
});

// create data
const createLeaveController = catchAsync(
  async (req: Request, res: Response) => {
    const leaveData = req.body;
    const leave = await leaveService.createLeaveService(leaveData);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      result: leave,
      message: "data created successfully",
    });
  }
);

// update data
const updateLeaveController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const updateData = req.body;

    await leaveService.updateLeaveService(id, updateData);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "data updated successfully",
    });
  }
);

// delete data
const deleteLeaveController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    await leaveService.deleteLeaveService(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "data deleted successfully",
    });
  }
);

export const leaveController = {
  getAllLeaveController,
  getLeaveController,
  createLeaveController,
  updateLeaveController,
  deleteLeaveController,
};
