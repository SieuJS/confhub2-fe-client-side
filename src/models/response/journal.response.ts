// src/models/response/journal.response.ts (Đề xuất tạo một file riêng cho types)

// Kiểu cho các mục trong mảng bioxbio
type BioxbioItem = {
  Year: string;
  Impact_factor: string;
};

// Kiểu cho đối tượng "Subject Area and Category"
type SubjectAreaAndCategory = {
  "Field of Research": string;
  Topics: string[];
};

// Kiểu cho đối tượng "Information"
type Information = {
  Homepage: string;
  "How to publish in this journal": string;
  Mail: string;
};

// Kiểu cho các mục trong mảng "SupplementaryTable"
type SupplementaryTableItem = {
  Category: string;
  Year: string; // Trong JSON là chuỗi, ví dụ "2022"
  Quartile: string;
};

// Định nghĩa type cho từng đối tượng Journal trong mảng 'data'
export type JournalData = { // Đổi tên từ JournalResponseData thành JournalData để rõ ràng hơn
  id: string;
  scimagoLink: string;
  hIndex: number
  bioxbio: BioxbioItem[]; // API trả về mảng rỗng [], không phải null
  Image: string;
  Image_Context: string;
  Rank: string;
  Sourceid: string;
  Title: string; // "Health Education Journal"
  Type: string; // "journal"
  Issn: string; // "00178969, 17488176"
  SJR: number; // Trong JSON là số (461)
  Statistics: { category: string; statistic: string }[];
  Overton: number; // Trong JSON là số (0)
  SDG: number; // Trong JSON là số (0)
  Country: string;
  Region: string;
  Publisher: string;
  Coverage: string;
  Categories: string[];
  Areas: string;
  "Subject Area and Category": SubjectAreaAndCategory;
  Information: Information;
  Scope?: string; // Tùy chọn
  "Additional Info"?: string; // Tùy chọn
  SupplementaryTable: SupplementaryTableItem[];
  Thumbnail: string;
  createdAt: string; // Thêm nếu cần dùng
  updatedAt: string; // Thêm nếu cần dùng
};

// Định nghĩa type cho toàn bộ phản hồi từ API
export type JournalApiResponse = { // Đổi tên thành JournalApiResponse để rõ ràng
  data: JournalData[]; // Đây là MẢNG các đối tượng Journal
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};