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
  type!: string;

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
  type!: string;

  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
  }
}

// DTO für Create User Request
export class UpdateUserDto {
  name!: string;
  firstname!: string;
  hNumber!: string;
  street!: string;
  town!: string;
  pCode!: string;
  country!: string;

  constructor(partial: Partial<UpdateUserDto>) {
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
  type!: string;

  constructor(partial: Partial<GetUserDto>) {
    // Default setzen, nur wenn type fehlt oder nicht string ist
    if (partial.type == null) {
      partial.type = 'USER';
    } else if (typeof partial.type !== 'string') {
      partial.type = String(partial.type); // boolean → string
    }

    Object.assign(this, partial);
  }
}

export class UpdatePasswordDto {
  currentPassword!: string;
  newPassword!: string;
}

export class UpdateUserRoleDto {
  userId!: string;
  type!: string;
}