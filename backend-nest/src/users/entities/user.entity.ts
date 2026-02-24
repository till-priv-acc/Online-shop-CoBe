export interface User {
  id?: string;      // UUID
  name: string;
  password: string;
  email: string;
  isAdmin: boolean;     // true = Admin, false = User
}