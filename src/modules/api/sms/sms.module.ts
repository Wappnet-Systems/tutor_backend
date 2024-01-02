import { Module } from '@nestjs/common';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './sms.service';
import { SmsTemplate } from 'src/entities/sms-template.entity';
import { SmsController } from './sms.controller';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([SmsTemplate])],
    providers: [SmsService, SlackService],
    controllers: [SmsController],
    exports: [SmsService],
})
export class SmsModule {}
