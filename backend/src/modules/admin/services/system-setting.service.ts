import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { SystemSetting, SettingType, SettingCategory } from '../entities/system-setting.entity';
import { User } from '../../users/entities/user.entity';
import { CreateSystemSettingDto, UpdateSystemSettingDto, UpdateSettingValueDto, SystemSettingFilterDto } from '../dto/system-setting.dto';

@Injectable()
export class SystemSettingService {
  constructor(
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSystemSettingDto: CreateSystemSettingDto, userId: string): Promise<SystemSetting> {
    // Check if key already exists
    const existingSetting = await this.systemSettingRepository.findOne({
      where: { key: createSystemSettingDto.key },
    });

    if (existingSetting) {
      throw new BadRequestException('Setting with this key already exists');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const setting = this.systemSettingRepository.create({
      ...createSystemSettingDto,
      lastModifiedBy: user,
    });

    return await this.systemSettingRepository.save(setting);
  }

  async findAll(filters: SystemSettingFilterDto) {
    const {
      search,
      category,
      type,
      editableOnly,
      secretOnly,
      page = 1,
      limit = 20,
      sortBy = 'category',
      sortOrder = 'ASC',
    } = filters;

    const queryBuilder = this.systemSettingRepository
      .createQueryBuilder('setting')
      .leftJoinAndSelect('setting.lastModifiedBy', 'lastModifiedBy');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(setting.key ILIKE :search OR setting.name ILIKE :search OR setting.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('setting.category = :category', { category });
    }

    // Type filter
    if (type) {
      queryBuilder.andWhere('setting.type = :type', { type });
    }

    // Editable filter
    if (editableOnly) {
      queryBuilder.andWhere('setting.isEditable = true');
    }

    // Secret filter
    if (secretOnly !== undefined) {
      queryBuilder.andWhere('setting.isSecret = :secretOnly', { secretOnly });
    }

    // Sorting
    if (sortBy === 'category') {
      queryBuilder.orderBy('setting.category', sortOrder).addOrderBy('setting.sortOrder', 'ASC');
    } else {
      queryBuilder.orderBy(`setting.${sortBy}`, sortOrder);
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [settings, total] = await queryBuilder.getManyAndCount();

    return {
      data: settings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<SystemSetting> {
    const setting = await this.systemSettingRepository.findOne({
      where: { id },
      relations: ['lastModifiedBy'],
    });

    if (!setting) {
      throw new NotFoundException('System setting not found');
    }

    return setting;
  }

  async findByKey(key: string): Promise<SystemSetting> {
    const setting = await this.systemSettingRepository.findOne({
      where: { key },
      relations: ['lastModifiedBy'],
    });

    if (!setting) {
      throw new NotFoundException(`System setting with key '${key}' not found`);
    }

    return setting;
  }

  async update(id: string, updateSystemSettingDto: UpdateSystemSettingDto, userId: string): Promise<SystemSetting> {
    const setting = await this.findOne(id);

    if (!setting.isEditable) {
      throw new BadRequestException('This setting is not editable');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate the new value if type is changing
    if (updateSystemSettingDto.type && updateSystemSettingDto.value) {
      this.validateSettingValue(updateSystemSettingDto.value, updateSystemSettingDto.type);
    }

    Object.assign(setting, updateSystemSettingDto);
    setting.lastModifiedBy = user;

    return await this.systemSettingRepository.save(setting);
  }

  async updateValue(id: string, updateValueDto: UpdateSettingValueDto, userId: string): Promise<SystemSetting> {
    const setting = await this.findOne(id);

    if (!setting.isEditable) {
      throw new BadRequestException('This setting is not editable');
    }

    // Validate the new value
    this.validateSettingValue(updateValueDto.value, setting.type);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    setting.value = updateValueDto.value;
    setting.lastModifiedBy = user;

    return await this.systemSettingRepository.save(setting);
  }

  async updateByKey(key: string, value: string, userId?: string): Promise<SystemSetting> {
    const setting = await this.findByKey(key);

    if (!setting.isEditable) {
      throw new BadRequestException('This setting is not editable');
    }

    // Validate the new value
    this.validateSettingValue(value, setting.type);

    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        setting.lastModifiedBy = user;
      }
    }

    setting.value = value;

    return await this.systemSettingRepository.save(setting);
  }

  async remove(id: string): Promise<void> {
    const setting = await this.findOne(id);
    await this.systemSettingRepository.remove(setting);
  }

  async getSettingsByCategory(category: SettingCategory): Promise<SystemSetting[]> {
    return await this.systemSettingRepository.find({
      where: { category },
      relations: ['lastModifiedBy'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getPublicSettings(): Promise<{ [key: string]: any }> {
    const settings = await this.systemSettingRepository.find({
      where: { isSecret: false },
    });

    const publicSettings: { [key: string]: any } = {};
    settings.forEach(setting => {
      publicSettings[setting.key] = setting.parsedValue;
    });

    return publicSettings;
  }

  async resetToDefault(id: string, userId: string): Promise<SystemSetting> {
    const setting = await this.findOne(id);

    if (!setting.isEditable) {
      throw new BadRequestException('This setting is not editable');
    }

    if (!setting.defaultValue) {
      throw new BadRequestException('No default value available for this setting');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    setting.value = setting.defaultValue;
    setting.lastModifiedBy = user;

    return await this.systemSettingRepository.save(setting);
  }

  async bulkUpdate(updates: { key: string; value: string }[], userId: string): Promise<SystemSetting[]> {
    const results: SystemSetting[] = [];

    for (const update of updates) {
      try {
        const setting = await this.updateByKey(update.key, update.value, userId);
        results.push(setting);
      } catch (error) {
        // Continue with other updates even if one fails
        console.error(`Failed to update setting ${update.key}:`, error.message);
      }
    }

    return results;
  }

  private validateSettingValue(value: string, type: SettingType): void {
    switch (type) {
      case SettingType.BOOLEAN:
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException('Boolean setting must be "true" or "false"');
        }
        break;
      case SettingType.NUMBER:
        if (isNaN(parseFloat(value))) {
          throw new BadRequestException('Number setting must be a valid number');
        }
        break;
      case SettingType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new BadRequestException('Email setting must be a valid email address');
        }
        break;
      case SettingType.URL:
        try {
          new URL(value);
        } catch {
          throw new BadRequestException('URL setting must be a valid URL');
        }
        break;
      case SettingType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException('JSON setting must be valid JSON');
        }
        break;
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'app.name',
        value: 'IT ERP System',
        type: SettingType.STRING,
        category: SettingCategory.GENERAL,
        name: 'Application Name',
        description: 'The name of the application',
        isEditable: true,
        sortOrder: 1,
      },
      {
        key: 'app.version',
        value: '1.0.0',
        type: SettingType.STRING,
        category: SettingCategory.GENERAL,
        name: 'Application Version',
        description: 'Current version of the application',
        isEditable: false,
        sortOrder: 2,
      },
      {
        key: 'email.smtp.host',
        value: 'localhost',
        type: SettingType.STRING,
        category: SettingCategory.EMAIL,
        name: 'SMTP Host',
        description: 'SMTP server hostname',
        isEditable: true,
        sortOrder: 1,
      },
      {
        key: 'email.smtp.port',
        value: '587',
        type: SettingType.NUMBER,
        category: SettingCategory.EMAIL,
        name: 'SMTP Port',
        description: 'SMTP server port',
        isEditable: true,
        sortOrder: 2,
      },
      {
        key: 'security.session.timeout',
        value: '3600',
        type: SettingType.NUMBER,
        category: SettingCategory.SECURITY,
        name: 'Session Timeout',
        description: 'Session timeout in seconds',
        isEditable: true,
        sortOrder: 1,
      },
      {
        key: 'notification.email.enabled',
        value: 'true',
        type: SettingType.BOOLEAN,
        category: SettingCategory.NOTIFICATION,
        name: 'Email Notifications',
        description: 'Enable email notifications',
        isEditable: true,
        sortOrder: 1,
      },
    ];

    for (const settingData of defaultSettings) {
      const existingSetting = await this.systemSettingRepository.findOne({
        where: { key: settingData.key },
      });

      if (!existingSetting) {
        const setting = this.systemSettingRepository.create(settingData);
        await this.systemSettingRepository.save(setting);
      }
    }
  }
}
