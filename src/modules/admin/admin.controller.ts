import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Render, Req, Res, UseGuards } from '@nestjs/common';
import e, { Request, Response } from 'express';
import { UserService } from '../api/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RequestStatusType, UserType, jwtSecret } from 'src/utils/constant';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AuthService } from '../api/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDTO } from '../api/auth/dtos/change-password.dto';
import { UpdatePasswordDTO } from '../api/auth/dtos/update-password.dto';
import { TransactionService } from '../api/transaction/transaction.service';
import { momentUTC, stringToDate } from 'src/helper/date';
import { EmailService } from '../api/email/email.service';
import { EmailTemplateDTO } from '../api/email/dtos/email-template.dto';
import { SmsService } from '../api/sms/sms.service';
import { SmsTemplateDTO } from '../api/sms/dtos/sms-template.dto';
import { FeedbackService } from '../api/feedback/feedback.service';
import { BookingService } from '../api/booking/booking.service';
import { CategoryService } from '../api/category/category.service';
import { SubjectService } from '../api/subject/subject.service';
import { ReviewService } from '../api/review/review.service';
import { UpdateApprovalRequestDTO } from '../api/admin/dtos/update-approval-request.dto';
import { NotificationTitles, NotificationMessages, NotificationTypes, EmailTypes } from 'src/utils/notifications';
import { NotificationService } from '../api/notification/notification.service';
import { UpdateRoleDTO } from '../api/admin/dtos/update-role.dto';
import * as moment from 'moment-timezone';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private jwtService: JwtService,
        private adminService: AdminService,
        private configService: ConfigService,
        private transactionService: TransactionService,
        private emailService: EmailService,
        private smsService: SmsService,
        private feedbackService: FeedbackService,
        private bookingService: BookingService,
        private categoryService: CategoryService,
        private subjectService: SubjectService,
        private reviewService: ReviewService,
        private notificationService: NotificationService,
    ) { }
    @Get('')
    @Render('login')
    async get() {
        return { message: 'Welcome' };
    }

    @Post('login')
    async postLogin(@Req() req: Request, @Res() res: Response) {
        const { email, password } = req.body;
        try {
            const user = await this.userService.getUserByEmail(email);
            if (user && user.user_type === UserType.ADMIN && user.is_deleted == false) {
                const validPassword = await bcrypt.compare(password, user.password);
                if (validPassword) {
                    const payload = { username: user.email, id: user.id, type: user.user_type };
                    const access_token = await this.jwtService.signAsync(payload);

                    delete user.password;
                    res.cookie('access_token', access_token, {
                        httpOnly: true,
                    });
                    return res.status(HttpStatus.CREATED).send({
                        status: true,
                        message: ['Success!, Password changed'],
                    });
                } else {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['Invalid Credentials'],
                    });
                }
            } else {
                return res.status(HttpStatus.FORBIDDEN).json({
                    status: false,
                    message: ['Invalid Credentials'],
                });
            }
        } catch (e) {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['Invalid Credentials'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('user-detail')
    async getUserDetails(@Req() req: any, @Res() res: Response) {
        const user: any = await this.userService.getUserByEmailWithRole(req.username);
        if (user) {
            delete user.password;
            delete user.created_at;
            delete user.updated_at;
            const role = await this.adminService.getRoleById(user.user_permission[0]?.role_id);
            const role_permissions = await this.adminService.getRolePermissionByRoleId(role?.id);

            const modules = await this.adminService.getAllModules();
            const permissions = await this.adminService.getAllPermission();
            for (let index = 0; index < modules.length; index++) {
                const module = modules[index];
                module['permissions'] = [];
                for (let index2 = 0; index2 < permissions.length; index2++) {
                    const permission = permissions[index2];
                    let isAllowed = false;
                    for (let index3 = 0; index3 < role_permissions.length; index3++) {
                        const role_permission = role_permissions[index3];
                        if (
                            (role_permission.module_id == module.id && role_permission.permission_id == permission.id) ||
                            user.is_super_admin == true
                        ) {
                            isAllowed = true;
                        }
                    }
                    module['permissions'].push({
                        ...permission,
                        isSelected: user.is_super_admin ? true : isAllowed,
                    });
                }
            }
            return res.status(HttpStatus.OK).send({
                user: user,
                role: role,
                modules: modules,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: 'No user registered with this Email',
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('profile')
    @Render('profile')
    async getProfile(@Req() req: any, @Res() res: Response) {
        const user: any = await this.userService.getUserByEmail(req.username);
        // const userPermission = await this.userService.getR
        delete user.password;
        delete user.created_at;
        delete user.updated_at;
        return { data: { user: user } };
    }

    @Get('logout')
    logout(@Res() response: Response) {
        response.clearCookie('access_token');
        return response.redirect('');
    }

    @UseGuards(AdminGuard)
    @Get('dashboard')
    @Render('dashboard')
    async dashboard(@Req() request: any) {
        const dashboardData = await this.adminService.getDashboardData();
        return { data: dashboardData };
    }

    @UseGuards(AdminGuard)
    @Get('change-password')
    @Render('change-password')
    async changePasswords(@Req() request: any) {
        console.log('change password');
    }

    @Get('forgot-password')
    @Render('forgot-password')
    forgotPassword() {
        console.log('Forgot Password');
    }

    @Post('forgot-password')
    async postForgotPassword(@Req() req: Request, @Res() res: Response) {
        const { email } = req.body;
        try {
            const user = await this.userService.getUserByEmail(email);
            if (user && user.user_type === UserType.ADMIN) {
                const payload = { sub: user.email };
                const token = await this.jwtService.signAsync(payload, { expiresIn: '5m' });
                const resetLink = `${this.configService.get<string>('ADMIN_URL')}/reset-password/${token}`;
                const content =
                    '<!DOCTYPE html>' +
                    '<html>' +
                    '<head>' +
                    '<title>Password Reset</title>' +
                    '</head>' +
                    '<body>' +
                    '<p> Hello, </p>' +
                    '<p>' +
                    'You have requested to reset your password. Click the link below to reset your password:' +
                    '</p>' +
                    '<p>' +
                    '<a href="' +
                    resetLink +
                    '"> Reset Link </a>' +
                    '</p>' +
                    '<p>  If you did not request to reset your password, you can safely ignore this email. </p>' +
                    '<p>' +
                    'Regards,' +
                    'Tutor' +
                    '</p>' +
                    '</body>' +
                    '</html>';
                user.is_password_reset_requested = true;
                await this.authService.updateUser(user);
                this.authService.sendEmail(user.email, 'Reset Password', content);
                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Reset Password email sent to registered email'],
                });
            } else {
                return res.status(HttpStatus.FORBIDDEN).json({
                    status: false,
                    message: ['Invalid Email'],
                });
            }
        } catch (e) {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['Invalid Email'],
            });
        }
    }

    @Get('reset-password/:id')
    @Render('reset-password')
    resetPassword() {
        console.log('reset Password');
    }

    @Post('verify-forgot-password/:token')
    async verifyForgotPassword(@Param('token') token: string, @Res() res: Response) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: jwtSecret,
        });
        const email = payload.sub;
        const user: any = await this.authService.getUserByEmail(email);
        if (user && user.is_password_reset_requested) {
            const payload = { username: user.email, id: user.id, type: user.user_type };
            const access_token = await this.jwtService.signAsync(payload);
            res.cookie('access_token', access_token, {
                httpOnly: true,
            });
            return res.status(HttpStatus.OK).send({
                status: true,
                message: ['Success!, Token verified'],
                data: {
                    access_token: access_token,
                },
            });
        } else {
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['No user registered with this Email'],
                });
            } else if (!user?.is_password_reset_requested) {
                return res.status(HttpStatus.CONFLICT).json({
                    status: false,
                    message: ['Link expired'],
                });
            } else {
                return res.status(HttpStatus.CONFLICT).json({
                    status: false,
                    message: ['Link expired'],
                });
            }
        }
    }

    @UseGuards(AdminGuard)
    @Post('change-password')
    async changePassword(@Req() req: any, @Res() res: Response, @Body() payload: ChangePasswordDTO) {
        const user = await this.authService.getUserByEmail(req.username);
        if (user) {
            payload['password'] = await bcrypt.hash(payload['password'], 10);
            user.password = payload.password;
            user.updated_at = new Date();
            user.is_force_password_reset = false;
            user.is_password_reset_requested = false;
            await this.authService.updateUser(user);
            const content =
                '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<title>Password Reset</title>' +
                '</head>' +
                '<body>' +
                '<p> Hello, </p>' +
                '<p>' +
                'Your password has been changed.' +
                '</p>' +
                'Regards,' +
                'Tutor Team' +
                '</p>' +
                '</body>' +
                '</html>';

            this.authService.sendEmail(user.email, 'Password Changed', content);
            return res.status(HttpStatus.CREATED).send({
                message: ['Success!, Password changed'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Post('update-password')
    async updatePassword(@Req() req: any, @Res() res: Response, @Body() payload: UpdatePasswordDTO) {
        const user = await this.authService.getUserByEmail(req.username);
        if (user) {
            const validPassword = await bcrypt.compare(payload.old_password, user.password);
            if (validPassword) {
                if (payload.old_password == payload.password) {
                    return res.status(HttpStatus.CONFLICT).send({
                        status: false,
                        message: ['Old and new password cannot be same.'],
                    });
                } else {
                    payload['password'] = await bcrypt.hash(payload['password'], 10);
                    user.password = payload.password;
                    user.updated_at = new Date();
                    user.is_force_password_reset = false;
                    user.is_password_reset_requested = false;
                    await this.authService.updateUser(user);
                    return res.status(HttpStatus.CREATED).send({
                        status: true,
                        message: ['Success!, Password changed'],
                    });
                }
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Old Password does not match'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('txns')
    async getEarnings(@Req() req: any, @Query() query: any, @Res() res: Response) {
        if (query.from_date) {
            query.from_date = stringToDate(query.from_date);
        }
        if (query.to_date) {
            query.to_date = stringToDate(query.to_date);
            query.to_date = new Date(new Date(query.to_date).setHours(23, 59, 59));
        }
        const earnings = await this.transactionService.getEarningsForAdmin(query.from_date, query.to_date);
        return res.status(HttpStatus.OK).send({
            data: earnings,
        });
    }

    @UseGuards(AdminGuard)
    @Get('email-templates')
    @Render('email-templates')
    async emailTemplates(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Email Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const emailTemplates = await this.emailService.getAllEmails();
        return { data: emailTemplates, isEditPermission: isEditPermission };
    }

    @UseGuards(AdminGuard)
    @Get('email-template/:id')
    @Render('email-template')
    async emailTemplate(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Email Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const emailTemplate = await this.emailService.getEmailById(id);
        return { data: emailTemplate };
    }

    @UseGuards(AdminGuard)
    @Post('email-template/:id')
    async updateEmailTemplate(@Param('id') id: string, @Body() payload: EmailTemplateDTO, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Email Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const emailTemplate = await this.emailService.getEmailById(id);
        if (emailTemplate) {
            emailTemplate.format = payload.format;
            emailTemplate.subject = payload.subject;
            await this.emailService.updateEmailTemplate(emailTemplate);
            return res.status(HttpStatus.OK).json({
                status: true,
                message: ['Email Template Updated.'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No Email template found'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('sms-templates')
    @Render('sms-templates')
    async smsTemplates(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'SMS Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const smsTemplates = await this.smsService.getAllSms();
        return { data: smsTemplates };
    }

    @UseGuards(AdminGuard)
    @Get('sms-template/:id')
    @Render('sms-template')
    async smsTemplate(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'SMS Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const smsTemplate = await this.smsService.getSmsById(id);
        return { data: smsTemplate };
    }

    @UseGuards(AdminGuard)
    @Post('sms-template/:id')
    async updateSMSTemplate(@Param('id') id: string, @Body() payload: SmsTemplateDTO, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'SMS Template');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const smsTemplate = await this.smsService.getSmsById(id);
        if (smsTemplate) {
            smsTemplate.format = payload.format;
            await this.smsService.updateSmsTemplate(smsTemplate);
            return res.status(HttpStatus.OK).json({
                status: true,
                message: ['SMS Template Updated.'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No SMS template found'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('feedbacks')
    @Render('feedbacks')
    async feedbacks(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Help & Support');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const feedbacks = await this.feedbackService.getAllFeedbacks();
        return { data: feedbacks };
    }

    @UseGuards(AdminGuard)
    @Get('transactions')
    @Render('transactions')
    async transactions(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Transaction');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const transactions = await this.transactionService.getAllTransactionsForAdmin();
        console.log(transactions);
        return { data: transactions, isAddPermission: isAddPermission, isEditPermission: isEditPermission };
    }

    @UseGuards(AdminGuard)
    @Get('transaction/:id')
    @Render('transaction-detail')
    async transaction_detail(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Transaction');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const transactions = await this.bookingService.getBookingDetail(id);
        return { data: transactions[0], moment: moment };
    }

    @UseGuards(AdminGuard)
    @Post('pay')
    async markSlotAsPaid(@Param('id') id: number, @Body() payload: any, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Transaction');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        if (payload.slots.length > 0) {
            for (let index = 0; index < payload.slots.length; index++) {
                const slot = payload.slots[index];
                this.bookingService.markSlotAsPaid(slot);
            }
            return res.status(HttpStatus.CREATED).send({
                status: true,
                message: ['Success!, Slots marked as paid'],
            });
        } else {
            return res.status(HttpStatus.CREATED).send({
                status: false,
                message: ['No Slots, Please select slots to pay'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('categories')
    @Render('categories')
    async categories(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Categories');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const categories = await this.categoryService.getAllCategories();
        return { data: categories, isEditPermission: isEditPermission, isAddPermission: isAddPermission };
    }

    @UseGuards(AdminGuard)
    @Get('category/:id')
    @Render('category')
    async category(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Categories');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const category = await this.categoryService.getCategoryById(id);
        return { data: category };
    }

    @UseGuards(AdminGuard)
    @Get('category')
    @Render('category')
    async addCategory(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Categories');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isAddPermission) {
            res.redirect('/admin/dashboard');
        }
        return { data: {} };
    }

    @UseGuards(AdminGuard)
    @Get('subjects')
    @Render('subjects')
    async subjects(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Subjects');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const subjects = await this.subjectService.getAllSubjectsForAdmin();
        return { data: subjects, isEditPermission: isEditPermission, isAddPermission: isAddPermission };
    }

    @UseGuards(AdminGuard)
    @Get('subject/:id')
    @Render('subject')
    async subject(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Subjects');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const subject = await this.subjectService.getSubjectForAdmin(id);
        const categories = await this.categoryService.getAllCategories();
        return {
            data: {
                subject: subject,
                categories: categories,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('subject')
    @Render('subject')
    async addSubject(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Subjects');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isAddPermission) {
            res.redirect('/admin/dashboard');
        }
        const categories = await this.categoryService.getAllCategories();
        return {
            data: {
                subject: {},
                categories: categories,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('tutors')
    @Render('tutors')
    async tutors(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const tutor = await this.userService.getTutorListForAdmin();
        return { data: tutor, isEditPermission: isEditPermission };
    }

    @UseGuards(AdminGuard)
    @Get('tutor/:id')
    @Render('tutor')
    async tutor(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const tutor = await this.userService.getTutorDetailByIdForAdmin(id);
        const tutor_subjects = await this.userService.getAllTutorSubjectsWithoutCategory(id);
        const tutor_education = await this.userService.getAllEducationOfUser(id);
        const tutor_media = await this.userService.getAllMediaOfUser(id);
        const tutor_reviews = await this.reviewService.getAllReviewsForTutorAdmin(id);
        const tutor_bookings = await this.bookingService.getTutorBookingsForAdmin(id);
        let result = [];
        if (tutor_subjects) {
            const groupedSubjects = tutor_subjects.reduce((groups, subject) => {
                const categoryId = subject.subject_category.id;
                if (!groups[categoryId]) {
                    groups[categoryId] = {
                        category_id: categoryId,
                        category_name: subject.subject_category.category_name,
                        subject: [],
                    };
                }
                groups[categoryId].subject.push({
                    id: subject.subject.id,
                    subject_name: subject.subject.subject_name,
                });
                return groups;
            }, {});

            result = Object.values(groupedSubjects);
        }
        return {
            data: {
                tutor: tutor,
                tutor_subjects: result,
                tutor_education: tutor_education,
                tutor_media: tutor_media,
                tutor_reviews: tutor_reviews,
                tutor_bookings: tutor_bookings,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('booking-slots/:id')
    @Render('booking-slots')
    async bookingSlots(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const transactions = await this.bookingService.getBookingDetail(id);
        return { data: transactions[0], moment: moment };
    }

    @UseGuards(AdminGuard)
    @Get('students')
    @Render('students')
    async students(@Req() req: any, @Res() res: Response) {
        const studentPermission = await this.adminService.checkForPermission(req.username, 'Student');
        let isViewPermission = false;
        let isEditPermission = false;
        for (let index = 0; index < studentPermission['permissions'].length; index++) {
            const element = studentPermission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }

        const student = await this.userService.getStudentListForAdmin();
        return { data: student, isEditPermission: isEditPermission };
    }

    @UseGuards(AdminGuard)
    @Get('student/:id')
    @Render('student')
    async student(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const studentPermission = await this.adminService.checkForPermission(req.username, 'Student');
        let isViewPermission = false;
        for (let index = 0; index < studentPermission['permissions'].length; index++) {
            const element = studentPermission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }

        const student = await this.userService.getStudentDetailByIdForAdmin(id);

        const student_booking = await this.bookingService.getStudentBookingsForAdmin(id);
        return {
            data: {
                student: student,
                student_booking: student_booking,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('booking-slots-student/:id')
    @Render('booking-slots-student')
    async bookingSlotsStudent(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const studentPermission = await this.adminService.checkForPermission(req.username, 'Student');
        let isViewPermission = false;
        for (let index = 0; index < studentPermission['permissions'].length; index++) {
            const element = studentPermission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const transactions = await this.bookingService.getBookingDetail(id);
        return { data: transactions[0], moment: moment };
    }

    @UseGuards(AdminGuard)
    @Get('tutor-approvals')
    @Render('tutor-approvals')
    async tutorApprovals(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor Approvals');
        let isViewPermission = false;
        let isEditPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const tutorApprovals = await this.adminService.getAllPendingApprovalRequest();
        return { data: tutorApprovals, isEditPermission: isEditPermission };
    }

    @UseGuards(AdminGuard)
    @Get('tutor-approval/:id')
    @Render('tutor-approval')
    async tutorApproval(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor Approvals');
        let isViewPermission = false;
        let isEditPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }

        const tutor = await this.userService.getTutorDetailByIdForAdmin(id);
        const tutor_subjects = await this.userService.getAllTutorSubjectsWithoutCategory(id);
        const tutor_education = await this.userService.getAllEducationOfUser(id);
        const tutor_media = await this.userService.getAllMediaOfUser(id);
        let result = [];
        if (tutor_subjects) {
            const groupedSubjects = tutor_subjects.reduce((groups, subject) => {
                const categoryId = subject.subject_category.id;
                if (!groups[categoryId]) {
                    groups[categoryId] = {
                        category_id: categoryId,
                        category_name: subject.subject_category.category_name,
                        subject: [],
                    };
                }
                groups[categoryId].subject.push({
                    id: subject.subject.id,
                    subject_name: subject.subject.subject_name,
                });
                return groups;
            }, {});

            result = Object.values(groupedSubjects);
        }
        return {
            data: {
                tutor: tutor,
                tutor_subjects: result,
                tutor_education: tutor_education,
                tutor_media: tutor_media,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Put('approval-request/:id')
    async updateApprovalRequest(@Param('id') id: number, @Body() payload: UpdateApprovalRequestDTO, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Tutor Approvals');
        let isViewPermission = false;
        let isEditPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        if (req.user_type == UserType.ADMIN) {
            const tutorApprovalRequestDetail = await this.adminService.getApprovalRequestById(id);
            if (payload.status != RequestStatusType.ACCEPTED && payload.status != RequestStatusType.REJECTED) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Status is required.'],
                });
            }

            if (payload.status == RequestStatusType.REJECTED && !payload.remarks) {
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
                await this.emailService.sendEmail(
                    payload.status == RequestStatusType.ACCEPTED ? EmailTypes.PROFILE_APPROVED : EmailTypes.PROFILE_REJECTED,
                    tutorApprovalRequestDetail.user_id,
                    '',
                    tutorApprovalRequestDetail.user_id,
                    '',
                    '',
                    '',
                );
                user.remarks = payload.remarks;
                user.updated_at = new Date();
                await this.userService.updateUser(user);
                // send email

                return res.status(HttpStatus.OK).send({
                    status: true,
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

    @UseGuards(AdminGuard)
    @Get('roles')
    @Render('roles')
    async roles(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Roles');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const roles = await this.adminService.getAllRoles();
        return { data: roles, isEditPermission: isEditPermission, isAddPermission: isAddPermission };
    }

    @UseGuards(AdminGuard)
    @Get('role/:id')
    @Render('role')
    async role(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Roles');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const role = await this.adminService.getRoleById(id);
        const role_permissions = await this.adminService.getRolePermissionByRoleId(id);
        const modules = await this.adminService.getAllModules();
        const permissions = await this.adminService.getAllPermission();

        for (let index = 0; index < modules.length; index++) {
            const module = modules[index];
            module['permissions'] = [];
            for (let index2 = 0; index2 < permissions.length; index2++) {
                const permission = permissions[index2];
                let isAllowed = false;
                for (let index3 = 0; index3 < role_permissions.length; index3++) {
                    const role_permission = role_permissions[index3];
                    if (role_permission.module_id == module.id && role_permission.permission_id == permission.id) {
                        isAllowed = true;
                    }
                }
                module['permissions'].push({
                    ...permission,
                    isSelected: isAllowed,
                });
            }
        }

        return {
            data: {
                role: role,
                role_permission: role_permissions,
                modules: modules,
                permission: permissions,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('role')
    @Render('role')
    async addNewRole(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Roles');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isAddPermission) {
            res.redirect('/admin/dashboard');
        }
        const role = {};
        const role_permissions = [];
        const modules = await this.adminService.getAllModules();
        const permissions = await this.adminService.getAllPermission();

        for (let index = 0; index < modules.length; index++) {
            const module = modules[index];
            module['permissions'] = [];
            for (let index2 = 0; index2 < permissions.length; index2++) {
                const permission = permissions[index2];
                let isAllowed = false;
                for (let index3 = 0; index3 < role_permissions.length; index3++) {
                    const role_permission = role_permissions[index3];
                    if (role_permission.module_id == module.id && role_permission.permission_id == permission.id) {
                        isAllowed = true;
                    }
                }
                module['permissions'].push({
                    ...permission,
                    isSelected: isAllowed,
                });
            }
        }

        return {
            data: {
                role: role,
                role_permission: role_permissions,
                modules: modules,
                permission: permissions,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Put('role/:id')
    async updateRole(@Param('id') id: number, @Body() payload: UpdateRoleDTO, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Roles');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        if (req.user_type == UserType.ADMIN) {
            const roleDetails = await this.adminService.getRoleById(id);
            if (payload.role_name == '') {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Role name is required.'],
                });
            }

            if (payload.role_permissions.length < 1) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Role permissions is required.'],
                });
            }

            if (roleDetails) {
                roleDetails.role_name = payload.role_name;
                await this.adminService.updateRole(roleDetails);
                const role_permissions = await this.adminService.getRolePermissionForAdminByRoleId(roleDetails.id);

                for (let index = 0; index < role_permissions.length; index++) {
                    const element = role_permissions[index];
                    element.is_deleted = true;
                    await this.adminService.updateRolePermission(element);
                }

                for (let index = 0; index < payload.role_permissions.length; index++) {
                    const element = payload.role_permissions[index];
                    await this.adminService.addRolePermission({
                        role_id: roleDetails.id,
                        module_id: element.moduleId,
                        permission_id: element.permissionId,
                    });
                }

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, Role Updated'],
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Role Does not exist'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['Role can only be updated by admin'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Post('role')
    async addRole(@Body() payload: UpdateRoleDTO, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Roles');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isAddPermission) {
            res.redirect('/admin/dashboard');
        }
        if (req.user_type == UserType.ADMIN) {
            let roleDetails = await this.adminService.getRoleByName(payload.role_name);
            if (payload.role_name == '') {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Role name is required.'],
                });
            }

            if (payload.role_permissions.length < 1) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Role permissions is required.'],
                });
            }

            if (roleDetails) {
                return res.status(HttpStatus.CONFLICT).json({
                    status: false,
                    message: ['Duplicate role name found.'],
                });
            } else {
                const roleObj = {
                    role_name: payload.role_name,
                };
                roleDetails = await this.adminService.addRole(roleObj);

                for (let index = 0; index < payload.role_permissions.length; index++) {
                    const element = payload.role_permissions[index];
                    await this.adminService.addRolePermission({
                        role_id: roleDetails.id,
                        module_id: element.moduleId,
                        permission_id: element.permissionId,
                    });
                }

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, Role Added'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['Role can only be Added by admin'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Get('users')
    @Render('users')
    async users(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Users');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isViewPermission) {
            res.redirect('/admin/dashboard');
        }
        const users = await this.userService.getAdminUserForAdmin();
        return { data: users, isEditPermission: isEditPermission, isAddPermission: isAddPermission };
    }

    @UseGuards(AdminGuard)
    @Get('user/:id')
    @Render('user')
    async user(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Users');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isEditPermission) {
            res.redirect('/admin/dashboard');
        }
        const user = await this.userService.getAdminUserForAdminById(id);
        const roles = await this.adminService.getAllRoles();
        return {
            data: {
                user: user,
                roles: roles,
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get('user')
    @Render('user')
    async addUser(@Req() req: any, @Res() res: Response) {
        const permission = await this.adminService.checkForPermission(req.username, 'Users');
        let isViewPermission = false;
        let isEditPermission = false;
        let isAddPermission = false;

        for (let index = 0; index < permission['permissions'].length; index++) {
            const element = permission['permissions'][index];
            if (element.permission_name == 'View' && element.isSelected == true) {
                isViewPermission = true;
            }
            if (element.permission_name == 'Edit' && element.isSelected == true) {
                isEditPermission = true;
            }
            if (element.permission_name == 'Add' && element.isSelected == true) {
                isAddPermission = true;
            }
        }

        if (!isAddPermission) {
            res.redirect('/admin/dashboard');
        }
        const roles = await this.adminService.getAllRoles();
        return {
            data: {
                user: {},
                roles: roles,
            },
        };
    }
}
