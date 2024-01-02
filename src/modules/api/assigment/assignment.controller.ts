import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { AssignmentsDTO } from './dtos/assignment.dto';
import { Response, query } from 'express';
import { BookingService } from '../booking/booking.service';
import { ASSIGNMENT_FILE_BASE_PATH, AssignmentStatusType, BookingStatusType, MEDIA_FILE_BASE_PATH, UserType } from 'src/utils/constant';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { PaginationOptions } from '../../../utils/constant';
import { AssignmentSubmissionDTO } from './dtos/assignment-submission.dto';
import { AssignmentCompletionDTO } from './dtos/assingment-completion.dto';
import { momentUTC } from 'src/helper/date';
import { NotificationService } from '../notification/notification.service';
import { NotificationTitles, NotificationMessages, NotificationTypes, EmailTypes } from 'src/utils/notifications';
import { EmailService } from '../email/email.service';

@ApiTags('assignment')
@ApiBearerAuth('access-token')
@Controller('assignment')
export class AssignmentController {
    constructor(
        private assignmentService: AssignmentService,
        private bookingService: BookingService,
        private s3Service: S3Service,
        private configService: ConfigService,
        private notificationService: NotificationService,
        private emailService: EmailService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Assignment' })
    @ApiBody({ type: AssignmentsDTO })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post('')
    async addAssignment(@Req() req: any, @Body() payload: AssignmentsDTO, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        let bookingDetail: any = await this.bookingService.getBookingByIdForAssignment(payload.booking_id, req.user_id, payload.student_user_id);
        const tutor_detail = await this.bookingService.getUserById(req.user_id);
        payload.target_completion_date = momentUTC(payload.target_completion_date as any);
        bookingDetail = bookingDetail.booking;
        if (bookingDetail) {
            if (bookingDetail.status == BookingStatusType.ONGOING) {
                const assignmentObj: any = {
                    title: payload.title,
                    description: payload.description,
                    tutor_user_id: req.user_id,
                    student_user_id: payload.student_user_id,
                    booking_id: payload.booking_id,
                    target_completion_date: payload.target_completion_date,
                };

                if (file) {
                    assignmentObj['media_type'] = file.mimetype;
                }

                const assignmentDetail = await this.assignmentService.addAssignment(assignmentObj);
                await this.notificationService.addNotification({
                    user_id: payload.student_user_id,
                    title: NotificationTitles.ASSIGNMENT_ADDED,
                    description: NotificationMessages.ASSIGNMENT_ADDED.replace(
                        '{tutor_name}',
                        tutor_detail.first_name + ' ' + tutor_detail.last_name,
                    ),
                    type: NotificationTypes.ASSIGNMENT_ADDED,
                });
                await this.emailService.sendEmail(
                    EmailTypes.ASSIGNMENT_ADDED,
                    payload.student_user_id,
                    payload.student_user_id,
                    tutor_detail.id,
                    '',
                    '',
                    '',
                );
                if (assignmentDetail && file) {
                    const timestamp = Date.now();
                    const basePath = ASSIGNMENT_FILE_BASE_PATH + timestamp + assignmentDetail.id;
                    const fileUpload = await this.s3Service.uploadFile(file.buffer, basePath, file.mimetype);

                    if (fileUpload) {
                        assignmentDetail.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                        await this.assignmentService.updateAssignment(assignmentDetail);
                    }
                }

                delete assignmentDetail.updated_at;
                delete assignmentDetail.created_at;
                delete assignmentDetail.is_deleted;
                delete assignmentDetail.id;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Assignment Added'],
                    data: assignmentDetail,
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Booking is not active'],
                });
            }
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Booking does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Edit Assignment' })
    @ApiBody({ type: AssignmentsDTO })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Put('/:id')
    async editAssignment(
        @Param('id') id: number,
        @Req() req: any,
        @Body() payload: AssignmentsDTO,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const assignmentDetail = await this.assignmentService.getAssignmentByIdAndUserId(id, req.user_id);
        if (assignmentDetail.status != AssignmentStatusType.COMPLETED && assignmentDetail.status != AssignmentStatusType.CANCELLED) {
            payload.target_completion_date = momentUTC(payload.target_completion_date as any);
            if (payload.target_completion_date > new Date()) {
                const assignmentObj = {
                    ...assignmentDetail,
                    ...payload,
                };
                if (file) {
                    assignmentObj['media_type'] = file.mimetype;
                }

                if (assignmentDetail && file) {
                    const timestamp = Date.now();
                    const basePath = ASSIGNMENT_FILE_BASE_PATH + timestamp + assignmentDetail.id;
                    const fileUpload = await this.s3Service.uploadFile(file.buffer, basePath, file.mimetype);

                    if (fileUpload) {
                        assignmentObj.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                    }
                }

                await this.assignmentService.updateAssignment(assignmentObj);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Assignment Updated'],
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Target completion date cannot be less than today.'],
                });
            }
        } else {
            if (assignmentDetail.status == AssignmentStatusType.COMPLETED || assignmentDetail.status == AssignmentStatusType.CANCELLED) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Assignment has been completed or cancelled.'],
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Assignment does not exist.'],
                });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Assignment' })
    @Delete('/:id')
    async deleteAssignment(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const assignmentDetail = await this.assignmentService.getAssignmentByIdAndUserId(id, req.user_id);
        if (assignmentDetail) {
            assignmentDetail.is_deleted = true;
            await this.assignmentService.updateAssignment(assignmentDetail);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Assignment Deleted'],
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Assignment does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Submission' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: AssignmentSubmissionDTO })
    @Post('submission/:id')
    @UseInterceptors(FileInterceptor('image'))
    async addSubmission(
        @Param('id') id: number,
        @Body() payload: AssignmentSubmissionDTO,
        @Req() req: any,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const assignmentDetail = await this.assignmentService.getAssignmentByIdAndStudentId(id, req.user_id);
            const student_detail = await this.bookingService.getUserById(req.user_id);
            if (assignmentDetail.status != AssignmentStatusType.COMPLETED && assignmentDetail.status != AssignmentStatusType.CANCELLED) {
                const assignmentSubmissionObj = {
                    description: payload.description,
                    student_user_id: req.user_id,
                    assignment_id: id,
                };
                const assignmentSubmissionDetail = await this.assignmentService.addAssignmentSubmission(assignmentSubmissionObj);
                await this.notificationService.addNotification({
                    user_id: assignmentDetail.tutor_user_id,
                    title: NotificationTitles.SUBMISSION_ADDED,
                    description: NotificationMessages.SUBMISSION_ADDED.replace(
                        '{student_name}',
                        student_detail.first_name + ' ' + student_detail.last_name,
                    ),
                    type: NotificationTypes.SUBMISSION_ADDED,
                });
                await this.emailService.sendEmail(
                    EmailTypes.SUBMISSION_ADDED,
                    assignmentDetail.tutor_user_id,
                    assignmentDetail.student_user_id,
                    assignmentDetail.tutor_user_id,
                    '',
                    '',
                    '',
                );
                if (file) {
                    const basePath = MEDIA_FILE_BASE_PATH + assignmentSubmissionDetail.id;
                    const fileUpload = await this.s3Service.uploadFile(file.buffer, basePath, file.mimetype);
                    assignmentSubmissionDetail['media_type'] = file.mimetype;
                    if (fileUpload) {
                        assignmentSubmissionDetail.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                        await this.assignmentService.updateAssignmentSubmission(assignmentSubmissionDetail);
                        return res.status(HttpStatus.OK).send({
                            message: ['Success!, Submission added'],
                        });
                    } else {
                        return res.status(HttpStatus.OK).send({
                            message: ['Success!, Submission added'],
                        });
                    }
                }
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Submission added'],
                });
            } else {
                if (assignmentDetail.status == AssignmentStatusType.COMPLETED || assignmentDetail.status == AssignmentStatusType.CANCELLED) {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Assignment has been completed or cancelled.'],
                    });
                } else {
                    return res.status(HttpStatus.BAD_REQUEST).send({
                        message: ['Assignment does not exist.'],
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Assignment Submission' })
    @Delete('submission/:id')
    async deleteAssignmentSubmission(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const assignmentSubmissionDetail = await this.assignmentService.getAssignmentSubmissionByIdAndUserId(id, req.user_id);
        const assignmentDetail = await this.assignmentService.getAssignmentByIdAndStudentId(assignmentSubmissionDetail.assignment_id, req.user_id);
        if (assignmentDetail.status != AssignmentStatusType.COMPLETED && assignmentDetail.status != AssignmentStatusType.CANCELLED) {
            assignmentSubmissionDetail.is_deleted = true;
            await this.assignmentService.updateAssignmentSubmission(assignmentSubmissionDetail);
            await this.s3Service.removeFile(assignmentSubmissionDetail.media);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Assignment Submission Deleted'],
            });
        } else {
            if (assignmentDetail.status == AssignmentStatusType.COMPLETED || assignmentDetail.status == AssignmentStatusType.CANCELLED) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Assignment has been completed or cancelled.'],
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Assignment Submission does not exist.'],
                });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Assignment Detail' })
    @Get('/:id')
    async getAssignmentDetail(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const assignmentDetail =
            req.user_type === UserType.STUDENT
                ? await this.assignmentService.getAssignmentDetailForStudent(id, req.user_id)
                : await this.assignmentService.getAssignmentDetailForTutor(id, req.user_id);
        if (assignmentDetail) {
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Assignment Detail'],
                data: assignmentDetail,
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Assignment does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Assignment' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @Get('')
    async getAssignments(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        const assignments =
            req.user_type === UserType.STUDENT
                ? await this.assignmentService.getAssignmentsForStudent(req.user_id, query)
                : await this.assignmentService.getAssignmentsForTutor(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Assignments'],
            data: assignments,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Mark Assignment Complete' })
    @Put('complete/:id')
    @ApiBody({ type: AssignmentCompletionDTO })
    async completeAssignment(@Param('id') id: number, @Body() payload: AssignmentCompletionDTO, @Req() req: any, @Res() res: Response) {
        const assignmentDetail = await this.assignmentService.getAssignmentByIdAndUserId(id, req.user_id);
        if (assignmentDetail) {
            assignmentDetail.actual_completion_date = new Date();
            assignmentDetail.tutor_review = payload.tutor_review;
            assignmentDetail.status = AssignmentStatusType.COMPLETED;
            await this.assignmentService.updateAssignment(assignmentDetail);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Assignment Mark as completed'],
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Assignment does not exist'],
            });
        }
    }
}
