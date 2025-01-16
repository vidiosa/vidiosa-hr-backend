"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveDataFinder = exports.leaveDayCounter = void 0;
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const calendar_model_1 = require("../modules/calendar/calendar.model");
const leave_model_1 = require("../modules/leave/leave.model");
const date_fns_1 = require("date-fns");
const leaveDayCounter = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const year = startDate.getFullYear();
    const holidayRecords = yield calendar_model_1.Calendar.find({ year });
    // Flatten the holidays from each record
    const holidays = holidayRecords.flatMap((record) => record.holidays);
    // Ensure start and end are at the start and end of their respective days
    const start = (0, date_fns_1.startOfDay)(startDate);
    const end = (0, date_fns_1.endOfDay)(endDate);
    const daysInterval = (0, date_fns_1.eachDayOfInterval)({ start, end });
    // Modify the holiday filtering logic to handle edge cases
    const holidayDays = holidays.filter((holiday) => {
        const holidayStart = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(new Date(holiday.start_date).toISOString()));
        const holidayEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(new Date(holiday.end_date).toISOString()));
        // Comprehensive overlap check
        return (
        // Holiday starts within the range
        (holidayStart >= start && holidayStart <= end) ||
            // Holiday ends within the range
            (holidayEnd >= start && holidayEnd <= end) ||
            // Holiday completely encompasses the range
            (holidayStart <= start && holidayEnd >= end));
    });
    // Calculate total holidays with precise overlap
    const totalHolidays = holidayDays.reduce((count, holiday) => {
        const holidayStart = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(new Date(holiday.start_date).toISOString()));
        const holidayEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(new Date(holiday.end_date).toISOString()));
        // Determine the precise overlap
        const overlapStart = holidayStart > start ? holidayStart : start;
        const overlapEnd = holidayEnd < end ? holidayEnd : end;
        // Calculate the number of overlapping days
        const overlappingDays = (0, date_fns_1.differenceInDays)(overlapEnd, overlapStart) + 1;
        return count + overlappingDays;
    }, 0);
    // Find all Fridays in the interval
    const fridaysInInterval = daysInterval.filter((day) => (0, date_fns_1.isFriday)(day));
    // Find Fridays that are not within holidays
    const nonHolidayFridays = fridaysInInterval.filter((friday) => !holidayDays.some((holiday) => {
        const holidayStart = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(new Date(holiday.start_date).toISOString()));
        const holidayEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(new Date(holiday.end_date).toISOString()));
        return (0, date_fns_1.isWithinInterval)(friday, {
            start: holidayStart,
            end: holidayEnd,
        });
    }));
    const totalDays = (0, date_fns_1.differenceInDays)(end, start) + 1;
    let finalDays = totalDays;
    // Reduce days for holidays
    finalDays -= totalHolidays;
    // Reduce days for non-holiday Fridays
    finalDays -= nonHolidayFridays.length;
    return finalDays;
});
exports.leaveDayCounter = leaveDayCounter;
// get leave
const leaveDataFinder = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { leave_type, employee_id, start_date } = data;
    const year = start_date.getFullYear();
    const leaveTypes = ["casual", "earned", "sick", "without_pay"];
    if (!leaveTypes.includes(leave_type)) {
        throw new ApiError_1.default("Invalid leave type", 400, "");
    }
    const selectPath = `years.${leave_type}`;
    const leaveData = yield leave_model_1.Leave.findOne({ employee_id, "years.year": year }, { [selectPath]: 1, "years.year": 1, _id: 0 }).exec();
    if (!leaveData) {
        throw new ApiError_1.default(`No leave data found for user ${employee_id} in year ${year}`, 400, "");
    }
    const yearData = leaveData.years.find((y) => y.year === year);
    if (!yearData) {
        throw new Error(`Leave data for year ${year} not found`);
    }
    return yearData;
});
exports.leaveDataFinder = leaveDataFinder;
//# sourceMappingURL=leaveHelper.js.map