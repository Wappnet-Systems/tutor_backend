import { Module } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { PostcodeController } from './postcode.controller';
import { Postcode } from 'src/entities/postcode.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Postcode])],
    providers: [PostcodeService, SlackService],
    controllers: [PostcodeController],
})
export class PostcodeModule {}
