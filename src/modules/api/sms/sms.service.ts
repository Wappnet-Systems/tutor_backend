import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SmsTemplate } from 'src/entities/sms-template.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class SmsService {
    constructor(
        @InjectRepository(SmsTemplate) private readonly smsTemplateRepository: Repository<SmsTemplate>,
        private readonly slackService: SlackService,
    ) {}
    async createSmsTemplate(smsTemplateObj: any): Promise<SmsTemplate> {
        try {
            const sms = await this.smsTemplateRepository.save(smsTemplateObj);
            return sms;
        } catch (error) {
            await this.slackService.send('Error in createSmsTemplate', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateSmsTemplate(smsTemplateObj: any): Promise<SmsTemplate> {
        try {
            const sms = await this.smsTemplateRepository.save(smsTemplateObj);
            return sms;
        } catch (error) {
            await this.slackService.send('Error in updateSmsTemplate', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSmsById(id): Promise<SmsTemplate> {
        try {
            const sms = await this.smsTemplateRepository.findOne({
                where: { id: id, is_deleted: false },
            });
            return sms;
        } catch (error) {
            await this.slackService.send('Error in getSmsById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllSms(): Promise<SmsTemplate[]> {
        try {
            const sms = await this.smsTemplateRepository.find({
                where: { is_deleted: false },
            });
            return sms;
        } catch (error) {
            await this.slackService.send('Error in getAllSms', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
