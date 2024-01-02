import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { UserService } from '../user/user.service';
import { TutorEducation } from 'src/entities/tutor-education.entity';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { TutorMediaGallery } from 'src/entities/tutor-media-gallery.entity';
import { UserActivationOtp } from 'src/entities/user-activation-otp.entity';
import { City } from 'src/entities/city.entity';
import { Country } from 'src/entities/country.entity';
import { TutorPostcode } from 'src/entities/tutor-postcode.entity';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/entities/notification.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            User,
            TutorApprovalRequest,
            TutorEducation,
            TutorSubject,
            TutorMediaGallery,
            UserActivationOtp,
            Country,
            City,
            TutorPostcode,
            Notification,
        ]),
    ],
    providers: [AdminService, SlackService, UserService, NotificationService],
    controllers: [AdminController],
})
export class AdminModule {}
