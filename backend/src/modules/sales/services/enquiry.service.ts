import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry, EnquiryStatus } from '../entities/enquiry.entity';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../dto/enquiry.dto';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(Enquiry)
    private enquiryRepository: Repository<Enquiry>,
  ) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    const enquiryCount = await this.enquiryRepository.count();
    const enquiryNo = `ENQ${String(enquiryCount + 1).padStart(6, '0')}`;

    const enquiry = this.enquiryRepository.create({
      ...createEnquiryDto,
      enquiryNo,
    });

    return this.enquiryRepository.save(enquiry);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: Enquiry[], total: number }> {
    const queryBuilder = this.enquiryRepository.createQueryBuilder('enquiry')
      .leftJoinAndSelect('enquiry.customer', 'customer')
      .orderBy('enquiry.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'enquiry.customerName ILIKE :search OR enquiry.mobileNo ILIKE :search OR enquiry.enquiryNo ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with ID ${id} not found`);
    }

    return enquiry;
  }

  async update(id: string, updateEnquiryDto: UpdateEnquiryDto): Promise<Enquiry> {
    const enquiry = await this.findOne(id);
    Object.assign(enquiry, updateEnquiryDto);
    return this.enquiryRepository.save(enquiry);
  }

  async remove(id: string): Promise<void> {
    const enquiry = await this.findOne(id);
    await this.enquiryRepository.remove(enquiry);
  }

  async convertToQuotation(id: string): Promise<Enquiry> {
    const enquiry = await this.findOne(id);
    enquiry.status = EnquiryStatus.CONVERTED;
    return this.enquiryRepository.save(enquiry);
  }

  async getStatistics(): Promise<any> {
    const total = await this.enquiryRepository.count();
    const newEnquiries = await this.enquiryRepository.count({ where: { status: EnquiryStatus.NEW } });
    const converted = await this.enquiryRepository.count({ where: { status: EnquiryStatus.CONVERTED } });
    
    return {
      total,
      new: newEnquiries,
      converted,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }
}
