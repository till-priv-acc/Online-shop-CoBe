export interface User {
  id?: string;      // UUID
  name: string;
  firstname: string;
  hNumber: string;
  street: string;
  town: string;
  pCode: string;
  country: string;
  password: string;
  email: string;
  isAdmin: boolean;     // true = Admin, false = User
}