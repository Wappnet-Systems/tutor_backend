import { Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PaginationOptions, StatusType } from 'src/utils/constant';
import { UserService } from '../user/user.service';

@ApiTags('notification')
@ApiBearerAuth('access-token')
@Controller('notification')
export class NotificationController {
    constructor(private notificationService: NotificationService, private userService: UserService) { }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete All Notification of User' })
    @Delete('all')
    async deleteAllNotificationsOfUser(@Req() req: any, @Res() res: Response) {
        const notifications = await this.notificationService.getAllNotificationsOfUser(req.user_id);

        if (notifications.length > 0) {
            for (let index = 0; index < notifications.length; index++) {
                const notification = notifications[index];
                notification.is_deleted = true;
                await this.notificationService.updateNotification(notification);
            }
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Notification Deleted'],
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['All notification is already deleted'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Notification' })
    @Delete('/:id')
    async deleteNotification(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        let notification = await this.notificationService.getNotificationById(id, req.user_id);

        if (notification) {
            notification.is_deleted = true;

            notification = await this.notificationService.updateNotification(notification);

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Notification Deleted'],
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['Notification does not exist.'],
                data: notification,
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Read All Notification of User' })
    @Post('all')
    async readAllNotificationsOfUser(@Req() req: any, @Res() res: Response) {
        const notifications = await this.notificationService.getAllUnreadNotificationOfUserWithoutPagination(req.user_id);

        if (notifications.length > 0) {
            for (let index = 0; index < notifications.length; index++) {
                const notification = notifications[index];
                notification.is_unread = false;
                await this.notificationService.updateNotification(notification);
            }
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Notification Readed'],
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['All notification is already readed'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Mark Notification as read' })
    @Put('/:id')
    async markNotificationAsRead(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        let notification = await this.notificationService.getNotificationById(id, req.user_id);

        if (notification) {
            notification.is_unread = false;

            notification = await this.notificationService.updateNotification(notification);

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Notification Updated'],
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['Notification does not exist.'],
                data: notification,
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Notification' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('')
    async getNotifications(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        const notifications = await this.notificationService.getAllUnreadNotificationOfUser(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Notifications'],
            data: notifications,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Unread notification count' })
    @Get('/:id')
    async GetUnreadNotificationCount(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const user = await this.userService.getUserById(req.user_id);
        const notification = await this.notificationService.getAllUnReadNotificationByUserId(req.user_id);
        return res.status(HttpStatus.OK).send({
            message: ['Notification does not exist.'],
            data: {
                unread_count: notification.length,
                is_active: user.status != StatusType.INACTIVE ? true : false,
            },
        });
    }
}
