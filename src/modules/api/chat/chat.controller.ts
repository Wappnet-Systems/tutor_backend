import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CHAT_DOCUMENT_BASE_PATH, CHAT_DOCUMENT_SIZE, CHAT_DOCUMENT_TYPES, UserType } from '../../../utils/constant';
import { S3Service } from '../../../services/s3.service';
import mime from 'mime';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
    constructor(
        private readonly userService: UserService,
        private readonly chatService: ChatService,
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) { }


    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All conversation of user' })
    @Get('unread')
    async getUnreadMessageCount(@Req() req: any, @Res() res: Response) {
        const count =
            req.user_type == UserType.STUDENT
                ? await this.chatService.getStudentUnReadMessageCount(req.user_id)
                : await this.chatService.getTutorUnReadMessageCount(req.user_id);
        return res.status(HttpStatus.OK).send({
            data: count,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All conversation of user' })
    @Get('conversations')
    async getConversations(@Req() req: any, @Res() res: Response) {
        const conversations =
            req.user_type == UserType.STUDENT
                ? await this.chatService.getStudentConversations(req.user_id)
                : await this.chatService.getTutorConversations(req.user_id);
        return res.status(HttpStatus.OK).send({
            data: conversations,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All message of conversation' })
    @Get('conversation/:id')
    async getConversationMessages(@Param() id: any, @Res() res: Response) {
        const messages = await this.chatService.getMessages(id.id);
        return res.status(HttpStatus.OK).send({
            data: messages,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Mark conversation as read' })
    @Put('conversation/read/:id')
    async readConversation(@Req() req: any, @Param() id: number, @Res() res: Response) {
        const conversation = await this.chatService.getConversation(id['id']);
        if (conversation) {
            const messages = await this.chatService.markReadConversation(
                conversation.id,
                req.user_type == UserType.STUDENT ? conversation.tutor_user_id : conversation.student_user_id,
            );
            if (messages.length > 0) {
                return res.status(HttpStatus.OK).send();
            } else {
                return res.status(HttpStatus.OK).send({
                    message: 'No Messages found',
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).send({
                message: 'No Conversation found',
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Upload document to conversation' })
    @Post('document')
    @UseInterceptors(FileInterceptor('document'))
    async uploadDocument(@Req() req: Request, @Body() payload: any, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        const user = await this.userService.getUserById(req['user_id']);

        if (user && file) {
            if (file) {
                const ext = mime.extension(file.mimetype);
                if (!CHAT_DOCUMENT_TYPES.includes(ext)) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: `file not supported extension need must be in ${CHAT_DOCUMENT_TYPES.join(',')}`,
                    });
                }
                if (CHAT_DOCUMENT_SIZE < file.size) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: `file must be less that 3 mb`,
                    });
                }
            }
            const basePath = CHAT_DOCUMENT_BASE_PATH + payload.conversationId;
            const fileUpload = await this.s3Service.uploadFile(file.buffer, basePath, file.mimetype);

            if (fileUpload) {
                const uploadUrl = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                return res.status(200).send({
                    message: 'document path',
                    url: uploadUrl,
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).send({
                message: `file not found`,
            });
        }
    }
}
