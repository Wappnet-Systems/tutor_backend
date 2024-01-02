import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectCategory } from 'src/entities/subject-category.entity';
import { Subject } from 'src/entities/subject.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectService {
    constructor(@InjectRepository(Subject) private readonly subjectRepository: Repository<Subject>, private readonly slackService: SlackService) {}
    async createSubject(subjectObj: any): Promise<Subject> {
        try {
            const subject = await this.subjectRepository.save(subjectObj);
            if (subject) {
                return subject;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createSubject', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateSubject(subjectObj: any): Promise<Subject> {
        try {
            const subject = await this.subjectRepository.save(subjectObj);
            if (subject) {
                return subject;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateSubject', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSubjectByName(subject_name: string): Promise<Subject> {
        try {
            const subjectCategory = await this.subjectRepository.findOne({
                where: { subject_name: subject_name, is_deleted: false },
            });
            if (subjectCategory) {
                return subjectCategory;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getSubjectByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSubjectById(subject_id: number): Promise<Subject> {
        try {
            const subject = await this.subjectRepository.findOne({
                where: { id: subject_id, is_deleted: false },
            });
            if (subject) {
                return subject;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getSubjectById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllSubjects(): Promise<Subject[]> {
        try {
            const subjects = await this.subjectRepository.find({
                where: { is_deleted: false },
            });
            if (subjects) {
                return subjects;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllSubjects', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSubjectByCategoryId(category_id: number): Promise<Subject[]> {
        try {
            const subjects = await this.subjectRepository.find({
                where: { subject_category_id: category_id, is_deleted: false },
            });
            if (subjects) {
                return subjects;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getSubjectByCategoryId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllSubjectsForAdmin(): Promise<Subject[]> {
        try {
            const subjects = await this.subjectRepository
                .createQueryBuilder('subject')
                .where({ is_deleted: false })
                .leftJoinAndSelect('subject.category_details', 'category')
                .getMany();
            return subjects;
        } catch (error) {
            await this.slackService.send('Error in getAllSubjectsForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSubjectForAdmin(id): Promise<Subject> {
        try {
            const subjects = await this.subjectRepository
                .createQueryBuilder('subject')
                .where({ is_deleted: false, id: id })
                .leftJoinAndSelect('subject.category_details', 'category')
                .getOne();
            return subjects;
        } catch (error) {
            await this.slackService.send('Error in getSubjectForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
