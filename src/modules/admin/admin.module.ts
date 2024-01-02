import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../api/user/user.module';
import { User } from 'src/entities/user.entity';
import { Booking } from 'src/entities/booking.entity';
import { Subject } from 'src/entities/subject.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';
import { AuthModule } from '../api/auth/auth.module';
import { TransactionModule } from '../api/transaction/transaction.module';
import { EmailModule } from '../api/email/email.module';
import { SmsModule } from '../api/sms/sms.module';
import { FeedbackModule } from '../api/feedback/feedback.module';
import { BookingModule } from '../api/booking/booking.module';
import { CategoryModule } from '../api/category/category.module';
import { SubjectModule } from '../api/subject/subject.module';
import { ReviewModule } from '../api/review/review.module';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { NotificationModule } from '../api/notification/notification.module';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/roles_permission.entity';
import { Modules } from 'src/entities/module.entity';
import { Permission } from 'src/entities/permission.entity';

@Module({
    imports: [
        UserModule,
        SmsModule,
        AuthModule,
        EmailModule,
        TransactionModule,
        ConfigModule.forRoot(),
        FeedbackModule,
        BookingModule,
        CategoryModule,
        SubjectModule,
        TypeOrmModule.forFeature([User, Booking, Subject, TutorApprovalRequest, Role, RolePermission, Modules, Permission]),
        ReviewModule,
        NotificationModule,
        EmailModule,
    ],
    controllers: [AdminController],
    providers: [AdminService, SlackService],
})
export class AdminModule {}
