import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatDto } from './dtos/chat.dto';
import { ChatService } from './chat.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationTitles, NotificationMessages, NotificationTypes } from 'src/utils/notifications';
import { UserService } from '../user/user.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private chatService: ChatService, private notificationService: NotificationService, private userService: UserService) { }
    private onlineUsers = [];
    private onlineNotifiers = [];
    private onlineConversations = [];
    @WebSocketServer() server: Server;

    @SubscribeMessage('add-notifier')
    handleAddNotifiers(client: Socket, user: any) {
        const tempUser = this.onlineNotifiers.filter((r) => {
            if (r.user_id == user.user_id) {
                return r;
            }
        });

        if (tempUser.length > 0) {
            this.onlineNotifiers = this.onlineNotifiers.map((chat) => {
                if (chat.user_id == user.user_id) {
                    chat.client_id = client.id;
                }
                return chat;
            });
        } else {
            this.onlineNotifiers.push({
                client_id: client.id,
                user_id: user.user_id,
            });
        }
    }

    @SubscribeMessage('remove-user')
    handleRemoveNotifiers(client: Socket, user: any) {
        this.onlineConversations = this.onlineConversations.filter((r) => {
            if (r.user_id != user.user_id) {
                return r;
            }
        });

        this.onlineUsers = this.onlineUsers.filter((r) => {
            if (r.user_id != user.user_id) {
                return r;
            }
        });
    }

    @SubscribeMessage('add-user')
    handleAddUser(client: Socket, conversation: any) {
        console.log('add-user');
        console.log(client.id);
        const tempUser = this.onlineUsers.filter((r) => {
            if (r.user_id == conversation.user_id) {
                return r;
            }
        });

        if (tempUser.length > 0) {
            this.onlineUsers = this.onlineUsers.map((chat) => {
                if (chat.user_id == conversation.user_id) {
                    chat.conversation_id = conversation.conversation_id;
                    chat.client_id = client.id;
                }
                return chat;
            });
        } else {
            this.onlineUsers.push({
                conversation_id: conversation.conversation_id,
                client_id: client.id,
                user_id: conversation.user_id,
            });
        }
        const notifierSocket = this.onlineNotifiers.filter((r) => {
            if (r.user_id == conversation.user_id) {
                return r;
            }
        })[0];
        this.server.to(notifierSocket.client_id).emit('check-notification', {});
    }

    @SubscribeMessage('add-conv')
    handleAddConv(client: Socket, conversation: any) {
        this.onlineConversations.push({
            client_id: client.id,
            user_id: conversation.user_id,
        });
        const tempUser = this.onlineUsers.filter((r) => {
            if (r.user_id == conversation.user_id) {
                return r;
            }
        });

        if (tempUser.length > 0) {
            this.onlineUsers = this.onlineUsers.map((chat) => {
                if (chat.user_id == conversation.user_id) {
                    chat.conversation_id = conversation.conversation_id;
                    chat.client_id = client.id;
                }
                return chat;
            });
        } else {
            this.onlineUsers.push({
                conversation_id: conversation.conversation_id,
                client_id: client.id,
                user_id: conversation.user_id,
            });
        }
        const notifierSocket = this.onlineNotifiers.filter((r) => {
            if (r.user_id == conversation.user_id) {
                return r;
            }
        })[0];
        if (notifierSocket) {
            this.server.to(notifierSocket.client_id).emit('check-notification', {});
        }
    }

    @SubscribeMessage('send-msg')
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: ChatDto): Promise<void> {
        const sendUserSocket = this.onlineUsers.filter((r) => {
            if (r.user_id == payload.to && r.conversation_id == payload.conversation_id) {
                return r;
            }
        })[0];
        const notifierSocket = this.onlineNotifiers.filter((r) => {
            if (r.user_id == payload.to) {
                return r;
            }
        })[0];
        const convSocket = this.onlineConversations.filter((r) => {
            if (r.user_id == payload.to) {
                return r;
            }
        })[0];
        const chatObj = {
            sender: payload.from,
            conversation_id: payload.conversation_id,
            message: payload?.message,
            document: payload?.document,
            document_type: payload?.document_type,
            is_read: sendUserSocket ? true : false,
        };
        const message = await this.chatService.saveChatMessage(chatObj);
        const user_id = payload.to;
        const user_detail = await this.userService.getUserById(payload.from);

        if (message) {
            if (notifierSocket) {
                this.server.to(notifierSocket.client_id).emit('check-notification', { message });
            }

            if (sendUserSocket) {
                this.server.to(sendUserSocket.client_id).emit('receive', { message });
            } else {
                if (convSocket) {
                    this.server.to(convSocket.client_id).emit('check-conversations', { message });
                }

                if (notifierSocket) {
                    this.server.to(notifierSocket.client_id).emit('check-notification', { message });
                } else {
                    await this.notificationService.addNotification({
                        user_id: user_id,
                        title: NotificationTitles.MESSAGE_NOTIFICATION,
                        description: NotificationMessages.MESSAGE_NOTIFICATION.replace(
                            '{user_name}',
                            user_detail.first_name + ' ' + user_detail.last_name,
                        ),
                        type: NotificationTypes.MESSAGE_NOTIFICATION,
                    });
                }
            }
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Disconnected: ${client.id}`);
        this.onlineUsers = this.onlineUsers.filter((user) => {
            if (user.client_id != client.id) {
                return user;
            }
        });
        this.onlineNotifiers = this.onlineNotifiers.filter((user) => {
            if (user.client_id != client.id) {
                return user;
            }
        });
        this.onlineConversations = this.onlineConversations.filter((user) => {
            if (user.client_id != client.id) {
                return user;
            }
        });
    }

    handleConnection(client: Socket) {
        console.log(`Connected ${client.id}`);
    }
}
