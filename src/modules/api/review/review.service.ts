import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { PaginationOptions, UserType } from 'src/utils/constant';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private slackService: SlackService,
    ) {}

    async addReview(reviewObj): Promise<Review> {
        try {
            const reviewDetail = await this.reviewRepository.save(reviewObj);
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in addReview', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateReview(reviewObj): Promise<Review> {
        try {
            const reviewDetail = await this.reviewRepository.save(reviewObj);
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in updateReview', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getReviewByUserIdAndId(id: number, user_id: number): Promise<Review> {
        try {
            const reviewDetail = await this.reviewRepository.findOne({
                where: { is_deleted: false, id: id, user_id: user_id },
            });
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in getReviewByUserIdAndId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getReviewByUserIdAndBookingId(booking_id: number, user_id: number): Promise<Review> {
        try {
            const reviewDetail = await this.reviewRepository.findOne({
                where: { is_deleted: false, booking_id: booking_id, user_id: user_id },
            });
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in getReviewByUserIdAndBookingId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllReviewByUserIdForRating(user_id: number): Promise<Review[]> {
        try {
            const reviews = await this.reviewRepository.find({
                where: { is_deleted: false, tutor_user_id: user_id },
            });
            return reviews;
        } catch (error) {
            await this.slackService.send('Error in getAllReviewByUserIdForRating', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUser(user_id): Promise<User> {
        try {
            const userDetail = await this.userRepository.findOne({
                where: { is_deleted: false, user_type: UserType.TUTOR, id: user_id },
            });
            return userDetail;
        } catch (error) {
            await this.slackService.send('Error in getUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateUser(userObj): Promise<User> {
        try {
            const userDetail = await this.userRepository.save(userObj);
            return userDetail;
        } catch (error) {
            await this.slackService.send('Error in updateUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateUserRating(user_id: number): Promise<User> {
        try {
            const allReviews = await this.getAllReviewByUserIdForRating(user_id);
            let avgRating: any = 0;

            for (let index = 0; index < allReviews.length; index++) {
                const review = allReviews[index];
                avgRating = avgRating + review.rating;
            }
            if (avgRating > 0) {
                avgRating = Number(avgRating / allReviews.length).toFixed(2);
            }
            let userDetail = await this.getUser(user_id);
            userDetail.avg_rating = avgRating;
            userDetail.total_reviews = allReviews.length;
            userDetail = await this.updateUser(userDetail);
            return userDetail;
        } catch (error) {
            await this.slackService.send('Error in updateUserRating', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getReviewDetailByBookingId(booking_id: number, user_id: number): Promise<Review> {
        try {
            const reviewDetail = await this.reviewRepository
                .createQueryBuilder('review')
                .where({ is_deleted: false, user_id: user_id, booking_id: booking_id })
                .leftJoinAndSelect('review.booking', 'booking')
                .leftJoinAndSelect('review.tutor', 'tutor')
                .leftJoinAndSelect('booking.subject', 'subject')
                .select([
                    'review.id',
                    'review.remarks',
                    'review.rating',
                    'review.created_at',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'booking.mode',
                    'booking.address',
                    'subject.subject_name',
                    'subject.id',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.image',
                    'tutor.email',
                    'tutor.avg_rating',
                ])
                .getOne();
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in getReviewDetailByBookingId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllReviewsForTutor(tutor_user_id: number, pagination: PaginationOptions) {
        try {
            const reviewDetail = await this.reviewRepository
                .createQueryBuilder('review')
                .where({ is_deleted: false, tutor_user_id: tutor_user_id })
                .leftJoinAndSelect('review.booking', 'booking')
                .leftJoinAndSelect('review.student', 'student')
                .select([
                    'review.id',
                    'review.remarks',
                    'review.rating',
                    'review.created_at',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'student.first_name',
                    'student.last_name',
                    'student.image',
                    'student.email',
                ])
                .orderBy('review.id', pagination.sort)
                .skip((pagination.page - 1) * pagination.limit)
                .take(pagination.limit)
                .getMany();
            if (reviewDetail.length) {
                return {
                    data: reviewDetail,
                    page: pagination.page,
                    itemPerPage: pagination.limit,
                    totalItem: await this.reviewRepository.count({
                        where: { is_deleted: false, tutor_user_id: tutor_user_id },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllReviewsForTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllReviewsForTutorAdmin(tutor_user_id: number) {
        try {
            const reviewDetail = await this.reviewRepository
                .createQueryBuilder('review')
                .where({ is_deleted: false, tutor_user_id: tutor_user_id })
                .leftJoinAndSelect('review.booking', 'booking')
                .leftJoinAndSelect('review.student', 'student')
                .getMany();
            return reviewDetail;
        } catch (error) {
            await this.slackService.send('Error in getAllReviewsForTutorAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
