import { prisma as defaultPrisma } from '../config/prisma.js';

export class UserRepository {
  constructor(prismaClient = defaultPrisma) {
    this.prisma = prismaClient;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async createUser(userData) {
    return this.prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        name: userData.name,
        role: userData.role || 'CUSTOMER'
      }
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;
