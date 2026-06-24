import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { EncryptionService } from './encryption.service';
import { MetaCapabilityService } from './meta-capability.service';

@Module({
  controllers: [MetaController],
  providers: [MetaService, EncryptionService, MetaCapabilityService],
  exports: [MetaService, EncryptionService, MetaCapabilityService],
})
export class MetaModule {}
