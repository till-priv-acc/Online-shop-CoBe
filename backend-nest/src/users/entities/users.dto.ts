import { v4 as uuidv4 } from 'uuid';

export class UserEntity {
  id!: string;
  name!: string;
  firstname!: string;
  hNumber!: string;
  street!: string;
  town!: string;
  pCode!: string;
  country!: string;
  password!: string;
  email!: string;
  isAdmin!: boolean;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    this.id = this.id ?? uuidv4();
  }
}

// DTO für Create User Request
export class CreateUserDto {
  name!: string;
  firstname!: string;
  hNumber!: string;
  street!: string;
  town!: string;
  pCode!: string;
  country!: string;
  email!: string;
  password!: string;
  isAdmin: boolean = false;

  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
  }
}

// DTO für Get User Response
export class GetUserDto {
  id!: string;
  name!: string;
  firstname!: string;
  hNumber!: string;
  street!: string;
  town!: string;
  pCode!: string;
  country!: string;
  email!: string;
  isAdmin!: boolean;

  constructor(partial: Partial<GetUserDto>) {
    Object.assign(this, partial);
  }
}

export class UpdatePasswordDto {
  currentPassword!: string;
  newPassword!: string;
}