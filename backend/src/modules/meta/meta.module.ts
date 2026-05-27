import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { EncryptionService } from './encryption.service';

@Module({
  controllers: [MetaController],
  providers: [MetaService, EncryptionService],
  exports: [MetaService, EncryptionService],
})
export class MetaModule {}
