import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { Language } from 'src/entities/language.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Language])],
    providers: [LanguageService, SlackService],
    controllers: [LanguageController],
})
export class LanguageModule {}
