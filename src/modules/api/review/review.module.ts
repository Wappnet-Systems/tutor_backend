import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { BookingService } from '../booking/booking.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Review } from 'src/entities/review.entity';
import { TutorAvailability } from 'src/entities/tutor-availability.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { BookingUser } from 'src/entities/booking_user.entity';
import { MailService } from 'src/services/mail.service';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { Badge } from 'src/entities/badge.entity';
import { TutorBadges } from 'src/entities/tutor_badges.entity';
import { BadgesService } from '../badges/badges.service';
import { BookingModule } from '../booking/booking.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        BookingModule,
        TypeOrmModule.forFeature([Review, TutorAvailability, BookingSubject, Booking, User, TutorSubject, BookingUser, TutorBadges, Badge]),
    ],
    providers: [ReviewService, SlackService, MailService, BadgesService],
    controllers: [ReviewController],
    exports: [ReviewService],
})
export class ReviewModule {}
