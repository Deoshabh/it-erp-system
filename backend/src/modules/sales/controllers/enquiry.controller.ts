import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnquiryService } from '../services/enquiry.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../dto/enquiry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales/enquiries')
@UseGuards(JwtAuthGuard)
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Post()
  create(@Body() createEnquiryDto: CreateEnquiryDto) {
    return this.enquiryService.create(createEnquiryDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.enquiryService.findAll(pageNum, limitNum, search);
  }

  @Get('statistics')
  getStatistics() {
    return this.enquiryService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnquiryDto: UpdateEnquiryDto) {
    return this.enquiryService.update(id, updateEnquiryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enquiryService.remove(id);
  }

  @Patch(':id/convert-to-quotation')
  convertToQuotation(@Param('id') id: string) {
    return this.enquiryService.convertToQuotation(id);
  }
}
