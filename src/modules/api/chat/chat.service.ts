import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from '../../../entities/chat-messages.entity';
import { Repository } from 'typeorm';
import { Conversation } from '../../../entities/conversation.entity';
import { SlackService } from '../../../services/slack.service';
import { CreateConversationDto } from './dtos/create-conversation.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
        @InjectRepository(ChatMessage)
        private chatMessageRepository: Repository<ChatMessage>,
        private readonly slackService: SlackService,
    ) { }

    async createConversation(payload: CreateConversationDto) {
        try {
            const conversation = await this.conversationRepository.save(payload);
            if (conversation) {
                return conversation;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateConversation(payload) {
        try {
            const conversation = await this.conversationRepository.save(payload);
            if (conversation) {
                return conversation;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async saveChatMessage(payload: any) {
        try {
            const conversation = await this.getConversation(payload.conversation_id);
            if (conversation && !conversation.is_disabled) {
                const chatMessage = await this.chatMessageRepository.save(payload);
                if (chatMessage) {
                    return chatMessage;
                }
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in saveChatMessage', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async disableChat(conversationId: number) {
        try {
            const conversation = await this.getConversation(conversationId);
            if (conversation) {
                conversation.is_deleted = true;
                await this.conversationRepository.save(conversation);
                return;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in disableChat', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getConversation(conversationId: number) {
        try {
            const conversation = await this.conversationRepository.findOne({
                where: {
                    id: conversationId,
                    is_deleted: false,
                },
            });
            return conversation;
        } catch (error) {
            await this.slackService.send('Error in getConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorConversations(userId: number) {
        try {
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .leftJoinAndSelect('conversation.student', 'user')
                .where('conversation.tutor_user_id = :userId AND conversation.is_deleted = :isDeleted', { userId: userId, isDeleted: false })
                .select([
                    'conversation.id',
                    'conversation.created_at',
                    'conversation.student_user_id',
                    'user.id',
                    'user.image',
                    'user.email',
                    'user.user_type',
                    'user.first_name',
                    'user.last_name',
                ])
                .getMany();

            if (conversations.length) {
                for (const conversation of conversations) {
                    conversation['user'] = conversation.student;
                    delete conversation.student;
                    const message = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where('chat_messages.conversation_id =:conversation_id', {
                            conversation_id: conversation.id,
                        })
                        .orderBy('chat_messages.created_at', 'DESC')
                        .getOne();

                    const unreadMessages = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where(
                            'chat_messages.conversation_id =:conversation_id AND chat_messages.sender =:sender AND chat_messages.is_read =:is_read',
                            {
                                conversation_id: conversation.id,
                                sender: conversation.student_user_id,
                                is_read: false,
                            },
                        )
                        .getMany();

                    if (message) {
                        conversation['lastMessage'] = message;
                        conversation['unreadCount'] = unreadMessages.length;
                    }
                }
            }
            return conversations;
        } catch (error) {
            await this.slackService.send('Error in getTutorConversations', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentConversations(userId: number) {
        try {
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .leftJoinAndSelect('conversation.tutor', 'user')
                .where('conversation.student_user_id = :userId AND conversation.is_deleted = :isDeleted', { userId: userId, isDeleted: false })
                .select([
                    'conversation.id',
                    'conversation.created_at',
                    'conversation.tutor_user_id',
                    'user.id',
                    'user.image',
                    'user.email',
                    'user.user_type',
                    'user.first_name',
                    'user.last_name',
                ])
                .getMany();

            if (conversations.length) {
                for (const conversation of conversations) {
                    conversation['user'] = conversation.tutor;
                    const message = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where('chat_messages.conversation_id =:conversation_id', {
                            conversation_id: conversation.id,
                        })
                        .orderBy('chat_messages.created_at', 'DESC')
                        .getOne();

                    const unreadMessages = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where(
                            'chat_messages.conversation_id =:conversation_id AND chat_messages.sender =:sender AND chat_messages.is_read =:is_read',
                            {
                                conversation_id: conversation.id,
                                sender: conversation.tutor_user_id,
                                is_read: false,
                            },
                        )
                        .getMany();

                    delete conversation.tutor;
                    if (message) {
                        conversation['lastMessage'] = message;
                        conversation['unreadCount'] = unreadMessages.length;
                    }
                }
            }
            return conversations;
        } catch (error) {
            await this.slackService.send('Error in getStudentConversations', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentUnReadMessageCount(userId: number) {
        try {
            let unreadCount = 0;
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .where('conversation.student_user_id = :userId AND conversation.is_deleted = :isDeleted', { userId: userId, isDeleted: false })
                .getMany();

            if (conversations.length) {
                for (const conversation of conversations) {
                    const unreadMessages = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where(
                            'chat_messages.conversation_id =:conversation_id AND chat_messages.sender =:sender AND chat_messages.is_read =:is_read',
                            {
                                conversation_id: conversation.id,
                                sender: conversation.tutor_user_id,
                                is_read: false,
                            },
                        )
                        .getMany();
                    unreadCount = unreadCount + unreadMessages.length;
                }
            }
            return unreadCount;
        } catch (error) {
            await this.slackService.send('Error in getStudentUnReadMessageCount', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorUnReadMessageCount(userId: number) {
        try {
            let unreadCount = 0;
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .where('conversation.tutor_user_id = :userId AND conversation.is_deleted = :isDeleted', { userId: userId, isDeleted: false })
                .getMany();

            if (conversations.length) {
                for (const conversation of conversations) {
                    const unreadMessages = await this.chatMessageRepository
                        .createQueryBuilder('chat_messages')
                        .where(
                            'chat_messages.conversation_id =:conversation_id AND chat_messages.sender =:sender AND chat_messages.is_read =:is_read',
                            {
                                conversation_id: conversation.id,
                                sender: conversation.student_user_id,
                                is_read: false,
                            },
                        )
                        .getMany();
                    unreadCount = unreadCount + unreadMessages.length;
                }
            }
            return unreadCount;
        } catch (error) {
            await this.slackService.send('Error in getTutorUnReadMessageCount', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getMessages(conversationId: any) {
        try {
            const messages = await this.chatMessageRepository.find({
                where: {
                    conversation_id: conversationId,
                },
            });
            return messages;
        } catch (error) {
            await this.slackService.send('Error in getMessages', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async markReadConversation(conversationId: number, user_id: number) {
        try {
            const allChatMessages = await this.chatMessageRepository.find({
                where: { conversation_id: conversationId, sender: user_id },
            });

            if (allChatMessages.length > 0) {
                for (let index = 0; index < allChatMessages.length; index++) {
                    const element = allChatMessages[index];
                    element.is_read = true;
                    await this.chatMessageRepository.save(element);
                }
            }
            return allChatMessages;
        } catch (error) {
            await this.slackService.send('Error in markReadConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentTutorConversation(tutor_user_id: number, student_user_id: number) {
        try {
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .where(
                    'conversation.student_user_id =:student_user_id AND conversation.tutor_user_id =:tutor_user_id AND conversation.is_deleted = :isDeleted',
                    {
                        student_user_id: student_user_id,
                        tutor_user_id: tutor_user_id,
                        isDeleted: false,
                    },
                )
                .getOne();
            return conversations;
        } catch (error) {
            await this.slackService.send('Error in getStudentTutorConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async closeConversation(tutor_user_id: number, student_user_id: number) {
        try {
            const conversations = await this.conversationRepository
                .createQueryBuilder('conversation')
                .where(
                    'conversation.student_user_id =:student_user_id AND conversation.tutor_user_id =:tutor_user_id AND conversation.is_deleted = :isDeleted',
                    {
                        student_user_id: student_user_id,
                        tutor_user_id: tutor_user_id,
                        isDeleted: false,
                    },
                )
                .getOne();
            if (conversations) {
                conversations.is_deleted = true;
                await this.conversationRepository.save(conversations);
            }
            return conversations;
        } catch (error) {
            await this.slackService.send('Error in closeConversation', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
