import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserSearchFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    return await this.userRepository.save(user);
  }

  async findAll(includeDetails: boolean = true): Promise<User[]> {
    const select = includeDetails 
      ? undefined 
      : ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'department', 'designation'];
    
    return await this.userRepository.find({
      select: select as any,
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithSearch(filters: UserSearchFilters, canViewAllRoles: boolean = true): Promise<PaginatedUsers> {
    const {
      search = '',
      role,
      status,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filter by role
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Filter by department
    if (department) {
      queryBuilder.andWhere('user.department ILIKE :department', { department: `%${department}%` });
    }

    // Role-based access control
    if (!canViewAllRoles) {
      // Managers can only see employees and other managers, not admins or HR
      queryBuilder.andWhere('user.role NOT IN (:...restrictedRoles)', { 
        restrictedRoles: [UserRole.ADMIN, UserRole.HR] 
      });
    }

    // Sorting
    const validSortFields = ['firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'status'], // Include password for authentication
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if being updated
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Update user
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async getStatistics(): Promise<any> {
    const total = await this.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const inactiveUsers = await this.userRepository.count({ where: { status: UserStatus.INACTIVE } });
    const suspendedUsers = await this.userRepository.count({ where: { status: UserStatus.SUSPENDED } });

    const roleDistribution = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role, COUNT(*) as count')
      .groupBy('user.role')
      .getRawMany();

    const departmentDistribution = await this.userRepository
      .createQueryBuilder('user')
      .select('user.department, COUNT(*) as count')
      .where('user.department IS NOT NULL')
      .groupBy('user.department')
      .getRawMany();

    return {
      total,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      roleDistribution,
      departmentDistribution,
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    await this.userRepository.delete(ids);
  }

  async bulkUpdateStatus(ids: string[], status: UserStatus): Promise<void> {
    if (ids.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    await this.userRepository.update(ids, { status });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
