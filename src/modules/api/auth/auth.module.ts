import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from '../../../services/slack.service';
import { S3Service } from '../../../services/s3.service';
import { UserModule } from '../user/user.module';
import { MailService } from 'src/services/mail.service';
import { BadgesService } from '../badges/badges.service';
import { Booking } from 'src/entities/booking.entity';
import { Review } from 'src/entities/review.entity';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { TutorBadges } from 'src/entities/tutor_badges.entity';
import { Badge } from 'src/entities/badge.entity';
import { EmailModule } from '../email/email.module';
@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User, Booking, Review, BookingSubject, TutorBadges, Badge]), UserModule, EmailModule],
    controllers: [AuthController],
    providers: [AuthService, SlackService, S3Service, MailService, BadgesService],
    exports: [AuthService],
})
export class AuthModule {}
