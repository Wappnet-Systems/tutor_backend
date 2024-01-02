import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { SlackService } from 'src/services/slack.service';
import { PaginationOptions } from 'src/utils/constant';
import { NotificationTypes } from 'src/utils/notifications';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
        private slackService: SlackService,
    ) {}

    async addNotification(notificationObj): Promise<Notification> {
        try {
            const notificationDetail = await this.notificationRepository.save(notificationObj);
            return notificationDetail;
        } catch (error) {
            await this.slackService.send('Error in addNotification', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateNotification(notificationObj): Promise<Notification> {
        try {
            const notificationDetail = await this.notificationRepository.save(notificationObj);
            return notificationDetail;
        } catch (error) {
            await this.slackService.send('Error in updateNotification', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllUnreadNotificationOfUser(user_id: number, pagination: PaginationOptions) {
        try {
            const notifications = await this.notificationRepository.find({
                where: { is_deleted: false, user_id: user_id },
                order: { created_at: pagination.sort },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                data: notifications,
                page: pagination.page,
                itemPerPage: pagination.limit,
                totalItem: await this.notificationRepository.count({
                    where: { is_deleted: false, user_id: user_id },
                }),
            };
        } catch (error) {
            await this.slackService.send('Error in getAllUnreadNotificationOfUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getNotificationById(id: number, user_id: number): Promise<Notification> {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { is_deleted: false, id: id, user_id: user_id },
            });
            return notification;
        } catch (error) {
            await this.slackService.send('Error in getNotificationById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllUnReadNotificationByUserId(user_id: number): Promise<Notification[]> {
        try {
            const notification = await this.notificationRepository.find({
                where: { is_deleted: false, is_unread: true, user_id: user_id },
            });
            return notification;
        } catch (error) {
            await this.slackService.send('Error in getAllUnReadNotificationByUserId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllNotificationsOfUser(user_id: number): Promise<Notification[]> {
        try {
            const notification = await this.notificationRepository.find({
                where: { is_deleted: false, user_id: user_id },
            });
            return notification;
        } catch (error) {
            await this.slackService.send('Error in getAllNotificationsOfUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllUnreadNotificationOfUserWithoutPagination(user_id: number) {
        try {
            const notifications = await this.notificationRepository.find({
                where: { is_deleted: false, user_id: user_id, is_unread: true },
            });
            return notifications;
        } catch (error) {
            await this.slackService.send('Error in getAllUnreadNotificationOfUserWithoutPagination', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
