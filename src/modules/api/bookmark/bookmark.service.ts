import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from 'src/entities/bookmark.entity';
import { SlackService } from 'src/services/slack.service';
import { PaginationOptions } from 'src/utils/constant';
import { Repository } from 'typeorm';

@Injectable()
export class BookmarkService {
    constructor(@InjectRepository(Bookmark) private readonly bookmarkRepository: Repository<Bookmark>, private slackService: SlackService) {}

    async addBookmark(bookmarkObj): Promise<Bookmark> {
        try {
            const bookmarkDetail = await this.bookmarkRepository.save(bookmarkObj);
            return bookmarkDetail;
        } catch (error) {
            await this.slackService.send('Error in addBookmark', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateBookmark(bookmarkObj): Promise<Bookmark> {
        try {
            const bookmarkDetail = await this.bookmarkRepository.save(bookmarkObj);
            return bookmarkDetail;
        } catch (error) {
            await this.slackService.send('Error in updateBookmark', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserBookmark(user_id: number, pagination: PaginationOptions) {
        try {
            const bookMark = await this.bookmarkRepository
                .createQueryBuilder('bookmark')
                .where({ is_deleted: false, student_user_id: user_id })
                .leftJoinAndSelect('bookmark.tutor', 'tutor')
                .select(['bookmark.id', 'tutor.id', 'tutor.first_name', 'tutor.last_name', 'tutor.email', 'tutor.image', 'tutor.tag_line'])
                .orderBy('bookmark.id', pagination.sort)
                .skip((pagination.page - 1) * pagination.limit)
                .take(pagination.limit)
                .getMany();

            return {
                data: bookMark,
                page: pagination.page,
                itemPerPage: pagination.limit,
                totalItem: await this.bookmarkRepository.count({
                    where: { is_deleted: false, student_user_id: user_id },
                }),
            };
        } catch (error) {
            await this.slackService.send('Error in getUserBookmark', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserBookmarkId(id: number, user_id: number): Promise<Bookmark> {
        try {
            const bookmarkDetail = await this.bookmarkRepository.findOne({
                where: { is_deleted: false, id: id, student_user_id: user_id },
            });
            return bookmarkDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserBookmarkId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookmarkByTutorAndUserId(tutor_id: number, user_id: number): Promise<Bookmark> {
        try {
            const bookmarkDetail = await this.bookmarkRepository.findOne({
                where: { is_deleted: false, tutor_user_id: tutor_id, student_user_id: user_id },
            });
            return bookmarkDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookmarkByTutorAndUserId', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
