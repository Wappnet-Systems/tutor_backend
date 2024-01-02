import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { AuthGuard } from '../auth/auth.guard';
import { AvailabilityStatusType, BookingModes, BookingStatusType, StatusType, TutorBookingStatusType, UserType } from 'src/utils/constant';
import { ScheduleDTO } from './dtos/schedule.dto';
import { GetScheduleDTO } from './dtos/get_schedule.dto';
import { UpdateScheduleDTO } from './dtos/update_schedule.dto';
import { BookingDTO } from './dtos/booking.dto';
import { UpdateBooking } from './dtos/update_booking.dto';
import { VerifyInviteeDTO } from './dtos/verify-invitee.dto';
import { PasswordService } from 'src/services/password.service';
import * as bcrypt from 'bcrypt';
import { formatDate, momentUTC, stringToDate, timeStamp } from 'src/helper/date';
import { BadgesService } from '../badges/badges.service';
import { NotificationService } from '../notification/notification.service';
import { EmailTypes, NotificationMessages, NotificationTitles, NotificationTypes } from 'src/utils/notifications';
import { ChatService } from '../chat/chat.service';
import { EmailService } from '../email/email.service';
import * as moment from 'moment-timezone';

@ApiTags('booking')
@ApiBearerAuth('access-token')
@Controller('booking')
export class BookingController {
    constructor(
        private bookingService: BookingService,
        private passwordService: PasswordService,
        private notificationService: NotificationService,
        private badgeService: BadgesService,
        private chatService: ChatService,
        private emailService: EmailService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a booking' })
    @ApiBody({ type: BookingDTO })
    @Post('')
    async addBooking(@Req() req: any, @Body() payload: BookingDTO, @Res() res: Response) {
        if (req.user_type == UserType.STUDENT) {
            const bookingSubject: any = payload.subject_ids;

            const studentDetail = await this.bookingService.getUserById(req.user_id);
            const slots = payload.slots;
            const slotDetails = [];
            if (slots.length < 1) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Slot IDs are required'],
                });
            }

            if (bookingSubject.length < 1) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Subject Ids are required'],
                });
            }

            const tutor_detail = await this.bookingService.getUserById(payload.tutor_id);
            if (!tutor_detail) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Tutor does not exist'],
                });
            }

            for (let index = 0; index < slots.length; index++) {
                const slot = slots[index];

                const slotDetail = await this.bookingService.getUserScheduleById(slot, payload.tutor_id);
                if (!slotDetail) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: [`Slots is not available. Please unselect and try to book again`],
                    });
                } else if (slotDetail.status == AvailabilityStatusType.BOOKED) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: [`Slot for ${timeStamp(slotDetail.from_time)} is not available. Please unselect and try to book again`],
                    });
                } else {
                    slotDetails.push(slotDetail);
                }
            }

            let min_date = new Date();
            let max_date = new Date();
            for (let index = 0; index < slotDetails.length; index++) {
                const slotDetail = slotDetails[index];
                if (index == 0) {
                    min_date = slotDetail.from_time;
                    max_date = slotDetail.to_time;
                } else {
                    if (slotDetail.from_time < min_date) {
                        min_date = slotDetail.from_time;
                    }

                    if (slotDetail.to_time > max_date) {
                        max_date = slotDetail.to_time;
                    }
                }
            }

            for (let index = 0; index < bookingSubject.length; index++) {
                const subject = bookingSubject[index];
                const tutorSubject = await this.bookingService.getTutorSubjectBySubjectId(subject, payload.tutor_id);
                if (!tutorSubject) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Subject does not exist in tutor subjects'],
                    });
                }
            }

            if (payload.mode == BookingModes.ONLINE && !tutor_detail.teach_at_online) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Tutor does not teach online'],
                });
            }

            if (payload.mode == BookingModes.OFFLINE && !tutor_detail.teach_at_offline) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Tutor does not teach offline'],
                });
            }

            if (payload.mode == BookingModes.OFFLINE) {
                if (!payload.address || !payload.lat || !payload.lng) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Please enter valid address'],
                    });
                }
            }

            if (payload?.invitee?.length > 0) {
                if (!tutor_detail.hourly_rate2 && !tutor_detail.hourly_rate3) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Tutor does not allow invitee'],
                    });
                }

                if (!tutor_detail.hourly_rate3 && payload.invitee?.length > 1) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Only 1 invitee is allowed.'],
                    });
                }

                if (payload.invitee?.length > 2) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Only 2 invitee are allowed at max.'],
                    });
                }

                for (let index = 0; index < payload.invitee.length; index++) {
                    const invitee = payload.invitee[index];
                    if (invitee.email) {
                        const student_detail = await this.bookingService.getUserByEmail(invitee.email);
                        if (student_detail) {
                            if (invitee.first_name != student_detail.first_name) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee First name does not matches'],
                                });
                            }

                            if (invitee.last_name != student_detail.last_name) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Last name does not matches'],
                                });
                            }

                            if (invitee.contact_number != student_detail.contact_number) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Contact Number does not matches'],
                                });
                            }

                            if (invitee.address != student_detail.address) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address does not matches'],
                                });
                            }

                            if (invitee.lat != student_detail.lat) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address does not matches'],
                                });
                            }

                            if (invitee.lng != student_detail.lng) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address does not matches'],
                                });
                            }
                        } else {
                            if (!invitee.first_name) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee First name is required'],
                                });
                            }

                            if (!invitee.last_name) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Last name is required'],
                                });
                            }

                            if (!invitee.contact_number) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Contact Number is required'],
                                });
                            }

                            if (!invitee.address) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address is required'],
                                });
                            }

                            if (!invitee.lat) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address is required'],
                                });
                            }

                            if (!invitee.lng) {
                                return res.status(HttpStatus.BAD_REQUEST).send({
                                    message: ['Invitee Address is required'],
                                });
                            }
                        }
                    } else {
                        return res.status(HttpStatus.BAD_REQUEST).send({
                            message: ['Invitee email is required'],
                        });
                    }
                }

                if (payload.invitee.length == 2) {
                    if (
                        payload.invitee[0].email == payload.invitee[1].email ||
                        payload.invitee[0].email == studentDetail.email ||
                        payload.invitee[1].email == studentDetail.email
                    ) {
                        return res.status(HttpStatus.BAD_REQUEST).send({
                            message: ['Duplicate Invitee.'],
                        });
                    }
                } else {
                    if (payload.invitee[0].email == studentDetail.email) {
                        return res.status(HttpStatus.BAD_REQUEST).send({
                            message: ['Duplicate Invitee.'],
                        });
                    }
                }
            }

            let hourly_rate = tutor_detail.hourly_rate;

            if (payload.invitee?.length > 0) {
                if (payload.invitee.length > 1) {
                    hourly_rate = tutor_detail.hourly_rate3;
                }

                if (payload.invitee.length == 1) {
                    hourly_rate = tutor_detail.hourly_rate2 ? tutor_detail.hourly_rate2 : tutor_detail.hourly_rate3;
                }
            }
            const total_price = hourly_rate * slots.length;
            if (total_price != payload.calculated_price) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: [`Total price mismatches, Price should be ${hourly_rate} * ${slots.length} = ${total_price}`],
                });
            }

            const bookingObj = {
                tutor_user_id: payload.tutor_id,
                student_user_id: req.user_id,
                booking_start_date: min_date,
                booking_end_date: max_date,
                hourly_rate: hourly_rate,
                total_amount: total_price,
                total_slots: slots.length,
                status: BookingStatusType.PENDING,
                mode: payload.mode,
                special_comments: payload.special_comments,
                address: payload.mode == BookingModes.ONLINE ? '' : payload.address,
                lat: payload.mode == BookingModes.ONLINE ? '' : payload.lat,
                lng: payload.mode == BookingModes.ONLINE ? '' : payload.lng,
            };

            const bookingDetail = await this.bookingService.addBooking(bookingObj);
            if (bookingDetail) {
                await this.emailService.sendEmail(
                    EmailTypes.BOOKING_ADDED,
                    payload.tutor_id,
                    bookingDetail.student_user_id,
                    bookingDetail.tutor_user_id,
                    '',
                    '',
                    '',
                );

                await this.notificationService.addNotification({
                    user_id: payload.tutor_id,
                    title: NotificationTitles.BOOKING_ADDED,
                    description: NotificationMessages.BOOKING_ADDED.replace(
                        '{student_name}',
                        studentDetail.first_name + ' ' + studentDetail.last_name,
                    ),
                    type: NotificationTypes.BOOKING_ADDED,
                });
                await this.badgeService.addBadgeToUser(payload.tutor_id);
                for (let index = 0; index < bookingSubject.length; index++) {
                    const subject = bookingSubject[index];
                    const bookingSubjectObj = {
                        subject_id: subject,
                        booking_id: bookingDetail.id,
                    };
                    await this.bookingService.addBookingSubject(bookingSubjectObj);
                }

                const bookingUserObj = {
                    booking_id: bookingDetail.id,
                    user_id: studentDetail.id,
                };
                await this.bookingService.addBookingUser(bookingUserObj);

                if (payload.invitee?.length > 0) {
                    for (let index = 0; index < payload.invitee.length; index++) {
                        const invitee = payload.invitee[index];
                        const student_detail = await this.bookingService.getUserByEmail(invitee.email);
                        if (student_detail) {
                            const bookingUserObj = {
                                booking_id: bookingDetail.id,
                                user_id: student_detail.id,
                            };
                            await this.bookingService.addBookingUser(bookingUserObj);
                            await this.notificationService.addNotification({
                                user_id: student_detail.id,
                                title: NotificationTitles.BOOKING_INVITATION,
                                description: NotificationMessages.BOOKING_INVITATION.replace(
                                    '{student_name}',
                                    studentDetail.first_name + ' ' + studentDetail.last_name,
                                ),
                                type: NotificationTypes.BOOKING_INVITATION,
                            });
                        } else {
                            const password = this.passwordService.generateRandomPassword();
                            const userObj = {
                                first_name: invitee.first_name,
                                last_name: invitee.last_name,
                                email: invitee.email,
                                contact_number: invitee.contact_number,
                                address: invitee.address,
                                lat: invitee.lat,
                                lng: invitee.lng,
                                password: await bcrypt.hash(password, 10),
                                user_type: UserType.STUDENT,
                                email_verified: true,
                                status: StatusType.ACTIVE,
                                is_force_password_reset: true,
                            };
                            const userDetail = await this.bookingService.createUser(userObj);
                            const bookingUserObj = {
                                booking_id: bookingDetail.id,
                                user_id: userDetail.id,
                            };
                            await this.bookingService.addBookingUser(bookingUserObj);
                            await this.emailService.sendEmail(
                                EmailTypes.BOOKING_INVITATION,
                                userDetail.id,
                                bookingDetail.student_user_id,
                                bookingDetail.tutor_user_id,
                                '',
                                password,
                                '',
                            );
                            // await this.bookingService.sendEmail(userDetail.email, studentDetail.first_name + ' ' + studentDetail.last_name, password);
                            await this.notificationService.addNotification({
                                user_id: userDetail.id,
                                title: NotificationTitles.BOOKING_INVITATION,
                                description: NotificationMessages.BOOKING_INVITATION.replace(
                                    '{student_name}',
                                    studentDetail.first_name + ' ' + studentDetail.last_name,
                                ),
                                type: NotificationTypes.BOOKING_INVITATION,
                            });
                        }
                    }
                }

                for (let index = 0; index < slotDetails.length; index++) {
                    const slotDetail = slotDetails[index];
                    slotDetail.booking_id = bookingDetail.id;
                    slotDetail.status = AvailabilityStatusType.BOOKED;
                    slotDetail.updated_at = new Date();
                    await this.bookingService.updateSchedule(slotDetail);
                }

                delete bookingDetail.id;
                delete bookingDetail.is_deleted;
                delete bookingDetail.created_at;
                delete bookingDetail.updated_at;
                delete bookingDetail.status;
                delete bookingDetail.tutor_user_id;
                delete bookingDetail.student_user_id;
                delete bookingDetail.hourly_rate;
                delete bookingDetail.hourly_rate;
                delete bookingDetail.total_amount;
                delete bookingDetail.total_slots;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Booking Added'],
                    data: { bookingDetail },
                });
            } else {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: ['Something went wrong, Please try again'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Booking can be only added by student'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Cancel a booking' })
    @Put('/:id')
    async cancelBooking(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        try {
            const bookingDetail = await this.bookingService.getBookingById(id);
            const tutor_detail = await this.bookingService.getUserById(req.user_id);
            if (bookingDetail.student_user_id == req.user_id || bookingDetail.tutor_user_id == req.user_id) {
                if (
                    bookingDetail.status != BookingStatusType.COMPLETED &&
                    bookingDetail.status != BookingStatusType.CANCELLED &&
                    bookingDetail.status != BookingStatusType.PAYMENT_COMPLETED &&
                    bookingDetail.status != BookingStatusType.ONGOING
                ) {
                    bookingDetail.status = BookingStatusType.CANCELLED;

                    await this.bookingService.updateBooking(bookingDetail);

                    const slots = await this.bookingService.getSlotsByBookingId(id);

                    for (let index = 0; index < slots.length; index++) {
                        const slot = slots[index];
                        slot.status = AvailabilityStatusType.OPEN;
                        slot.booking_id = null;
                        await this.bookingService.updateSchedule(slot);
                    }

                    const student_detail = await this.bookingService.getUserById(bookingDetail.student_user_id);
                    if (req.user_id != bookingDetail.tutor_user_id) {
                        await this.notificationService.addNotification({
                            user_id: bookingDetail.tutor_user_id,
                            title: NotificationTitles.BOOKING_CANCELLED_TUTOR,
                            description: NotificationMessages.BOOKING_CANCELLED_TUTOR.replaceAll('{student_name}', student_detail.first_name),
                            type: NotificationTypes.BOOKING_CANCELLED_TUTOR,
                        });
                    }
                    const bookingUsers = await this.bookingService.getBookingUserByBookingId(id);
                    if (bookingUsers.length > 0) {
                        for (let index = 0; index < bookingUsers.length; index++) {
                            const bookingUser = bookingUsers[index];
                            if (req.user_id == bookingDetail.tutor_user_id) {
                                await this.notificationService.addNotification({
                                    user_id: bookingUser.user_id,
                                    title: NotificationTitles.BOOKING_CANCELLED_STUDENT,
                                    description: NotificationMessages.BOOKING_CANCELLED_STUDENT.replaceAll('{tutor_name}', tutor_detail.first_name),
                                    type: NotificationTypes.BOOKING_CANCELLED_STUDENT,
                                });
                            }
                            // check for other booking of user with same tutor
                            const booking = await this.bookingService.getBookingFromStudentAndTutorId(
                                bookingUser.user_id,
                                bookingDetail.tutor_user_id,
                            );
                            if (booking.length == 0) {
                                this.chatService.closeConversation(bookingDetail.tutor_user_id, bookingUser.user_id);
                            }
                        }
                    }
                    return res.status(HttpStatus.OK).send({
                        message: ['Booking Cancelled'],
                    });
                } else {
                    return res.status(HttpStatus.OK).send({
                        message: ['Booking has been already started.'],
                        data: { bookingDetail },
                    });
                }
            } else {
                return res.status(HttpStatus.OK).send({
                    message: ['Only Tutor or Student who linked with booking can cancel booking'],
                    data: { bookingDetail },
                });
            }
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: [error],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Accept or Reject a booking' })
    @ApiBody({ type: UpdateBooking })
    @Put('tutor/:id')
    async acceptBooking(@Param('id') id: number, @Body() payload: UpdateBooking, @Req() req: any, @Res() res: Response) {
        const bookingDetail = await this.bookingService.getBookingById(id);
        const student_detail = await this.bookingService.getUserById(bookingDetail.student_user_id);
        const tutor_detail = await this.bookingService.getUserById(req.user_id);
        if (bookingDetail.tutor_user_id == req.user_id) {
            if (bookingDetail.status == BookingStatusType.PENDING) {
                bookingDetail.status =
                    payload.status == TutorBookingStatusType.ACCEPTED ? BookingStatusType.PAYMENT_PENDING : BookingStatusType.REJECTED;
                if (payload.status == TutorBookingStatusType.REJECTED) {
                    if (!payload.rejection_reason) {
                        return res.status(HttpStatus.FORBIDDEN).send({
                            message: ['Rejection Reason is required'],
                        });
                    } else {
                        bookingDetail.rejection_reason = payload.rejection_reason;
                    }
                }
                await this.bookingService.updateBooking(bookingDetail);
                if (payload.status == TutorBookingStatusType.REJECTED) {
                    const slots = await this.bookingService.getSlotsByBookingId(id);

                    for (let index = 0; index < slots.length; index++) {
                        const slot = slots[index];
                        slot.status = AvailabilityStatusType.OPEN;
                        slot.booking_id = null;
                        await this.bookingService.updateSchedule(slot);
                    }
                }

                await this.emailService.sendEmail(
                    payload.status == TutorBookingStatusType.REJECTED ? EmailTypes.BOOKING_REJECTED : EmailTypes.BOOKING_ACCEPTED,
                    bookingDetail.student_user_id,
                    bookingDetail.student_user_id,
                    bookingDetail.tutor_user_id,
                    '',
                    '',
                    '',
                );
                await this.notificationService.addNotification({
                    user_id: student_detail.id,
                    title:
                        payload.status == TutorBookingStatusType.REJECTED ? NotificationTitles.BOOKING_REJECTED : NotificationTitles.BOOKING_ACCEPTED,
                    description: (payload.status == TutorBookingStatusType.REJECTED
                        ? NotificationMessages.BOOKING_REJECTED
                        : NotificationMessages.BOOKING_ACCEPTED
                    ).replace('{tutor_name}', tutor_detail.first_name + ' ' + tutor_detail.last_name),
                    type: payload.status == TutorBookingStatusType.REJECTED ? NotificationTypes.BOOKING_REJECTED : NotificationTypes.BOOKING_ACCEPTED,
                });
                return res.status(HttpStatus.OK).send({
                    message: [`Booking ${payload.status == TutorBookingStatusType.ACCEPTED ? 'Accepted' : 'Cancelled'}`],
                });
            } else {
                return res.status(HttpStatus.OK).send({
                    message: ['Booking has been already started.'],
                    data: { bookingDetail },
                });
            }
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['Only Tutor or Student who linked with booking can cancel booking'],
                data: { bookingDetail },
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get a tutor students for booking' })
    @Get('students')
    async getTutorStudents(@Req() req: any, @Res() res: Response) {
        const tutorStudents = await this.bookingService.getTutorStudents(req.user_id);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Students'],
            data: { tutorStudents },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get bookings' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', type: String, example: 'john', description: 'search by tutor name or student name', required: false })
    @ApiQuery({ name: 'status', type: String, example: '1', description: 'booking status', required: false })
    @ApiQuery({ name: 'from_date', type: String, example: '25 Aug 2023', description: 'from date', required: false })
    @ApiQuery({ name: 'to_date', type: String, example: '25 Sep 2023', description: 'to date', required: false })
    @Get('')
    async getTutorBookings(@Req() req: any, @Query() query: any, @Res() res: Response) {
        if (query.from_date) {
            query.from_date = momentUTC(query.from_date);
        }
        if (query.to_date) {
            query.to_date = momentUTC(query.to_date);
            query.to_date = new Date(new Date(query.to_date).setHours(23, 59, 59));
        }
        const bookingDetail =
            req.user_type == UserType.TUTOR
                ? await this.bookingService.getTutorBookingsDetail(req.user_id, query)
                : await this.bookingService.getStudentBookingsDetail(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Booking Details'],
            data: { bookingDetail },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get bookings for calendar' })
    @ApiQuery({ name: 'search', type: String, example: 'john', description: 'search by tutor name or student name', required: false })
    @ApiQuery({ name: 'status', type: String, example: '1', description: 'booking status', required: false })
    @ApiQuery({ name: 'from date', type: String, example: '25 Aug 2023', description: 'from date', required: false })
    @ApiQuery({ name: 'to date', type: String, example: '25 Sep 2023', description: 'to date', required: false })
    @Get('calendar')
    async getBookingsForCalendar(@Req() req: any, @Query() query: any, @Res() res: Response) {
        if (query.from_date) {
            query.from_date = momentUTC(query.from_date);
        }
        if (query.to_date) {
            query.to_date = momentUTC(query.to_date);
            query.to_date = new Date(new Date(query.to_date).setHours(23, 59, 59));
        }
        const bookingDetail =
            req.user_type == UserType.TUTOR
                ? await this.bookingService.getTutorBookingsDetailForCalendar(req.user_id, query)
                : await this.bookingService.getStudentBookingsDetailForCalendar(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Booking Details'],
            data: { bookingDetail },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Open Tutor Availability Slot' })
    @ApiBody({ type: ScheduleDTO })
    @Post('schedule')
    async addSchedule(@Req() req: any, @Body() payload: ScheduleDTO, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            const start_date = momentUTC(payload.from_date);
            const end_date = momentUTC(payload.to_date);

            const start_time = momentUTC(payload.from_time);
            const end_time = momentUTC(payload.to_time);

            // if (new Date(start_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
            //     return res.status(HttpStatus.BAD_REQUEST).send({
            //         message: ['From date should be greater than or equal to current date.'],
            //     });
            // }

            // if (new Date(end_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
            //     return res.status(HttpStatus.BAD_REQUEST).send({
            //         message: ['To date should be greater than or equal to current date.'],
            //     });
            // }

            // if (new Date(start_date) > new Date(end_date)) {
            //     return res.status(HttpStatus.BAD_REQUEST).send({
            //         message: ['From date should be smaller than end date.'],
            //     });
            // }

            // if (new Date(start_time) > new Date(end_time)) {
            //     return res.status(HttpStatus.BAD_REQUEST).send({
            //         message: ['From time should be smaller than end time.'],
            //     });
            // }

            if (payload.week_day < 0) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Weekday cannot be smaller than 0'],
                });
            }

            if (payload.week_day > 7) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Weekday cannot be greater than 6'],
                });
            }
            const tSD = new Date(moment(start_date).tz(payload.timezone).format('DD-MMM-YYYY'));
            const tED = new Date(moment(end_date).tz(payload.timezone).format('DD-MMM-YYYY'));
            let scheduleDetail = await this.bookingService.getUserScheduleByWeekday(payload.week_day, req.user_id, tSD, tED);
            for (let index = 0; index < scheduleDetail.length; index++) {
                const schedule = scheduleDetail[index];
                if (!schedule.booking_id) {
                    schedule.is_deleted = true;
                    await this.bookingService.updateSchedule(schedule);
                }
            }
            const slots: any[] = [];

            const startHour = start_time.getUTCHours();
            const startMinute = start_time.getUTCMinutes();
            const endHour = end_time.getUTCHours();
            const endMinute = end_time.getUTCMinutes();

            const currentTime = new Date(momentUTC(start_date));
            const endTimeDate = new Date(momentUTC(end_date));
            currentTime.setUTCHours(startHour);
            currentTime.setUTCMinutes(startMinute);
            endTimeDate.setUTCHours(endHour);
            endTimeDate.setUTCMinutes(endMinute);
            let cDate = new Date(new Date(currentTime).setHours(0, 0, 0, 0));
            let eDate = new Date(new Date(endTimeDate).setHours(23, 59, 59, 0));
            while (new Date(cDate) <= new Date(eDate)) {
                cDate = new Date(new Date(currentTime).setHours(0, 0, 0, 0));
                eDate = new Date(new Date(endTimeDate).setHours(23, 59, 59, 0));
                const tempDate = moment(currentTime).tz(payload.timezone);
                console.log(tempDate.isoWeekday());
                if (tempDate.isoWeekday() === payload.week_day) {
                    const slotStart = new Date(momentUTC(currentTime));
                    slotStart.setUTCHours(startHour);
                    slotStart.setUTCMinutes(startMinute);

                    const slotEnd = new Date(momentUTC(currentTime));
                    slotEnd.setUTCHours(endHour);
                    slotEnd.setUTCMinutes(endMinute);
                    if (new Date(slotStart) > new Date(slotEnd)) {
                        slotEnd.setUTCDate(slotEnd.getUTCDate() + 1);
                        endTimeDate.setUTCDate(endTimeDate.getUTCDate() + 1);
                    }

                    while (new Date(slotStart) <= new Date(slotEnd)) {
                        const tempSlotStart = new Date(momentUTC(slotStart));
                        const tempSlotEnd = new Date(momentUTC(slotStart));
                        tempSlotEnd.setUTCMinutes(tempSlotEnd.getUTCMinutes() + 60);
                        if (new Date(tempSlotEnd) <= new Date(slotEnd)) {
                            const date = new Date(moment(slotStart).tz(payload.timezone).format('DD-MMM-YYYY'));
                            console.log(date);
                            slots.push({
                                from_time: tempSlotStart,
                                to_time: tempSlotEnd,
                                date: date,
                                week_day: payload.week_day,
                                user_id: req.user_id,
                            });
                        }
                        slotStart.setUTCMinutes(slotStart.getUTCMinutes() + 60);
                        slotStart.setUTCMinutes(slotStart.getUTCMinutes() + 30);
                    }
                }
                currentTime.setUTCDate(currentTime.getUTCDate() + 1);
            }

            for (let index = 0; index < slots.length; index++) {
                const slot = slots[index];
                const existingSchedule = await this.bookingService.getUserScheduleByTimeRange(
                    payload.week_day,
                    req.user_id,
                    new Date(momentUTC(slot.from_time)),
                    new Date(momentUTC(slot.to_time)),
                );
                if (!existingSchedule) {
                    await this.bookingService.addSchedule(slot);
                }
            }
            scheduleDetail = await this.bookingService.getUserScheduleByWeekday(payload.week_day, req.user_id, start_date, end_date);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Schedule Added'],
                data: { scheduleDetail },
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Schedule can be only added by tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Tutor Schedule' })
    @ApiBody({ type: GetScheduleDTO })
    @Post('schedules')
    async getSchedule(@Req() req: any, @Body() payload: GetScheduleDTO, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            payload.from_date = momentUTC(payload.from_date);
            payload.to_date = momentUTC(payload.to_date);
            const scheduleDetail = await this.bookingService.getUserScheduleByDate(payload.from_date, payload.to_date, req.user_id);
            // scheduleDetail = scheduleDetail.map((s: any) => {
            //     const tempDate = s.date.split('-');
            //     const tempFromTime = s.from_time.split(':');
            //     const tempToTime = s.to_time.split(':');
            //     const tDate = momentUTC(new Date());
            //     let fDate = momentUTC(new Date());
            //     s.from_time = new Date(
            //         new Date(tDate.setFullYear(tempDate[0], tempDate[1] - 1, tempDate[2])).setUTCHours(
            //             tempFromTime[0],
            //             tempFromTime[1],
            //             tempFromTime[2],
            //         ),
            //     );
            //     s.from_time = momentUTC(s.from_time);
            //     s.to_time = new Date(
            //         new Date(new Date(fDate).setFullYear(tempDate[0], tempDate[1] - 1, tempDate[2])).setUTCHours(
            //             tempToTime[0],
            //             tempToTime[1],
            //             tempToTime[2],
            //         ),
            //     );
            //     s.to_time = momentUTC(s.to_time);
            //     return s;
            // });
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Schedule details'],
                data: { scheduleDetail },
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Schedule can be only viewed by tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update Schedule' })
    @ApiBody({ type: UpdateScheduleDTO })
    @Put('schedule/:id')
    async updateSchedule(@Param('id') id: number, @Body() payload: UpdateScheduleDTO, @Req() req: any, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            const scheduleDetail = await this.bookingService.getUserScheduleById(id, req.user_id);

            if (scheduleDetail.booking_id) {
                return res.status(HttpStatus.FORBIDDEN).send({
                    message: ['Schedule cannot be update as it already booked'],
                });
            } else {
                scheduleDetail.status = payload.status;
                scheduleDetail.updated_at = momentUTC(new Date());
                await this.bookingService.updateSchedule(scheduleDetail);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Schedule Updated'],
                    data: { scheduleDetail },
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Schedule can be only updated by tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Schedule' })
    @Delete('schedule/:id')
    async deleteSchedule(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            const scheduleDetail = await this.bookingService.getUserScheduleById(id, req.user_id);

            if (scheduleDetail.booking_id) {
                return res.status(HttpStatus.FORBIDDEN).send({
                    message: ['Schedule cannot be update as it already booked'],
                });
            } else {
                scheduleDetail.is_deleted = true;
                scheduleDetail.updated_at = momentUTC(new Date());
                await this.bookingService.updateSchedule(scheduleDetail);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Schedule Deleted'],
                    data: { scheduleDetail },
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Schedule can be only deleted by tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Tutor Schedule for students' })
    @ApiBody({ type: GetScheduleDTO })
    @Post('schedule/user/:id')
    async getScheduleOfUser(@Param('id') id: number, @Req() req: any, @Body() payload: GetScheduleDTO, @Res() res: Response) {
        payload.from_date = momentUTC(payload.from_date);
        payload.to_date = momentUTC(payload.to_date);
        const scheduleDetail = await this.bookingService.getUserScheduleByDateForStudent(payload.from_date, payload.to_date, id);

        const result = scheduleDetail.reduce((result, slot) => {
            const existingEntry = result.find((entry) => entry.date === slot.date);

            if (existingEntry) {
                existingEntry.slots.push({
                    id: slot.id,
                    from_time: slot.from_time,
                    to_time: slot.to_time,
                });
            } else {
                result.push({
                    date: slot.date,
                    slots: [
                        {
                            id: slot.id,
                            from_time: slot.from_time,
                            to_time: slot.to_time,
                        },
                    ],
                });
            }

            return result;
        }, []);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Schedule details'],
            data: { result },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get a booking' })
    @Get('/:id')
    async getBookingById(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const bookingDetail = await this.bookingService.getBookingDetail(id);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Booking Details'],
            data: { bookingDetail },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get a invitee detail for booking' })
    @ApiBody({ type: VerifyInviteeDTO })
    @Post('verify-invitee')
    async getUserDetailByEmail(@Req() req: any, @Body() payload: VerifyInviteeDTO, @Res() res: Response) {
        const userDetail = await this.bookingService.getUserByEmail(payload.email);
        let user = {};
        if (userDetail) {
            user = {
                first_name: userDetail.first_name,
                last_name: userDetail.last_name,
                contact_number: userDetail.contact_number,
                email: userDetail.email,
                address: userDetail.address,
                lat: userDetail.lat,
                lng: userDetail.lng,
            };
        }

        return res.status(HttpStatus.OK).send({
            message: ['Success!, User Details'],
            data: { user },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get a tutor subjects for booking' })
    @Get('subjects/:id')
    async getTutorSubjects(@Param('id') id: number, @Res() res: Response) {
        const tutorSubjects = await this.bookingService.getTutorSubject(id);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Subjects'],
            data: { tutorSubjects },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get all booking of student related to particular tutor' })
    @Get('students/:id')
    async getTutorStudentBooking(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const student_bookings = await this.bookingService.getStudentsBookingFromTutorId(id, req.user_id);
        const bookingsWithValidBooking = student_bookings.filter((item) => item.booking !== null);

        const transformedBookings = bookingsWithValidBooking.map((item) => item.booking);

        return res.status(HttpStatus.OK).send({
            message: ['Success!, Bookings'],
            data: transformedBookings,
        });
    }
}
