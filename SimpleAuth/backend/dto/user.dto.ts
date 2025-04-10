import { UserRole } from '../types';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  role: UserRole;
  number?: string;
  department?: string;
  position?: string;
  birthdate?: Date;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  surname?: string;
  number?: string;
  department?: string;
  position?: string;
  birthdate?: Date;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  number?: string;
  department?: string;
  position?: string;
  birthdate?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  user: UserResponseDto;
  token: string;
}