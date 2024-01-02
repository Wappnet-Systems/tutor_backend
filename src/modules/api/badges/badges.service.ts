import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { Booking } from 'src/entities/booking.entity';
import { Review } from 'src/entities/review.entity';
import { TutorBadges } from 'src/entities/tutor_badges.entity';
import { User } from 'src/entities/user.entity';
import { momentUTC } from 'src/helper/date';
import { SlackService } from 'src/services/slack.service';
import { BookingStatusType, UserType } from 'src/utils/constant';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class BadgesService {
    constructor(
        @InjectRepository(Badge) private readonly badgeRepository: Repository<Badge>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(BookingSubject) private readonly bookingSubjectRepository: Repository<BookingSubject>,
        @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
        @InjectRepository(TutorBadges) private readonly tutorBadgeRepository: Repository<TutorBadges>,
        private readonly slackService: SlackService,
    ) {}

    async getAllBadges(): Promise<Badge[]> {
        try {
            const badges = await this.badgeRepository.find({
                where: { is_deleted: false },
            });
            return badges;
        } catch (error) {
            await this.slackService.send('Error in getAllBadges', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addBadgeToUser(user_id: any) {
        try {
            const user_details = await this.userRepository.findOne({
                where: { id: user_id, user_type: UserType.TUTOR, is_deleted: false, is_approved: true },
            });
            const userBadges = await this.tutorBadgeRepository.find({
                where: { id: user_id, is_deleted: false },
            });
            const allBadges = await this.badgeRepository.find({
                where: { is_deleted: false },
            });

            const bookings = await this.bookingRepository.find({
                where: { tutor_user_id: user_id, is_deleted: false, status: BookingStatusType.COMPLETED },
            });

            const newBadges = [];

            for (let index = 0; index < allBadges.length; index++) {
                const badge = allBadges[index];
                let newBadge = true;
                for (let index2 = 0; index2 < userBadges.length; index2++) {
                    const userBadge = userBadges[index2];
                    if (userBadge.badge_id == badge.id) {
                        newBadge = false;
                    }
                }
                if (newBadge) {
                    newBadges.push(badge);
                }
            }

            if (newBadges.length > 0) {
                for (let i = 0; i < newBadges.length; i++) {
                    const badge = newBadges[i];
                    switch (badge.title) {
                        case 'Mentor':
                            if (bookings.length >= 10) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        case 'Master Mentor':
                            if (bookings.length >= 50) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        case 'Outstanding Feedback':
                            const bookingReviews = await this.reviewRepository.find({
                                where: { tutor_user_id: user_id, is_deleted: false, rating: MoreThanOrEqual(4) },
                            });
                            if (bookingReviews.length >= 50) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        case 'Subject Matter Expert':
                            const bookingSubjects = await this.bookingSubjectRepository
                                .createQueryBuilder('bookingSubject')
                                .select(['bookingSubject.subject_id', 'COUNT(bookingSubject.subject_id) AS subject_count'])
                                .groupBy('bookingSubject.subject_id')
                                .having('subject_count > :count', { count: 50 })
                                .getRawMany();
                            if (bookingSubjects.length > 0) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        case 'Experienced':
                            const oneYearAgo = momentUTC(new Date());
                            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                            if (user_details.created_at <= oneYearAgo) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        case 'Veteran':
                            const threeYearAgo = momentUTC(new Date());
                            threeYearAgo.setFullYear(threeYearAgo.getFullYear() - 3);
                            if (user_details.created_at <= threeYearAgo) {
                                await this.tutorBadgeRepository.save({
                                    badge_id: badge.id,
                                    user_id: user_id,
                                });
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            return true;
        } catch (error) {
            await this.slackService.send('Error in addBadgeToUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
