import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Invoice, Expense } from './entities/finance.entity';
import { Bill, BillItem, BillPayment } from './entities/bill.entity';
import { BillService } from './services/bill.service';
import { PdfService } from './services/pdf.service';
import { BillController } from './controllers/bill.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice, 
      Expense, 
      Bill, 
      BillItem, 
      BillPayment
    ])
  ],
  controllers: [
    FinanceController,
    BillController
  ],
  providers: [
    FinanceService,
    BillService,
    PdfService
  ],
  exports: [
    FinanceService,
    BillService,
    PdfService
  ],
})
export class FinanceModule {}
