export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  role: "user" | "admin" | string;
  followedConferences: FollowedConference[];
  calendar: string[];
  createdAt: string;
  updatedAt: string;
}


export type FollowedConference = {
  id: string;
  createdAt: string;
  updatedAt: string;
  followedAt?: string; // Thêm dòng này
}

