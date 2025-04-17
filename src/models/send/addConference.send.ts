export interface ConferenceFormData {
  title: string
  acronym: string
  link: string
  topics: string[]
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  imageUrl: string
  description: string
}

export interface LocationInput {
  address: string
  cityStateProvince: string
  country: string
  continent: string
}

export interface ImportantDateInput {
  type: string
  name: string
  fromDate: string
  toDate: string
}

export interface Country {
  name: string
  iso2: string
  region: string
}

export interface State {
  name: string
  iso2: string
  country_code: string
  state_code: string
}

export interface City {
  name: string
  country_code: string
  state_code: string
  latitude: string
  longitude: string
}

// Kiểu cho conference sau khi đã được xử lý và thêm các trường cần thiết
export interface AddedConference {
    conference: {
        id: string;
        title: string;
        acronym: string;
        creatorId: string; // Thêm creatorId
        createdAt: string;
        updatedAt: string;
    };
    organization: {
        id: string;
        year: number;
        accessType: string;
        isAvailable: boolean;
        conferenceId: string;
        summerize: string;
        callForPaper: string; // Có thể để trống, hoặc thêm logic để tạo tự động
        link: string;
        cfpLink: string;      // Có thể để trống, hoặc thêm logic
        impLink: string;      // Có thể để trống
        topics: string[];
        createdAt: string;
        updatedAt: string;
    };
    location: {
        id: string;
        address: string;
        cityStateProvince: string;
        country: string;
        continent: string;
        createdAt: string;
        updatedAt: string;
        isAvailable: boolean;
        organizeId: string;
    };
    dates: {
        id: string;
        organizedId: string;
        fromDate: string;
        toDate: string;
        type: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        isAvailable: boolean;
    }[];
    rankSourceFoRData: { // Có thể để mảng rỗng, hoặc thêm logic
        rank: string;
        source: string;
        researchFields: string;
    }[];
    status: string; // Thêm trạng thái
}