import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';
import { BookingStatusType, UserType } from 'src/utils/constant';
import { Brackets, Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { SubjectCategory } from 'src/entities/subject-category.entity';
import { Booking } from 'src/entities/booking.entity';

@Injectable()
export class TutorService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(SubjectCategory) private readonly subjectCategoryRepository: Repository<SubjectCategory>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        private readonly slackService: SlackService,
    ) { }

    async getTopRatedTutor(user_id: number) {
        try {
            const selections = [
                'user.id',
                'user.first_name',
                'user.last_name',
                'user.image',
                'user.email',
                'user.contact_number',
                'user.whatsapp',
                'user.hourly_rate',
                'user.address',
                'user.avg_rating',
                'user.total_reviews',
                'education_details',
                'tutor_badge.id',
                'badge.title',
                'badge.description',
            ];

            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.education_details', 'education_details', 'education_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                    select: ['course_name', 'university_name', 'location', 'description', 'start_date', 'end_date', 'is_ongoing'],
                })
                .leftJoinAndSelect('user.tutor_badge', 'tutor_badge', 'tutor_badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_badge.badge', 'badge', 'badge.is_deleted = :isDeleted', { isDeleted: false })
                .orderBy('user.avg_rating', 'DESC')
                .addOrderBy('user.total_reviews', 'DESC')
                .limit(4);

            if (user_id) {
                queryBuilder.leftJoinAndSelect(
                    'user.student_bookmarks',
                    'student_bookmarks',
                    'student_bookmarks.is_deleted = :isDeleted AND student_bookmarks.student_user_id = :user_id',
                    {
                        isDeleted: false,
                        user_id: user_id,
                    },
                );
                queryBuilder.select([...selections, 'student_bookmarks.id']);
            } else {
                queryBuilder.select([...selections]);
            }
            const topRatedTutor = await queryBuilder.getMany();
            return topRatedTutor;
        } catch (error) {
            await this.slackService.send('Error in getTopRatedTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTopExperiencedTutor() {
        try {
            const tutors = await this.userRepository
                .createQueryBuilder('tutor')
                .where({ is_deleted: false, user_type: UserType.TUTOR, is_approved: true, email_verified: true })
                .orderBy('tutor.created_at', 'ASC')
                .limit(4)
                .getMany();

            return tutors;
        } catch (error) {
            await this.slackService.send('Error in getTopExperiencedTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutors(query: any, user_id: number) {
        try {
            const selections = [
                'tutor.id',
                'tutor.email',
                'tutor.first_name',
                'tutor.last_name',
                'tutor.image',
                'tutor.contact_number',
                'tutor.tag_line',
                'tutor.gender',
                'tutor.hourly_rate',
                'tutor.address',
                'tutor.address_line_two',
                'tutor.introduction',
                'tutor.zipcode',
                'tutor.avg_rating',
                'tutor.total_reviews',
                'tutor.languages',
                'tutor.teach_at_offline',
                'tutor.teach_at_online',
                'tutor_subjects.id',
                'tutor_subjects.subject_id',
                'tutor_subjects.category_id',
                'subject_category.category_name',
                'subject.subject_name',
                'subject.id',
                'media_gallery.media',
                'country_details.country_name',
                'city_details.city_name',
                'tutor_postcodes.id',
                'postcode.postcode',
                'postcode.place_name',
                'tutor_badge.id',
                'badge.title',
                'badge.description',
            ];

            const queryBuilder = this.userRepository
                .createQueryBuilder('tutor')
                .where({ is_deleted: false, user_type: UserType.TUTOR, is_approved: true, email_verified: true })
                .leftJoinAndSelect('tutor.media_gallery', 'media_gallery', 'media_gallery.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor.tutor_subjects', 'tutor_subjects', 'tutor_subjects.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_subjects.subject_category', 'subject_category')
                .leftJoinAndSelect('tutor_subjects.subject', 'subject')
                .leftJoinAndSelect('tutor.country_details', 'country_details')
                .leftJoinAndSelect('tutor.city_details', 'city_details')
                .leftJoinAndSelect('tutor.tutor_postcodes', 'tutor_postcodes', 'tutor_postcodes.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_postcodes.postcode', 'postcode', 'postcode.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor.tutor_badge', 'tutor_badge', 'tutor_badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_badge.badge', 'badge', 'badge.is_deleted = :isDeleted', { isDeleted: false });

            if (user_id) {
                queryBuilder.leftJoinAndSelect(
                    'tutor.student_bookmarks',
                    'student_bookmarks',
                    'student_bookmarks.is_deleted = :isDeleted AND student_bookmarks.student_user_id = :user_id',
                    {
                        isDeleted: false,
                        user_id: user_id,
                    },
                );
                queryBuilder.select([...selections, 'student_bookmarks.id']);
            } else {
                queryBuilder.select([...selections]);
            }

            if (query.search) {
                const filter = query.search.toLowerCase();

                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(tutor.first_name) LIKE :filter', { filter: `%${filter}%` })
                            .orWhere('LOWER(tutor.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(subject_category.category_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            });
                    }),
                );
            }

            if (query.category && query.category != '' && query.subject && query.subject != '') {
                const filter = query.category;
                const categories = filter.split(',');
                const subjects = query.subject.split(',');
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('(tutor_subjects.category_id) IN (:...filter) AND (tutor_subjects.subject_id) IN (:...subjects)', {
                            filter: categories,
                            subjects: subjects,
                        });
                    }),
                );
            } else if (query.category && query.category != '') {
                const filter = query.category;
                const categories = filter.split(',');
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('(tutor_subjects.category_id) IN (:...filter)', { filter: categories });
                    }),
                );
            } else if (query.subject && query.subject != '') {
                const subjects = query.subject.split(',');
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('(tutor_subjects.subject_id) IN (:...subjects)', { subjects: subjects });
                    }),
                );
            }

            if (query.postcode && query.postcode != '') {
                const postcodes = query.postcode.split(',');
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('(tutor_postcodes.postcode_id) IN (:...postcodes)', { postcodes: postcodes });
                    }),
                );
            }

            if (query.hourly_rate_min && query.hourly_rate_min != '') {
                queryBuilder.andWhere('tutor.hourly_rate >= :hourlyRateMin', { hourlyRateMin: parseInt(query.hourly_rate_min) });
            }

            if (query.hourly_rate_max && query.hourly_rate_max != '') {
                queryBuilder.andWhere('tutor.hourly_rate <= :hourlyRateMax', { hourlyRateMax: parseInt(query.hourly_rate_max) });
            }

            if (query.booking_type) {
                if (query.booking_type == 'online') {
                    queryBuilder.andWhere('tutor.teach_at_online = :bookingType', { bookingType: true });
                } else {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('tutor.teach_at_offline = :bookingType', { bookingType: true });
                        }),
                    );
                }
            }

            if (query.gender) {
                queryBuilder.andWhere('tutor.gender = :gender', { gender: query.gender });
            }

            if (query.rating && query.rating != '') {
                queryBuilder
                    .andWhere('tutor.avg_rating >= :ratingMin', { ratingMin: Number(query.rating) })
                    .andWhere('tutor.avg_rating < :ratingMax', { ratingMax: Number(query.rating) + 1 });
            }

            if (query.location && query.location != '') {
                const locationFilter = query.location.toLowerCase();
                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(country_details.country_name) LIKE :location', { location: `%${locationFilter}%` }).orWhere(
                            'LOWER(city_details.city_name) LIKE :location',
                            { location: `%${locationFilter}%` },
                        );
                    }),
                );
            }

            const tutors = await queryBuilder
                .orderBy('tutor.hourly_rate', query.sort)
                .skip((query.page - 1) * query.limit)
                .take(query.limit)
                .getMany();
            const totalItem = await queryBuilder.getCount();
            return {
                data: tutors,
                page: query.page,
                itemPerPage: query.limit,
                totalItem: totalItem,
            };
        } catch (error) {
            await this.slackService.send('Error in getTutors', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getNewTutor() {
        try {
            const tutors = await this.userRepository
                .createQueryBuilder('tutor')
                .where({ is_deleted: false, user_type: UserType.TUTOR, is_approved: true, email_verified: true })
                .orderBy('tutor.created_at', 'DESC')
                .limit(4)
                .getMany();

            return tutors;
        } catch (error) {
            await this.slackService.send('Error in getNewTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getPopularCategories() {
        try {
            const count = await this.subjectCategoryRepository
                .createQueryBuilder('subject_category')
                .leftJoinAndSelect('subject_category.tutor_subject', 'tutor_subject', 'tutor_subject.is_deleted = :isDeleted', { isDeleted: false })
                .where({ is_deleted: false })
                .select([
                    'subject_category.id',
                    'subject_category.category_name',
                    'subject_category.media',
                    'COUNT(tutor_subject.id) as tutor_subject_count',
                ])
                .groupBy('subject_category.id')
                .getRawMany();

            return count;
        } catch (error) {
            await this.slackService.send('Error in getPopularCategories', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getCounts() {
        try {
            const tutors = await this.userRepository
                .createQueryBuilder('tutor')
                .where({ is_deleted: false, user_type: UserType.TUTOR, is_approved: true, email_verified: true })
                .getCount();

            const students = await this.userRepository
                .createQueryBuilder('student')
                .where({ is_deleted: false, user_type: UserType.STUDENT, email_verified: true })
                .getCount();

            const bookings = await this.bookingRepository
                .createQueryBuilder('booking')
                .where({ is_deleted: false, status: BookingStatusType.COMPLETED })
                .getCount();

            const categories = await this.subjectCategoryRepository.createQueryBuilder('subjectCategory').where({ is_deleted: false }).getCount();

            const counts = {
                total_number_of_tutors_available: tutors,
                total_number_of_student_available: students,
                total_number_of_bookings: bookings,
                total_number_of_categories: categories,
            };
            return counts;
        } catch (error) {
            await this.slackService.send('Error in getCounts', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
