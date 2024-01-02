import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Postcode } from 'src/entities/postcode.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class PostcodeService {
    constructor(@InjectRepository(Postcode) private readonly postcodeRepository: Repository<Postcode>, private readonly slackService: SlackService) {}

    async getAllPostcode(): Promise<Postcode[]> {
        try {
            const postcode = await this.postcodeRepository.find({
                where: { is_deleted: false },
            });
            return postcode;
        } catch (error) {
            await this.slackService.send('Error in getAllPostcode', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
