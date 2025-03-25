export type ConferenceListResponse = {
  payload: ConferenceInfo[];
  meta: Meta;
};

export type ConferenceInfo = {
  id: string;
  title: string;
  acronym: string;
  location: Location | null; // Location có thể null
  rank: string | null;       // Thêm rank trực tiếp, và có thể null
  source: string | null;     // Thêm source trực tiếp, có thể null
  year: number | null;        // year có thể null
  researchFields: string[];   // researchFields là một mảng string (có thể rỗng)
  topics: string[];           // topics là một mảng string (có thể rỗng)
  dates: ImportantDates[] | null; // dates là một mảng ImportantDates, hoặc null
  link: string | null;         // link có thể null
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  accessType: string | null;  // accessType có thể null
  status: string;
};

export type Location = {
  cityStateProvince: string | null;
  country: string | null;
  address: string | null;
  continent: string | null;
};

// Loại bỏ RankSourceFoRData, vì nó không phản ánh đúng cấu trúc dữ liệu
// Thay vào đó, 'rank' và 'source' được đưa trực tiếp vào ConferenceInfo

// ImportantDates should be an object, not nullable itself.
export type ImportantDates = {
  name: string;
  type: string;
  fromDate: string | null; // Allow null for individual dates
  toDate: string | null;   // Allow null for individual dates
};

export type Meta = {
  curPage: number;
  perPage: number;
  totalPage: number;
  prevPage: number | null;
  nextPage: number | null;
  totalItems: number;
};