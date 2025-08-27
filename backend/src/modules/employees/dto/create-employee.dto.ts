import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsEnum, 
  IsNotEmpty, 
  MinLength, 
  MaxLength,
  IsPositive,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EmployeeStatus, EmploymentType } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString({ message: 'Employee ID must be a string' })
  @IsNotEmpty({ message: 'Employee ID is required' })
  @MinLength(3, { message: 'Employee ID must be at least 3 characters' })
  @MaxLength(20, { message: 'Employee ID must not exceed 20 characters' })
  empId: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Please provide a valid 10-digit Indian mobile number' })
  phone: string;

  @IsString({ message: 'Department must be a string' })
  @IsNotEmpty({ message: 'Department is required' })
  department: string;

  @IsString({ message: 'Designation must be a string' })
  @IsNotEmpty({ message: 'Designation is required' })
  designation: string;

  @IsNumber({}, { message: 'Salary must be a number' })
  @IsPositive({ message: 'Salary must be a positive number' })
  @Transform(({ value }) => parseFloat(value))
  salary: number;

  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'Status must be a valid employee status' })
  status?: EmployeeStatus;

  @IsOptional()
  @IsEnum(EmploymentType, { message: 'Employment type must be a valid type' })
  employmentType?: EmploymentType;

  @IsDateString({}, { message: 'Joining date must be a valid date' })
  @IsNotEmpty({ message: 'Joining date is required' })
  joiningDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'Last working date must be a valid date' })
  lastWorkingDate?: string;

  @IsOptional()
  @IsString({ message: 'Manager ID must be a string' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Pincode must be a string' })
  @Matches(/^\d{6}$/, { message: 'Please provide a valid 6-digit pincode' })
  pincode?: string;

  @IsOptional()
  @IsString({ message: 'Emergency contact must be a string' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Please provide a valid 10-digit emergency contact number' })
  emergencyContact?: string;

  @IsOptional()
  @IsString({ message: 'Bank account must be a string' })
  bankAccount?: string;

  @IsOptional()
  @IsString({ message: 'IFSC code must be a string' })
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Please provide a valid IFSC code' })
  ifscCode?: string;

  @IsOptional()
  @IsString({ message: 'PAN number must be a string' })
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Please provide a valid PAN number' })
  panNumber?: string;

  @IsOptional()
  @IsString({ message: 'Aadhar number must be a string' })
  @Matches(/^\d{12}$/, { message: 'Please provide a valid 12-digit Aadhar number' })
  aadharNumber?: string;

  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  profilePicture?: string;

  @IsOptional()
  @IsString({ message: 'Skills must be a string' })
  skills?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
