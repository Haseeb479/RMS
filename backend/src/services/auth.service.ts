import { prisma } from '../config/database';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';

export class AuthService {
  static async register(email: string, password: string, companyName: string) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        companyId: company.id,
        role: 'admin',
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, companyId: company.id },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { 
      user: { id: user.id, email: user.email, name: user.name }, 
      token 
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Invalid password');

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { 
      user: { id: user.id, email: user.email, name: user.name }, 
      token 
    };
  }
}