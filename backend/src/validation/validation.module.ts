import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { Business } from '../business/entities/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  controllers: [ValidationController],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}