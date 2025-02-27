export type JournalResponse = {
  id: string;
  title: string;
  abbreviation?: string;
  alternativeTitles?: string[];
  publicationType: "Journal" | "Conference Proceedings" | "Book Series" | string;
  subjectAreas: {
    area: string;
    quartile?: "Q1" | "Q2" | "Q3" | "Q4" | string;
  }[];
  publisher: string;
  countryOfPublication: string;
  issn: string[];
  language?: string;
  bestQuartileOverall?: "Q1" | "Q2" | "Q3" | "Q4" | string;
  coverageHistory: {
    startYear: number;
    endYear?: number;
    isCurrentlyPublished?: boolean;
  };
  openAccessType?: "Gold Open Access" | "Green Open Access" | "Hybrid Open Access" | "Closed Access" | "Bronze Open Access" | "Diamond Open Access" | "Unknown" | string;
  peerReviewType?: "Single-blind" | "Double-blind" | "Open Peer Review" | "Triple-blind" | "No Peer Review" | "Unknown" | string;
  contactInfo?: {
    email?: string;
    website?: string;
    address?: string;
    phone?: string;
  };
  indexingDatabases?: {
    name: string;
    coverageYears?: string;
    databaseLink?: string;
  }[];
  metrics?: {
    impactFactor?: number; // Impact Factor (vẫn giữ lại)
    citeScore?: number; // CiteScore (vẫn giữ lại)
    eigenfactor?: number; // Eigenfactor Score (vẫn giữ lại)
    articleInfluenceScore?: number; // Article Influence Score (vẫn giữ lại)
    h5Index?: number; // h5-index (vẫn giữ lại)
    impactFactorHistory?: { // Lịch sử Impact Factor (vẫn giữ lại)
      year: number;
      impactFactor: number;
    }[];
    overallRank?: number; // **MỚI: Overall Rank**
    hIndex?: number;      // **MỚI: H-index**
    sjr?: number;         // **MỚI: SJR (SCImago Journal Rank)**
  };
  url?: string;
  isDiscontinued?: boolean;
  notes?: string;
  imageUrl?: string;

};