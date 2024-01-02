import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from 'src/entities/feedback.entity';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackSubject } from 'src/entities/feedback-subject.entity';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Feedback, FeedbackSubject])],
    controllers: [FeedbackController],
    providers: [FeedbackService, SlackService],
    exports: [FeedbackService],
})
export class FeedbackModule {}
