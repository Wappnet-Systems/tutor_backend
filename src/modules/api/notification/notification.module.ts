import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from 'src/entities/notification.entity';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Notification]), forwardRef(() => UserModule)],
    providers: [NotificationService, SlackService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
