import { BaseEntity, UserRole } from '../../types';

export interface User extends BaseEntity {
  username: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  number?: string;
  department?: string;
  position?: string;
  birthdate?: Date;
  isActive: boolean;
  lastLogin?: Date;
}

export class UserEntity implements User {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  number?: string;
  department?: string;
  position?: string;
  birthdate?: Date;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
    this.isActive = props.isActive ?? true;
  }

  get fullName(): string {
    return `${this.name} ${this.surname}`;
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }

  updateLastLogin(): void {
    this.lastLogin = new Date();
  }
}