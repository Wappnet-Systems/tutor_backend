import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from 'src/entities/email-template.entity';
import { UserModule } from '../user/user.module';
import { MailService } from 'src/services/mail.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([EmailTemplate]), UserModule],
    providers: [EmailService, SlackService, MailService],
    controllers: [EmailController],
    exports: [EmailService],
})
export class EmailModule {}
