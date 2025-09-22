import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEmployeeDto) {
    return this.prisma.employees.create({ data: dto });
  }

  findAll() {
    return this.prisma.employees.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(rfid_code: string) {
    return this.prisma.employees.findUnique({
      where: { rfid_code },
    });
  }

  update(id: number, dto: UpdateEmployeeDto) {
    return this.prisma.employees.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.employees.delete({
      where: { id },
    });
  }
}
