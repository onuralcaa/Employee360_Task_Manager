export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseError {
  message: string;
  code?: string;
  status?: number;
}