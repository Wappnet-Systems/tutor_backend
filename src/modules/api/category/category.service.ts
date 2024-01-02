import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectCategory } from 'src/entities/subject-category.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(SubjectCategory) private readonly subjectCategoryRepository: Repository<SubjectCategory>,
        private readonly slackService: SlackService,
    ) {}

    async createCategory(categoryObj: any): Promise<SubjectCategory> {
        try {
            const category = await this.subjectCategoryRepository.save(categoryObj);
            if (category) {
                return category;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createCategory', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateCategory(categoryObj: any): Promise<SubjectCategory> {
        try {
            const category = await this.subjectCategoryRepository.save(categoryObj);
            if (category) {
                return category;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateCategory', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCategoryById(category_id: number): Promise<SubjectCategory> {
        try {
            const subjectCategory = await this.subjectCategoryRepository.findOne({
                where: { id: category_id, is_deleted: false },
            });
            if (subjectCategory) {
                return subjectCategory;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCategoryById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCategoryByName(category_name: string): Promise<SubjectCategory> {
        try {
            const subjectCategory = await this.subjectCategoryRepository.findOne({
                where: { category_name: category_name, is_deleted: false },
            });
            if (subjectCategory) {
                return subjectCategory;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getCategoryByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllCategories(): Promise<SubjectCategory[]> {
        try {
            const subjectCategories = await this.subjectCategoryRepository.find({
                where: { is_deleted: false },
            });
            if (subjectCategories) {
                return subjectCategories;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllCategories', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
