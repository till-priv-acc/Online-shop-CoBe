import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, GetUserDto, UpdateUserDto } from './entities/users.dto';
import { UserLogger } from '../logger/user-logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: UserLogger,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    this.logger.log(`[UsersService] User creation started for email: ${createUserDto.email}`);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepo.create({ ...createUserDto, password: hashedPassword });

    await this.userRepo.save(user);

    this.logger.log(`[UsersService] User created successfully: ${user.email}`);

    return new GetUserDto({
      id: user.id,
      name: user.name,
      firstname: user.firstname,
      hNumber: user.hNumber,
      street: user.street,
      town: user.town,
      pCode: user.pCode,
      country: user.country,
      email: user.email,
      type: user.type,
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<boolean> {
    this.logger.log(`[UsersService] User update started for userId: ${userId}`);

    const result = await this.userRepo.update(userId, updateUserDto);

    if (result.affected && result.affected > 0) {
      this.logger.log(`[UsersService] User updated successfully: ${userId}`);
      return true;
    } else {
      this.logger.warn(`[UsersService] No user found with id: ${userId}`);
      return false;
    }
  }

  async findById(id: string): Promise<GetUserDto | null> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`[UsersService] No user found with ID: ${id}`);
      return null;
    }

    this.logger.log(`[UsersService] User found: ${user.email}`);
    return new GetUserDto(user);
  }

  async findAll(): Promise<GetUserDto[]> {
    const users = await this.userRepo.find();

    this.logger.log(`[UsersService] Total users fetched: ${users.length}`);
    return users.map(u => new GetUserDto(u));
  }

  async updatePassword(userId: string, currentPlainPassword: string, newPlainPassword: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`[UsersService] No user found with id: ${userId}`);
      return false;
    }

    const isMatch = await bcrypt.compare(currentPlainPassword, user.password);
    if (!isMatch) {
      this.logger.warn(`[UsersService] Invalid current password for userId: ${userId}`);
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);
    await this.userRepo.update(userId, { password: hashedPassword });

    this.logger.log(`[UsersService] Password updated successfully for userId: ${userId}`);
    return true;
  }

  async updateUserRole(userId: string, userRole: string): Promise<boolean> {
    const result = await this.userRepo.update(userId, { type: userRole });

    if (result.affected && result.affected > 0) {
      this.logger.log(`[UsersService] Role updated for userId: ${userId}`);
      return true;
    } else {
      this.logger.warn(`[UsersService] No user found to update role: ${userId}`);
      return false;
    }
  }

  async validateUser(email: string, plainPassword: string): Promise<string | null> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`[UsersService] No user found with email: ${email}`);
      return null;
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (isMatch) {
      this.logger.log(`[UsersService] User validated successfully: ${email}`);
      return user.id;
    } else {
      this.logger.warn(`[UsersService] Invalid password for user: ${email}`);
      return null;
    }
  }
}