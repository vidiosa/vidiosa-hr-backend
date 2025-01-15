export type PrevJob = {
  company_name: string;
  company_website: string;
  designation: string;
  start_date: Date;
  end_date: Date;
  job_type: string;
};

export type Promotion = {
  designation: string;
  promotion_date: Date;
};

export type EmployeeJobType = {
  employee_id: string;
  job_type: string;
  joining_date: Date;
  designation: string;
  permanent_date: Date;
  company_name: string;
  company_website: string;
  resignation_date: Date;
  prev_jobs: PrevJob[];
  promotions: Promotion[];
  note: string;
};

export type EmployeeJobFilterOptions = {
  search?: string;
  designation?: string;
};
