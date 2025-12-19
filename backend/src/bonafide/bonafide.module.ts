import { Module } from '@nestjs/common';
import { BonafideService } from './bonafide.service';
import { BonafideController } from './bonafide.controller';

@Module({
  controllers: [BonafideController],
  providers: [BonafideService],
})
export class BonafideModule { }
