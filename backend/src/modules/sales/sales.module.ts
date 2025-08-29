import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Customer } from './entities/customer.entity';
import { Opportunity } from './entities/opportunity.entity';
import { LeadService } from './services/lead.service';
import { CustomerService } from './services/customer.service';
import { OpportunityService } from './services/opportunity.service';
import { LeadController } from './controllers/lead.controller';
import { CustomerController } from './controllers/customer.controller';
import { OpportunityController } from './controllers/opportunity.controller';
import { SalesController } from './controllers/sales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Customer,
      Opportunity
    ])
  ],
  controllers: [
    LeadController,
    CustomerController,
    OpportunityController,
    SalesController
  ],
  providers: [
    LeadService,
    CustomerService,
    OpportunityService
  ],
  exports: [
    LeadService,
    CustomerService,
    OpportunityService
  ],
})
export class SalesModule {}
