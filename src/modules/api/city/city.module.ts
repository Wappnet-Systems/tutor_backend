import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { City } from 'src/entities/city.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([City])],
    providers: [CityService, SlackService],
    controllers: [CityController],
})
export class CityModule {}
