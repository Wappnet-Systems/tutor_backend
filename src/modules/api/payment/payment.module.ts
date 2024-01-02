import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { SlackService } from 'src/services/slack.service';
import { Transaction } from 'src/entities/transaction.entity';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { ChatService } from '../chat/chat.service';
import { ChatMessage } from 'src/entities/chat-messages.entity';
import { Conversation } from 'src/entities/conversation.entity';
import { BookingUser } from 'src/entities/booking_user.entity';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([Booking, Transaction, Notification, User, ChatMessage, Conversation, BookingUser]),
        EmailModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService, SlackService, NotificationService, ChatService],
})
export class PaymentModule {}
