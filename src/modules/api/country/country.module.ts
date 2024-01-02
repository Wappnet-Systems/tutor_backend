import { Module } from '@nestjs/common';
import { Country } from 'src/entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from 'src/services/slack.service';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Country])],
    providers: [CountryService, SlackService],
    controllers: [CountryController],
    exports: [CountryService],
})
export class CountryModule {}
