export type JournalResponse = {
  id: string; // Optional, if you still need it
  title: string;
  scimagoLink: string;
  bioxbio: BioxbioItem[]; // Mảng các đối tượng BioxbioItem
  Title: string;
  Type: string;
  SJR: string;
  "H index": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng
  "Total Docs. (2023)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Total Docs. (3years)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Total Refs. (2023)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Total Cites (3years)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Citable Docs. (3years)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Cites / Doc. (2years)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "Ref. / Doc. (2023)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng và ký tự đặc biệt
  "%Female (2023)": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có ký tự đặc biệt
  Country: string;
  "Subject Area and Category": SubjectAreaAndCategory; // Đối tượng SubjectAreaAndCategory
  Publisher: string;
  ISSN: string;
  Information: Information; // Đối tượng Information
  Scope: string;
  SupplementaryTable: SupplementaryTableItem[]; // Mảng các đối tượng SupplementaryTableItem
  Thumbnail: string;
  Image: string;
  Image_Context: string;
};

// Định nghĩa kiểu cho các thuộc tính phức tạp hơn (nested objects và arrays)

type BioxbioItem = {
  Year: string;
  Impact_factor: string;
};

type SubjectAreaAndCategory = {
  "Field of Research": string;
  Topics: string[]; // Mảng các string
};

type Information = {
  Homepage: string;
  "How to publish in this journal": string; // Sử dụng dấu ngoặc kép vì tên thuộc tính có khoảng trắng
  Mail: string;
};

type SupplementaryTableItem = {
  Category: string;
  Year: string;
  Quartile: string;
};