import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import all entities for seeder
import { User } from '../modules/users/entities/user.entity';
import { Employee } from '../modules/employees/entities/employee.entity';
import { Customer } from '../modules/sales/entities/customer.entity';
import { Enquiry } from '../modules/sales/entities/enquiry.entity';
import { Quotation } from '../modules/sales/entities/quotation.entity';
import { SalesOrder } from '../modules/sales/entities/sales-order.entity';
import { SalesDispatch } from '../modules/sales/entities/sales-dispatch.entity';
import { SalesInvoice } from '../modules/sales/entities/sales-invoice.entity';
import { SalesReturn } from '../modules/sales/entities/sales-return.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'it_erp'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Employee,
      Customer,
      Enquiry,
      Quotation,
      SalesOrder,
      SalesDispatch,
      SalesInvoice,
      SalesReturn,
    ]),
  ],
})
export class DatabaseModule {}
