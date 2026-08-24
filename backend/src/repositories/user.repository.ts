import { prisma } from './prisma';
import { Role } from '@prisma/client';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        deliveryAgent: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: true,
        deliveryAgent: true,
      },
    });
  }

  static async createUser(data: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: Role;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
        ...(data.role === Role.CUSTOMER
          ? { customerProfile: { create: {} } }
          : {}),
        ...(data.role === Role.DELIVERY_AGENT
          ? {
              deliveryAgent: {
                create: {
                  employeeCode: `AGT-${Math.floor(1000 + Math.random() * 9000)}`,
                  phone: data.phone,
                },
              },
            }
          : {}),
      },
      include: {
        customerProfile: true,
        deliveryAgent: true,
      },
    });
  }

  static async findAllCustomers() {
    return prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
