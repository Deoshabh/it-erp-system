import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { 
  Warehouse, 
  Zone, 
  Item, 
  StockMovement, 
  Batch, 
  Serial 
} from './entities';

// Services
import { 
  WarehouseService, 
  ItemService, 
  StockMovementService 
} from './services';

// Controllers
import { 
  WarehouseController, 
  ItemController, 
  StockMovementController 
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      Zone,
      Item,
      StockMovement,
      Batch,
      Serial
    ]),
  ],
  controllers: [
    WarehouseController,
    ItemController,
    StockMovementController,
  ],
  providers: [
    WarehouseService,
    ItemService,
    StockMovementService,
  ],
  exports: [
    WarehouseService,
    ItemService,
    StockMovementService,
  ],
})
export class InventoryModule {}
