import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { Assignment } from 'src/entities/assignment.entity';
import { AssignmentSubmissionMedia } from 'src/entities/assignment-submission.entity';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from '../booking/booking.service';
import { Booking } from 'src/entities/booking.entity';
import { TutorAvailability } from 'src/entities/tutor-availability.entity';
import { User } from 'src/entities/user.entity';
import { S3Service } from 'src/services/s3.service';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { BookingUser } from 'src/entities/booking_user.entity';
import { MailService } from 'src/services/mail.service';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/entities/notification.entity';
import { BookingModule } from '../booking/booking.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Assignment,
            AssignmentSubmissionMedia,
            TutorAvailability,
            Booking,
            User,
            BookingSubject,
            TutorSubject,
            BookingUser,
            Notification,
        ]),
        BookingModule,
        EmailModule,
    ],
    providers: [AssignmentService, SlackService, S3Service, MailService, NotificationService],
    controllers: [AssignmentController],
    exports: [AssignmentService],
})
export class AssignmentModule {}
