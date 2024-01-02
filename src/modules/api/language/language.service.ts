import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from 'src/entities/language.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class LanguageService {
    constructor(@InjectRepository(Language) private readonly languageRepository: Repository<Language>, private readonly slackService: SlackService) {}

    async createLanguage(languageObj: any): Promise<Language> {
        try {
            const language = await this.languageRepository.save(languageObj);
            return language;
        } catch (error) {
            await this.slackService.send('Error in createLanguage', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getLanguageById(id: number): Promise<Language> {
        try {
            const language = await this.languageRepository.findOne({
                where: { id: id, is_deleted: false },
            });
            return language;
        } catch (error) {
            await this.slackService.send('Error in getLanguageById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getLanguageByName(language: string): Promise<Language> {
        try {
            const languageDetails = await this.languageRepository.findOne({
                where: { language: language, is_deleted: false },
            });
            return languageDetails;
        } catch (error) {
            await this.slackService.send('Error in getLanguageByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllLanguages(): Promise<Language[]> {
        try {
            const languageDetails = await this.languageRepository.find({
                where: { is_deleted: false },
            });
            return languageDetails;
        } catch (error) {
            await this.slackService.send('Error in getAllLanguages', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
