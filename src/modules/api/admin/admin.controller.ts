import { Body, Controller, Get, HttpStatus, Param, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { RequestStatusType, UserType } from 'src/utils/constant';
import { Response } from 'express';
import { UpdateApprovalRequestDTO } from './dtos/update-approval-request.dto';
import { UserService } from '../user/user.service';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { PaginationOptions } from '../../../utils/constant';
import { NotificationService } from '../notification/notification.service';
import { NotificationTitles, NotificationMessages, NotificationTypes } from 'src/utils/notifications';
@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService, private userService: UserService, private notificationService: NotificationService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All Pending Approval requests' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('approval-request')
    async getAllPendingApprovalRequests(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        if (req.user_type == UserType.ADMIN) {
            const tutorSubjectDetails = await this.adminService.getAllPendingApprovalRequest(query);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Approval Requests'],
                data: tutorSubjectDetails,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Approval Requests can only be viewed by admin'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiBody({ type: UpdateApprovalRequestDTO })
    @ApiOperation({ summary: 'Update Approval requests' })
    @Put('approval-request/:id')
    async updateApprovalRequest(@Param('id') id: number, @Body() payload: UpdateApprovalRequestDTO, @Req() req: any, @Res() res: Response) {
        if (req.user_type == UserType.ADMIN) {
            const tutorApprovalRequestDetail = await this.adminService.getApprovalRequestById(id);
            if (payload.status != RequestStatusType.ACCEPTED && payload.status != RequestStatusType.REJECTED) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Status is required.'],
                });
            }

            if (!payload.remarks) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Remarks is required.'],
                });
            }

            if (tutorApprovalRequestDetail) {
                tutorApprovalRequestDetail.updated_at = new Date();
                tutorApprovalRequestDetail.remarks = payload.remarks;
                tutorApprovalRequestDetail.status = payload.status;
                await this.adminService.updateApprovalRequest(tutorApprovalRequestDetail);
                const user = await this.userService.getUserById(tutorApprovalRequestDetail.user_id);

                // update user
                if (payload.status == RequestStatusType.ACCEPTED) {
                    user.is_approved = true;
                }
                await this.notificationService.addNotification({
                    user_id: tutorApprovalRequestDetail.user_id,
                    title: payload.status == RequestStatusType.ACCEPTED ? NotificationTitles.PROFILE_APPROVED : NotificationTitles.PROFILE_REJECTED,
                    description:
                        payload.status == RequestStatusType.ACCEPTED ? NotificationMessages.PROFILE_APPROVED : NotificationMessages.PROFILE_REJECTED,
                    type: payload.status == RequestStatusType.ACCEPTED ? NotificationTypes.PROFILE_APPROVED : NotificationTypes.PROFILE_REJECTED,
                });
                user.remarks = payload.remarks;
                user.updated_at = new Date();
                await this.userService.updateUser(user);
                // send email

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Approval Updated'],
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Approval Requests does not exist'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['Approval Requests can only be updated by admin'],
            });
        }
    }

    // get tutor list
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All Tutor List' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('tutor')
    async getAllTutors(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        if (req.user_type == UserType.ADMIN) {
            const tutors = await this.adminService.getTutorAllTutors(query);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Tutors'],
                data: tutors,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['All Tutors can only be viewed by admin'],
            });
        }
    }

    // get student list
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All Student List' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('student')
    async getAllStudents(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        if (req.user_type == UserType.ADMIN) {
            const students = await this.adminService.getTutorAllStudents(query);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Students'],
                data: students,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['All Students can only be viewed by admin'],
            });
        }
    }

    //update user
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Mark User as active or inactive' })
    @ApiBody({ type: UpdateUserDTO })
    @Put('user/:id')
    async updatePersonalDetails(@Param('id') id: number, @Body() payload: UpdateUserDTO, @Res() res: Response) {
        const user: any = await this.userService.getUserById(id);
        if (user) {
            user.status = payload.status;
            user.remarks = payload.remarks;

            //send email
            await this.userService.updateUser(user);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, User Updated'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }
}
