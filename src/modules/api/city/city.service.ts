import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/entities/city.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
    constructor(@InjectRepository(City) private readonly cityRepository: Repository<City>, private readonly slackService: SlackService) {}

    async getAllCitiesById(country_id: number): Promise<City[]> {
        try {
            const cities = await this.cityRepository.find({
                where: { country_id: country_id, is_deleted: false },
            });
            if (cities) {
                return cities;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllCitiesById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async createCity(cityObj: any): Promise<City> {
        try {
            const city = await this.cityRepository.save(cityObj);
            if (city) {
                return city;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createCity', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCityById(city_id: number): Promise<City> {
        try {
            const city = await this.cityRepository.findOne({
                where: { id: city_id, is_deleted: false },
            });
            if (city) {
                return city;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCityById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCityByName(city_name: string, country_id: number): Promise<City> {
        try {
            const city = await this.cityRepository.findOne({
                where: { city_name: city_name, country_id: country_id, is_deleted: false },
            });
            if (city) {
                return city;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCityByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
