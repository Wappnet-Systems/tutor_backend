import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/entities/country.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class CountryService {
    constructor(@InjectRepository(Country) private readonly countryRepository: Repository<Country>, private readonly slackService: SlackService) {}

    async createCountry(countryObj: any): Promise<Country> {
        try {
            const country = await this.countryRepository.save(countryObj);
            if (country) {
                return country;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createCountry', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCountryById(country_id: number): Promise<Country> {
        try {
            const country = await this.countryRepository.findOne({
                where: { id: country_id, is_deleted: false },
            });
            if (country) {
                return country;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCountryById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCountryByName(country_name: string): Promise<Country> {
        try {
            const country = await this.countryRepository.findOne({
                where: { country_name: country_name, is_deleted: false },
            });
            if (country) {
                return country;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCountryByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllCountries(): Promise<Country[]> {
        try {
            const country = await this.countryRepository.find({
                where: { is_deleted: false },
            });
            if (country) {
                return country;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllCountries', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
