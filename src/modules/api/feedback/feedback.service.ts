import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackSubject } from 'src/entities/feedback-subject.entity';
import { Feedback } from 'src/entities/feedback.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback) private readonly feedbackRepository: Repository<Feedback>,
        @InjectRepository(FeedbackSubject) private readonly feedbackSubjectRepository: Repository<FeedbackSubject>,
        private readonly slackService: SlackService,
    ) { }

    async addFeedback(feedbackObj: any): Promise<Feedback> {
        try {
            const feedback = await this.feedbackRepository.save(feedbackObj);
            return feedback;
        } catch (error) {
            await this.slackService.send('Error in addFeedback', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getFeedbackSubjects(): Promise<FeedbackSubject[]> {
        try {
            const feedbackSubjects = await this.feedbackSubjectRepository.find({
                where: { is_deleted: false },
            });
            return feedbackSubjects;
        } catch (error) {
            await this.slackService.send('Error in getFeedbackSubjects', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllFeedbacks(): Promise<Feedback[]> {
        try {
            const feedbacks = await this.feedbackRepository
                .createQueryBuilder('feedback')
                .leftJoinAndSelect('feedback.feedback_subject', 'feedback_subject')
                .leftJoinAndSelect('feedback.user', 'user')
                .where('feedback_subject.is_deleted = :isDeleted', { isDeleted: false })
                .orderBy('feedback.id', 'DESC')
                .getMany();
            return feedbacks;
        } catch (error) {
            await this.slackService.send('Error in getAllFeedbacks', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
