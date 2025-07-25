import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
