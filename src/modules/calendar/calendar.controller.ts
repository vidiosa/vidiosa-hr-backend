import catchAsync from "@/lib/catchAsync";
import { sendResponse } from "@/lib/sendResponse";
import { Request, Response } from "express";
import { calendarService } from "./calendar.service";

// get all data
const getAllCalendarController = catchAsync(
  async (req: Request, res: Response) => {
    const calendar = await calendarService.getAllCalendarService();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      result: calendar,
      meta: {
        total: calendar.length,
      },
      message: "data get successfully",
    });
  }
);

// create data
const createCalendarController = catchAsync(
  async (req: Request, res: Response) => {
    const calendarData = req.body;
    const calendar = await calendarService.createCalendarService(calendarData);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      result: calendar,
      message: "data created successfully",
    });
  }
);

// update data
const updateCalendarController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const updateData = req.body;

    await calendarService.updateCalendarService(id, updateData);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "data updated successfully",
    });
  }
);

// delete data
const deleteCalendarController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    await calendarService.deleteCalendarService(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "data deleted successfully",
    });
  }
);

export const calendarController = {
  getAllCalendarController,
  createCalendarController,
  updateCalendarController,
  deleteCalendarController,
};
