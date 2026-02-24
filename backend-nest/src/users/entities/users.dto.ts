import { v4 as uuidv4 } from 'uuid';

export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  isAdmin!: boolean;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    this.id = this.id ?? uuidv4(); // sauberer als if (!this.id)
  }
}

// DTO für Create User Request
export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;
  isAdmin!: boolean;
}

// DTO für Get User Response
export class GetUserDto {
  id!: string;
  name!: string;
  email!: string;
  isAdmin!: boolean;

  constructor(partial: Partial<GetUserDto>) {
    Object.assign(this, partial);
  }
}