import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';
import { Badge } from 'src/entities/badge.entity';
import { User } from 'src/entities/user.entity';
import { Booking } from 'src/entities/booking.entity';
import { Review } from 'src/entities/review.entity';
import { TutorBadges } from 'src/entities/tutor_badges.entity';
import { BookingSubject } from 'src/entities/booking-subject.entity';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Badge, User, Booking, Review, TutorBadges, BookingSubject])],
    controllers: [BadgesController],
    providers: [BadgesService, SlackService],
})
export class BadgesModule {}
