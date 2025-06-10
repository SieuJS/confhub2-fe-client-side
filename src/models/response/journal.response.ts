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
  bioxbio: BioxbioItem[]; // API trả về mảng rỗng [], không phải null
  Image: string;
  Image_Context: string;
  Rank: string;
  Sourceid: string;
  Title: string; // "Health Education Journal"
  Type: string; // "journal"
  Issn: string; // "00178969, 17488176"
  SJR: number; // Trong JSON là số (461)
  "SJR Best Quartile": string;
  "H index": string; // Trong JSON là chuỗi, ví dụ "40"
  "Total Docs. (2023)": string; // Trong JSON là chuỗi, ví dụ "75"
  "Total Docs. (3years)": string; // Trong JSON là chuỗi, ví dụ "228"
  "Total Refs.": string; // Trong JSON là chuỗi, ví dụ "2966"
  "Total Cites (3years)": string; // Trong JSON là chuỗi, ví dụ "337"
  "Citable Docs. (3years)": string; // Trong JSON là chuỗi, ví dụ "226"
  "Cites / Doc. (2years)": string; // Trong JSON là chuỗi, ví dụ "139"
  "Ref. / Doc.": string; // Trong JSON là chuỗi, ví dụ "3955"
  "%Female": string; // Trong JSON là chuỗi, ví dụ "6469"
  Overton: number; // Trong JSON là số (0)
  SDG: number; // Trong JSON là số (0)
  Country: string;
  Region: string;
  Publisher: string;
  Coverage: string;
  Categories: string;
  Areas: string;
  title: string; // Đôi khi có thể trùng lặp với Title nhưng vẫn nên giữ cả hai nếu API cung cấp
  "Subject Area and Category": SubjectAreaAndCategory;
  ISSN: string; // Trùng với Issn nhưng vẫn nên giữ cả hai nếu API cung cấp
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