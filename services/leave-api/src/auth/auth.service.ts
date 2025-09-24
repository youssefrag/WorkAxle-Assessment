import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) { }
  
  async loginEmail(email: string): Promise<string | null> {
    const emp = await this.prisma.employee.findUnique({ where: { email } })
    if (!emp) return null;
    const payload = {
      sub: emp.id,
      email: emp.email,
      teamId: emp.teamId,
    };
    return this.jwt.sign(payload)
  }
}
