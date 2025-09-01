import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Customer } from './entities/customer.entity';
import { Opportunity } from './entities/opportunity.entity';
import { Enquiry } from './entities/enquiry.entity';
import { Quotation } from './entities/quotation.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesDispatch } from './entities/sales-dispatch.entity';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesReturn } from './entities/sales-return.entity';

import { LeadService } from './services/lead.service';
import { CustomerService } from './services/customer.service';
import { OpportunityService } from './services/opportunity.service';
import { EnquiryService } from './services/enquiry.service';
import { QuotationService } from './services/quotation.service';
import { SalesOrderService } from './services/sales-order.service';
import { SalesDispatchService } from './services/sales-dispatch.service';
import { SalesInvoiceService } from './services/sales-invoice.service';
import { SalesReturnService } from './services/sales-return.service';

import { LeadController } from './controllers/lead.controller';
import { CustomerController } from './controllers/customer.controller';
import { OpportunityController } from './controllers/opportunity.controller';
import { EnquiryController } from './controllers/enquiry.controller';
import { QuotationController } from './controllers/quotation.controller';
import { SalesOrderController } from './controllers/sales-order.controller';
import { SalesDispatchController } from './controllers/sales-dispatch.controller';
import { SalesInvoiceController } from './controllers/sales-invoice.controller';
import { SalesReturnController } from './controllers/sales-return.controller';
import { SalesController } from './controllers/sales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Customer,
      Opportunity,
      Enquiry,
      Quotation,
      SalesOrder,
      SalesDispatch,
      SalesInvoice,
      SalesReturn
    ])
  ],
  controllers: [
    LeadController,
    CustomerController,
    OpportunityController,
    EnquiryController,
    QuotationController,
    SalesOrderController,
    SalesDispatchController,
    SalesInvoiceController,
    SalesReturnController,
    SalesController
  ],
  providers: [
    LeadService,
    CustomerService,
    OpportunityService,
    EnquiryService,
    QuotationService,
    SalesOrderService,
    SalesDispatchService,
    SalesInvoiceService,
    SalesReturnService
  ],
  exports: [
    LeadService,
    CustomerService,
    OpportunityService,
    EnquiryService,
    QuotationService,
    SalesOrderService,
    SalesDispatchService,
    SalesInvoiceService,
    SalesReturnService
  ],
})
export class SalesModule {}
