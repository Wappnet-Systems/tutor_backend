import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { SlackService } from '../../../services/slack.service';
import { UserActivationOtp } from 'src/entities/user-activation-otp.entity';
import { TutorEducation } from 'src/entities/tutor-education.entity';
import { S3Service } from 'src/services/s3.service';
import { TutorMediaGallery } from 'src/entities/tutor-media-gallery.entity';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { TutorPostcode } from 'src/entities/tutor-postcode.entity';
import { Language } from 'src/entities/language.entity';
import { Postcode } from 'src/entities/postcode.entity';
import { UserPermission } from 'src/entities/user-permission.entity';
import { PasswordService } from 'src/services/password.service';
import { MailService } from 'src/services/mail.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            User,
            UserActivationOtp,
            TutorEducation,
            TutorMediaGallery,
            TutorSubject,
            TutorApprovalRequest,
            TutorPostcode,
            Language,
            UserPermission,
            Postcode,
        ]),
        NotificationModule,
    ],
    controllers: [UserController],
    providers: [UserService, SlackService, S3Service, PasswordService, MailService],
    exports: [UserService],
})
export class UserModule {}
