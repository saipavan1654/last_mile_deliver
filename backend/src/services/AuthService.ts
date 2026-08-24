import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError, UnauthorizedError } from '../utils/errors';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('User with this email already exists', 400, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserRepository.createUser({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role || Role.CUSTOMER,
    });

    const token = this.generateToken(user.id, user.email, user.role, user.deliveryAgent?.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentId: user.deliveryAgent?.id,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role, user.deliveryAgent?.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentId: user.deliveryAgent?.id,
      },
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      agentId: user.deliveryAgent?.id,
      customerProfile: user.customerProfile,
      deliveryAgent: user.deliveryAgent,
    };
  }

  private static generateToken(userId: string, email: string, role: Role, agentId?: string): string {
    return jwt.sign(
      { id: userId, email, role, agentId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }
}
