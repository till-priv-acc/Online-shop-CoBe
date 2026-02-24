export interface User {
  id?: string;      // UUID
  name: string;
  password: string;
  email: string;
  isadmin: boolean;     // true = Admin, false = User
}