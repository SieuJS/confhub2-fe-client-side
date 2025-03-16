export type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string; 
  role: "user" | "admin" | string; 
  createdAt: string; 
  updatedAt: string; 
}

