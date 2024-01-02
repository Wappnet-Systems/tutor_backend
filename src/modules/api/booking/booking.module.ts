import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorAvailability } from 'src/entities/tutor-availability.entity';
import { Booking } from 'src/entities/booking.entity';
import { SlackService } from 'src/services/slack.service';
import { User } from 'src/entities/user.entity';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { BookingUser } from 'src/entities/booking_user.entity';
import { MailService } from 'src/services/mail.service';
import { PasswordService } from 'src/services/password.service';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { BadgesService } from '../badges/badges.service';
import { Badge } from 'src/entities/badge.entity';
import { TutorBadges } from 'src/entities/tutor_badges.entity';
import { Review } from 'src/entities/review.entity';
import { Notification } from 'src/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { ChatModule } from '../chat/chat.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            TutorAvailability,
            Booking,
            User,
            TutorSubject,
            Review,
            BookingSubject,
            BookingUser,
            Badge,
            TutorBadges,
            Notification,
        ]),
        ChatModule,
        EmailModule,
    ],
    controllers: [BookingController],
    providers: [BookingService, SlackService, MailService, PasswordService, BadgesService, NotificationService],
    exports: [BookingService],
})
export class BookingModule {}
