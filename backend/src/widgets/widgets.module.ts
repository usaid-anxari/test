import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetsService } from './widgets.service';
import { WidgetsController } from './widgets.controller';
import { Widget } from './entities/widget.entity';
import { EmbedToken } from './entities/embed-token.entity';
import { BusinessModule } from '../business/business.module';
import { AuthModule } from '../auth/auth.module';
import { EmbedController } from '../embed/embed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Widget, EmbedToken]),
    forwardRef(() => BusinessModule),
    forwardRef(() => AuthModule),
  ],
  providers: [WidgetsService],
  controllers: [WidgetsController, EmbedController],
  exports: [WidgetsService],
})
export class WidgetsModule {}
