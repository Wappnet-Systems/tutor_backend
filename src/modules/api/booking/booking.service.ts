import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { TutorAvailability } from 'src/entities/tutor-availability.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { AvailabilityStatusType, BookingStatusType, StatusType, UserType } from 'src/utils/constant';
import { Between, Brackets, In, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { BookingUser } from 'src/entities/booking_user.entity';
import { MailService } from 'src/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { BookingSubject } from 'src/entities/booking-subject.entity';
import { momentUTC } from 'src/helper/date';
import { ChatService } from '../chat/chat.service';
import { EmailService } from '../email/email.service';
import { EmailTypes } from 'src/utils/notifications';
@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(TutorSubject) private readonly tutorSubjectRepository: Repository<TutorSubject>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(TutorAvailability) private readonly tutorAvailabilityRepository: Repository<TutorAvailability>,
        @InjectRepository(BookingUser) private readonly bookingUserRepository: Repository<BookingUser>,
        @InjectRepository(BookingSubject) private readonly bookingSubjectRepository: Repository<BookingUser>,
        private slackService: SlackService,
        private chatService: ChatService,
        private configService: ConfigService,
        private mailService: MailService,
        private emailService: EmailService,
    ) {}

    async addSchedule(scheduleObj): Promise<TutorAvailability> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository.save(scheduleObj);
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in addSchedule', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addBookingSubject(bookingSubjectObj): Promise<BookingSubject> {
        try {
            const bookingSubjectDetail = await this.bookingSubjectRepository.save(bookingSubjectObj);
            return bookingSubjectDetail;
        } catch (error) {
            await this.slackService.send('Error in addBookingSubject', true);
            await this.slackService.send(error + ' Error in adding booking subject', true);
            return;
        }
    }

    async addBookingUser(bookingUserObj): Promise<BookingUser> {
        try {
            const bookingUserDetail = await this.bookingUserRepository.save(bookingUserObj);
            return bookingUserDetail;
        } catch (error) {
            await this.slackService.send('Error in addBookingUser', true);
            await this.slackService.send(error + ' Error in adding booking user', true);
            return;
        }
    }

    async addBooking(bookingObj): Promise<Booking> {
        try {
            const bookingDetail = await this.bookingRepository.save(bookingObj);
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in addBooking', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateBooking(bookingObj): Promise<Booking> {
        try {
            const bookingDetail = await this.bookingRepository.save(bookingObj);
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in updateBooking', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateSchedule(scheduleObj): Promise<TutorAvailability> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository.save(scheduleObj);
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in updateSchedule', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateBookingUser(bookingUserObj): Promise<BookingUser> {
        try {
            const bookingUserDetail = await this.bookingUserRepository.save(bookingUserObj);
            return bookingUserDetail;
        } catch (error) {
            await this.slackService.send('Error in updateBookingUser', true);
            await this.slackService.send(error + ' Error in updating booking user', true);
            return;
        }
    }

    async getBookingUserByBookingId(bookingId): Promise<BookingUser[]> {
        try {
            const bookingUserDetail = await this.bookingUserRepository.find({
                where: { booking_id: bookingId, is_deleted: false },
            });
            return bookingUserDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookingUserByBookingId', true);
            await this.slackService.send(error + ' Error in updating booking user', true);
            return;
        }
    }

    async createUser(userObj: any): Promise<User> {
        try {
            const user = await this.userRepository.save(userObj);
            if (user) {
                return user;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in createUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleByTime(from_time: any, user_id: number): Promise<TutorAvailability> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository.findOne({
                where: { from_time: from_time, is_deleted: false, user_id: user_id },
            });
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleByTime', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleByWeekday(week_day: number, user_id: number, from_date: any, to_date: any): Promise<TutorAvailability[]> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository
                .createQueryBuilder('tutor-availability')
                .where('tutor-availability.date >= :startDate', { startDate: from_date })
                .andWhere('tutor-availability.date <= :endDate', { endDate: to_date })
                .andWhere({ user_id: user_id, is_deleted: false, week_day: week_day })
                .select([
                    'tutor-availability.id',
                    'tutor-availability.date',
                    'tutor-availability.from_time',
                    'tutor-availability.to_time',
                    'tutor-availability.status',
                    'tutor-availability.booking_id',
                ])
                .getMany();
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleByWeekday', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleByTimeRange(week_day: number, user_id: number, start_time: any, end_time: any): Promise<TutorAvailability> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository
                .createQueryBuilder('tutor-availability')
                .where({ user_id: user_id, is_deleted: false, week_day: week_day })
                .andWhere('(tutor-availability.from_time >= :startTime AND tutor-availability.to_time <= :endTime)', {
                    startTime: start_time,
                    endTime: end_time,
                })
                .select([
                    'tutor-availability.id',
                    'tutor-availability.date',
                    'tutor-availability.from_time',
                    'tutor-availability.to_time',
                    'tutor-availability.status',
                    'tutor-availability.booking_id',
                ])
                .getOne();
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleByTimeRange', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleByDate(from_date: any, to_date: any, user_id: number) {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository
                .createQueryBuilder('tutor-availability')
                .where('tutor-availability.date >= :startDate', { startDate: from_date })
                .andWhere('tutor-availability.date <= :endDate', { endDate: to_date })
                .andWhere({ user_id: user_id, is_deleted: false })
                .select([
                    'tutor-availability.id',
                    'tutor-availability.date',
                    'tutor-availability.from_time',
                    'tutor-availability.to_time',
                    'tutor-availability.status',
                    'tutor-availability.booking_id',
                ])
                .getMany();
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleByDate', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleByDateForStudent(from_date: any, to_date: any, user_id: number): Promise<TutorAvailability[]> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository
                .createQueryBuilder('tutor-availability')
                .where('tutor-availability.date >= :startDate', { startDate: from_date })
                .andWhere('tutor-availability.date <= :endDate', { endDate: to_date })
                .andWhere({ user_id: user_id, is_deleted: false, status: AvailabilityStatusType.OPEN })
                .select(['tutor-availability.id', 'tutor-availability.date', 'tutor-availability.from_time', 'tutor-availability.to_time'])
                .getMany();
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleByDateForStudent', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserScheduleById(id: number, user_id: number): Promise<TutorAvailability> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository.findOne({
                where: { user_id: user_id, id: id, is_deleted: false },
            });
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getUserScheduleById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getSlotsByBookingId(booking_id: number): Promise<TutorAvailability[]> {
        try {
            const scheduleDetail = await this.tutorAvailabilityRepository.find({
                where: { booking_id: booking_id, is_deleted: false },
            });
            return scheduleDetail;
        } catch (error) {
            await this.slackService.send('Error in getSlotsByBookingId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserById(user_id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: user_id },
            });
            return user;
        } catch (error) {
            await this.slackService.send('Error in getUserById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email, is_deleted: false, user_type: UserType.STUDENT, status: StatusType.ACTIVE },
            });
            return user;
        } catch (error) {
            await this.slackService.send('Error in getUserByEmail', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async markSlotAsPaid(slot_id: number): Promise<TutorAvailability> {
        try {
            const slot = await this.tutorAvailabilityRepository.findOne({
                where: { id: slot_id },
            });

            slot.is_paid = true;
            slot.paid_on = momentUTC(new Date());
            await this.tutorAvailabilityRepository.save(slot);
            return slot;
        } catch (error) {
            await this.slackService.send('Error in markSlotAsPaid', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingDetail(booking_id: number): Promise<Booking[]> {
        try {
            const bookings = await this.bookingRepository
                .createQueryBuilder('booking')
                .where({ is_deleted: false, id: booking_id })
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.student', 'student')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.hourly_rate',
                    'booking.total_amount',
                    'booking.total_slots',
                    'booking.status',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.email',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.email',
                    'slots.id',
                    'slots.from_time',
                    'slots.to_time',
                    'slots.status',
                    'slots.date',
                    'booking_subjects',
                    'subject.subject_name',
                    'subject.id',
                    'slots.is_paid',
                    'slots.paid_on',
                ])
                .getMany();

            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getBookingDetail', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingFromStudentAndTutorId(student_user_id: number, tutor_user_id: any) {
        try {
            const queryBuilder: any = await this.bookingUserRepository
                .createQueryBuilder('booking_user')
                .where({ is_deleted: false, user_id: student_user_id })
                .leftJoinAndSelect('booking_user.booking', 'booking')
                .where({
                    'booking.is_deleted': false,
                    'booking.tutor_user_id': tutor_user_id,
                    'booking.status': In([BookingStatusType.ONGOING, BookingStatusType.PAYMENT_COMPLETED]),
                });
            const bookings = await queryBuilder.getMany();
            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getBookingFromStudentAndTutorId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentBookingsDetail(user_id: number, query: any) {
        try {
            const queryBuilder: any = await this.bookingUserRepository
                .createQueryBuilder('booking_user')
                .where({ is_deleted: false, user_id: user_id })
                .leftJoinAndSelect('booking_user.booking', 'booking')
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .leftJoinAndSelect('booking.reviews', 'reviews', 'reviews.user_id = :user_id', {
                    user_id: user_id,
                })
                .select([
                    'booking.created_at',
                    'booking_user.id',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.hourly_rate',
                    'booking.total_amount',
                    'booking.total_slots',
                    'booking.status',
                    'booking.student_user_id',
                    'booking.rejection_reason',
                    'booking.mode',
                    'booking.address',
                    'booking.lat',
                    'booking.lng',
                    'booking.special_comments',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.email',
                    'tutor.image',
                    'slots.id',
                    'slots.from_time',
                    'slots.to_time',
                    'slots.status',
                    'slots.date',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                    'reviews',
                ]);

            if (query.search) {
                const filter = query.search.toLowerCase();

                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(tutor.first_name) LIKE :filter', { filter: `%${filter}%` })
                            .orWhere('LOWER(tutor.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.first_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            });
                    }),
                );
            }

            if (query.status) {
                queryBuilder.andWhere('booking.status = :status', { status: query.status });
            }

            if (query.from_date && query.to_date) {
                queryBuilder
                    .andWhere('booking.booking_start_date >= :startDate', { startDate: query.from_date })
                    .andWhere('booking.booking_start_date <= :endDate', { endDate: query.to_date });
            }

            const bookingCnt = await queryBuilder.getMany();
            const bookings = await queryBuilder
                .orderBy('booking.id', query.sort)
                .skip((query.page - 1) * query.limit)
                .take(query.limit)
                .getMany();

            for (let index = 0; index < bookings.length; index++) {
                const booking = bookings[index];

                booking.booking.invitees = await this.bookingUserRepository
                    .createQueryBuilder('booking_user')
                    .where({ is_deleted: false, booking_id: booking.booking.id })
                    .leftJoinAndSelect('booking_user.student', 'student')
                    .select(['booking_user.id', 'student.id', 'student.first_name', 'student.last_name', 'student.email', 'student.image'])
                    .getMany();
            }

            return {
                data: bookings,
                page: query.page,
                itemPerPage: query.limit,
                totalItem: bookingCnt.length,
            };
        } catch (error) {
            await this.slackService.send('Error in getStudentBookingsDetail', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorBookingsDetail(user_id: number, query: any) {
        try {
            const queryBuilder = await this.bookingRepository
                .createQueryBuilder('booking')
                .where({ is_deleted: false, tutor_user_id: user_id })
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.student', 'student')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.reviews', 'reviews', 'reviews.tutor_user_id = :user_id', {
                    user_id: user_id,
                })
                .leftJoinAndSelect('booking.bookingUsers', 'booking_user')
                .leftJoinAndSelect('booking_user.student', 'booking_student')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.hourly_rate',
                    'booking.total_amount',
                    'booking.total_slots',
                    'booking.student_user_id',
                    'booking.created_at',
                    'booking.mode',
                    'booking.address',
                    'booking.rejection_reason',
                    'booking.lat',
                    'booking.lng',
                    'booking.status',
                    'booking.special_comments',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.email',
                    'tutor.image',
                    'booking_user.id',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.email',
                    'student.image',
                    'booking_student.id',
                    'booking_student.first_name',
                    'booking_student.last_name',
                    'booking_student.email',
                    'booking_student.image',
                    'slots.id',
                    'slots.from_time',
                    'slots.to_time',
                    'slots.status',
                    'slots.date',
                    'booking_subjects',
                    'subject.subject_name',
                    'subject.id',
                    'reviews',
                ]);

            if (query.search) {
                const filter = query.search.toLowerCase();

                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(tutor.first_name) LIKE :filter', { filter: `%${filter}%` })
                            .orWhere('LOWER(tutor.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.first_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            });
                    }),
                );
            }

            if (query.status) {
                queryBuilder.andWhere('booking.status = :status', { status: query.status });
            }
            if (query.from_date && query.to_date) {
                queryBuilder
                    .andWhere('booking.booking_start_date >= :startDate', { startDate: query.from_date })
                    .andWhere('booking.booking_start_date <= :endDate', { endDate: query.to_date });
            }
            const bookingCnt = await queryBuilder.getMany();

            const bookings = await queryBuilder
                .orderBy('booking.id', query.sort)
                .skip((query.page - 1) * query.limit)
                .take(query.limit)
                .getMany();

            return {
                data: bookings,
                page: query.page,
                itemPerPage: query.limit,
                totalItem: bookingCnt.length,
            };
        } catch (error) {
            await this.slackService.send('Error in getTutorBookingsDetail', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentBookingsDetailForCalendar(user_id: number, query: any) {
        try {
            const queryBuilder: any = await this.bookingUserRepository
                .createQueryBuilder('booking_user')
                .where({ is_deleted: false, user_id: user_id })
                .leftJoinAndSelect('booking_user.booking', 'booking')
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'booking_user.id',
                    'booking.id',
                    'booking.created_at',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.hourly_rate',
                    'booking.total_amount',
                    'booking.total_slots',
                    'booking.status',
                    'booking.student_user_id',
                    'booking.mode',
                    'booking.address',
                    'booking.lat',
                    'booking.lng',
                    'booking.special_comments',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.email',
                    'tutor.image',
                    'slots.id',
                    'slots.from_time',
                    'slots.to_time',
                    'slots.status',
                    'slots.date',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ]);

            if (query.search) {
                const filter = query.search.toLowerCase();

                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(tutor.first_name) LIKE :filter', { filter: `%${filter}%` })
                            .orWhere('LOWER(tutor.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.first_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            });
                    }),
                );
            }

            if (query.status) {
                queryBuilder.andWhere('booking.status = :status', { status: query.status });
            }
            if (query.from_date && query.to_date) {
                queryBuilder
                    .andWhere('booking.booking_start_date >= :startDate', { startDate: query.from_date })
                    .andWhere('booking.booking_start_date <= :endDate', { endDate: query.to_date });
            }
            const bookings = await queryBuilder.getMany();

            for (let index = 0; index < bookings.length; index++) {
                const booking = bookings[index];

                booking.booking.invitees = await this.bookingUserRepository
                    .createQueryBuilder('booking_user')
                    .where({ is_deleted: false, booking_id: booking.booking.id })
                    .leftJoinAndSelect('booking_user.student', 'student')
                    .select(['booking_user.id', 'student.id', 'student.first_name', 'student.last_name', 'student.email', 'student.image'])
                    .getMany();
            }

            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getStudentBookingsDetailForCalendar', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorBookingsDetailForCalendar(user_id: number, query: any) {
        try {
            const queryBuilder = await this.bookingRepository
                .createQueryBuilder('booking')
                .where({ is_deleted: false, tutor_user_id: user_id })
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.student', 'student')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingUsers', 'booking_user')
                .leftJoinAndSelect('booking_user.student', 'booking_student')
                .select([
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.hourly_rate',
                    'booking.created_at',
                    'booking.total_amount',
                    'booking.total_slots',
                    'booking.student_user_id',
                    'booking.mode',
                    'booking.address',
                    'booking.lat',
                    'booking.lng',
                    'booking.status',
                    'booking.special_comments',
                    'booking.rejection_reason',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.email',
                    'tutor.image',
                    'booking_user.id',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.email',
                    'student.image',
                    'booking_student.id',
                    'booking_student.first_name',
                    'booking_student.last_name',
                    'booking_student.email',
                    'booking_student.image',
                    'slots.id',
                    'slots.from_time',
                    'slots.to_time',
                    'slots.status',
                    'slots.date',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ]);

            if (query.search) {
                const filter = query.search.toLowerCase();

                queryBuilder.andWhere(
                    new Brackets((qb) => {
                        qb.where('LOWER(tutor.first_name) LIKE :filter', { filter: `%${filter}%` })
                            .orWhere('LOWER(tutor.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.first_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            })
                            .orWhere('LOWER(booking_student.last_name) LIKE :filter', {
                                filter: `%${filter}%`,
                            });
                    }),
                );
            }

            if (query.status) {
                queryBuilder.andWhere('booking.status = :status', { status: query.status });
            }

            if (query.from_date && query.to_date) {
                queryBuilder
                    .andWhere('booking.booking_start_date >= :startDate', { startDate: query.from_date })
                    .andWhere('booking.booking_start_date <= :endDate', { endDate: query.to_date });
            }
            const bookings = await queryBuilder.getMany();

            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getTutorBookingsDetailForCalendar', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingById(id: number): Promise<Booking> {
        try {
            const bookingDetail = await this.bookingRepository.findOne({
                where: { id: id, is_deleted: false },
            });
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookingById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingByIdForAssignment(id: number, tutor_user_id: number, student_user_id: number): Promise<BookingUser> {
        try {
            const bookingDetail = await this.bookingUserRepository.findOne({
                where: { booking_id: id, is_deleted: false, user_id: student_user_id },
                relations: { booking: true },
            });
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookingByIdForAssignment', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingByIdForReview(id: number): Promise<Booking> {
        try {
            const bookingDetail = await this.bookingRepository.findOne({
                where: { id: id, is_deleted: false, status: BookingStatusType.COMPLETED },
            });
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookingByIdForReview', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getBookingUserByIdForReview(id: number, student_user_id: number): Promise<BookingUser> {
        try {
            const bookingDetail = await this.bookingUserRepository.findOne({
                where: { booking_id: id, is_deleted: false, user_id: student_user_id },
            });
            return bookingDetail;
        } catch (error) {
            await this.slackService.send('Error in getBookingUserByIdForReview', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorSubject(id: number): Promise<TutorSubject[]> {
        try {
            const tutorSubjects = await this.tutorSubjectRepository
                .createQueryBuilder('tutor_subject')
                .leftJoinAndSelect('tutor_subject.subject_category', 'subject_category')
                .leftJoinAndSelect('tutor_subject.subject', 'subject')
                .where('tutor_subject.user_id = :userId AND tutor_subject.is_deleted = :isDeleted', { userId: id, isDeleted: false })
                .select(['tutor_subject.id', 'subject_category.id', 'subject_category.category_name', 'subject.id', 'subject.subject_name'])
                .getMany();
            return tutorSubjects;
        } catch (error) {
            await this.slackService.send('Error in getTutorSubject', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorSubjectBySubjectId(subject_id: number, user_id: number): Promise<TutorSubject> {
        try {
            const tutor_subject = await this.tutorSubjectRepository.findOne({
                where: { subject_id: subject_id, is_deleted: false, user_id: user_id },
            });
            return tutor_subject;
        } catch (error) {
            await this.slackService.send('Error in getTutorSubjectBySubjectId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async sendEmail(email: string, username: string, password: string) {
        const loginLink = `${this.configService.get<string>('WEB_URL')}/login`;

        const content =
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<title>Login Details</title>' +
            '</head>' +
            '<body>' +
            '<p> Hello, </p>' +
            '<p>' +
            'You have been added to booking by' +
            username +
            ' . Click the link below to login using your email id and password : ' +
            password +
            '</p>' +
            '<p>' +
            '<a href="' +
            loginLink +
            '"> Login </a>' +
            '</p>' +
            'Regards,' +
            'Tutor' +
            '</p>' +
            '</body>' +
            '</html>';

        this.mailService
            .sendMail({
                to: email,
                subject: 'Login Details',
                html: content,
            })
            .then(() => {
                const text = `Login Details email send to ${email}`;
                this.slackService.send(text, false);
            })
            .catch((error) => {
                const text = `Error in sending Login Details email to ${email}`;
                this.slackService.send(text, true);
            });
    }

    async getTutorStudents(userId: number): Promise<any[]> {
        try {
            const bookingUsers = await this.bookingUserRepository
                .createQueryBuilder('booking_users')
                .leftJoinAndSelect(
                    'booking_users.booking',
                    'booking',
                    'booking.status = :status AND booking.tutor_user_id = :userId AND booking.is_deleted = :isDeleted',
                    { status: BookingStatusType.ONGOING, userId: userId, isDeleted: false },
                )
                .leftJoinAndSelect('booking_users.student', 'student')
                .where('booking.status = :status', { status: BookingStatusType.ONGOING })
                .select(['student.id', 'student.first_name', 'student.last_name'])
                .distinct(true)
                .getRawMany();
            return bookingUsers;
        } catch (error) {
            await this.slackService.send('Error in getTutorStudents', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentsBookingFromTutorId(userId: number, tutor_user_id: number): Promise<BookingUser[]> {
        try {
            const bookingUsers = await this.bookingUserRepository
                .createQueryBuilder('booking_users')
                .leftJoinAndSelect(
                    'booking_users.booking',
                    'booking',
                    'booking.status = :status AND booking.tutor_user_id = :tutor_user_id AND booking.is_deleted = :isDeleted',
                    { status: BookingStatusType.ONGOING, tutor_user_id: tutor_user_id, isDeleted: false },
                )
                .where('booking_users.user_id = :userId AND booking_users.is_deleted = :isDeleted', { userId: userId, isDeleted: false })
                .select(['booking_users.id', 'booking.id', 'booking.booking_start_date', 'booking.booking_end_date'])
                .getMany();

            return bookingUsers;
        } catch (error) {
            await this.slackService.send('Error in getStudentsBookingFromTutorId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorBookingsForAdmin(user_id: number): Promise<Booking[]> {
        try {
            const bookings = await this.bookingRepository
                .createQueryBuilder('booking')
                .where({ is_deleted: false, tutor_user_id: user_id })
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.student', 'student')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .getMany();
            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getTutorBookingsForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentBookingsForAdmin(user_id: number) {
        try {
            const queryBuilder: any = await this.bookingUserRepository
                .createQueryBuilder('booking_user')
                .where({ is_deleted: false, user_id: user_id })
                .leftJoinAndSelect('booking_user.booking', 'booking')
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('booking.slots', 'slots')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .leftJoinAndSelect('booking.reviews', 'reviews', 'reviews.user_id = :user_id', {
                    user_id: user_id,
                });

            const bookings = await queryBuilder.getMany();
            return bookings;
        } catch (error) {
            await this.slackService.send('Error in getStudentBookingsForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async sendBookingNotifications() {
        const currentTime = momentUTC(new Date());
        const fiveMinutesFromNow = momentUTC(new Date(currentTime.getTime() + 1 * 60000));

        const bookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.PAYMENT_COMPLETED })
            .andWhere('booking.booking_start_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_start_date <= :endDate', { endDate: fiveMinutesFromNow })
            .getMany();

        for (let index = 0; index < bookings.length; index++) {
            const booking = bookings[index];
            await this.emailService.sendEmail(
                EmailTypes.NOTIFY_BOOKING,
                booking.tutor_user_id,
                booking.student_user_id,
                booking.tutor_user_id,
                '',
                '',
                '',
            );
            const booking_users = await this.bookingUserRepository.find({
                where: { booking_id: booking.id, is_deleted: false },
            });
            for (let index = 0; index < booking_users.length; index++) {
                const booking_user = booking_users[index];
                await this.emailService.sendEmail(
                    EmailTypes.NOTIFY_BOOKING,
                    booking_user.user_id,
                    booking_user.user_id,
                    booking.tutor_user_id,
                    '',
                    '',
                    '',
                );
            }
        }
    }

    async sendNotificationEmail(email: string) {
        const content =
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<title>Login Details</title>' +
            '</head>' +
            '<body>' +
            '<p> Hello, </p>' +
            '<p>' +
            'You booking scheduled shortly' +
            '</p>' +
            'Regards,' +
            'Tutor' +
            '</p>' +
            '</body>' +
            '</html>';

        this.mailService
            .sendMail({
                to: email,
                subject: 'Login Details',
                html: content,
            })
            .then(() => {
                const text = `Booking Notification email send to ${email}`;
                this.slackService.send(text, false);
            })
            .catch(() => {
                const text = `Error in Notification Details email to ${email}`;
                this.slackService.send(text, true);
            });
    }

    async startBookingStatus() {
        const currentTime = momentUTC(new Date());
        const oneMinuteFromNow = momentUTC(new Date(currentTime.getTime() + 1 * 60000));

        const bookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.PAYMENT_COMPLETED })
            .andWhere('booking.booking_start_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_start_date <= :endDate', { endDate: oneMinuteFromNow })
            .getMany();

        for (let index = 0; index < bookings.length; index++) {
            const booking = bookings[index];
            booking.status = BookingStatusType.ONGOING;
            await this.bookingRepository.save(booking);
        }
    }

    async completeBookingStatus() {
        const currentTime = momentUTC(new Date());
        const oneMinuteFromNow = momentUTC(new Date(currentTime.getTime() + 1 * 60000));
        const bookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.ONGOING })
            .andWhere('booking.booking_end_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_end_date <= :endDate', { endDate: oneMinuteFromNow })
            .getMany();

        for (let index = 0; index < bookings.length; index++) {
            const booking = bookings[index];
            booking.status = BookingStatusType.COMPLETED;
            await this.bookingRepository.save(booking);
            const bookingUsers = await this.getBookingUserByBookingId(booking.id);
            if (bookingUsers.length > 0) {
                for (let index = 0; index < bookingUsers.length; index++) {
                    const bookingUser = bookingUsers[index];
                    // check for other booking of user with same tutor
                    const userBookings = await this.getBookingFromStudentAndTutorId(bookingUser.user_id, booking.tutor_user_id);
                    if (userBookings?.length == 0) {
                        this.chatService.closeConversation(booking.tutor_user_id, bookingUser.user_id);
                    }
                }
            }
        }
        return bookings;
    }

    async cancelBooking() {
        const currentTime = momentUTC(new Date());
        const thirtyMinuteFromNow = momentUTC(new Date(currentTime.getTime() + 30 * 60000));
        const bookings = [];
        const bookings1 = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.PAYMENT_PENDING })
            .andWhere('booking.booking_start_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_start_date <= :endDate', { endDate: thirtyMinuteFromNow })
            .getMany();
        bookings.push(...bookings1);
        const bookings2 = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.PENDING })
            .andWhere('booking.booking_start_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_start_date <= :endDate', { endDate: thirtyMinuteFromNow })
            .getMany();
        bookings.push(...bookings2);
        const bookings3 = await this.bookingRepository
            .createQueryBuilder('booking')
            .where({ is_deleted: false, status: BookingStatusType.PAYMENT_FAILED })
            .andWhere('booking.booking_start_date >= :startDate', { startDate: currentTime })
            .andWhere('booking.booking_start_date <= :endDate', { endDate: thirtyMinuteFromNow })
            .getMany();
        bookings.push(...bookings3);
        for (let index = 0; index < bookings.length; index++) {
            const booking = bookings[index];
            booking.status = BookingStatusType.CANCELLED;
            await this.bookingRepository.save(booking);
        }
        return bookings;
    }
}
