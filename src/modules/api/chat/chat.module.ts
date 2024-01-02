import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../../../entities/chat-messages.entity';
import { Conversation } from '../../../entities/conversation.entity';
import { SlackService } from '../../../services/slack.service';
import { ChatController } from './chat.controller';
import { UserModule } from '../user/user.module';
import { S3Service } from '../../../services/s3.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessage, Conversation]), UserModule, NotificationModule],
    providers: [ChatGateway, ChatService, SlackService, S3Service],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule {}
