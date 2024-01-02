import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDTO } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { StatusType, UserType, jwtSecret } from 'src/utils/constant';
import { VerifyDTO } from './dtos/verify.dto';
import * as bcrypt from 'bcrypt';
import { SignInDTO } from './dtos/sign-in.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDTO } from './dtos/forgot-password.dto';
import { ChangePasswordDTO } from './dtos/change-password.dto';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { BadgesService } from '../badges/badges.service';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { EmailService } from '../email/email.service';
import { EmailTypes } from 'src/utils/notifications';
import { momentUTC } from 'src/helper/date';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private badgesService: BadgesService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) {}

    @ApiOperation({ summary: 'Sign Up' })
    @ApiBody({ type: RegisterDTO })
    @Post('signup')
    async signup(@Res() res: Response, @Body() payload: RegisterDTO) {
        const user = await this.authService.getUserByEmail(payload.email);
        if (user) {
            return res.status(HttpStatus.CONFLICT).json({
                status: false,
                message: ['User already registered with this Email'],
            });
        } else {
            payload['password'] = await bcrypt.hash(payload['password'], 10);
            const userObj = {
                user_type: payload.user_type,
                email: payload.email,
                first_name: payload.first_name,
                last_name: payload.last_name,
                dob: momentUTC(payload.dob),
                contact_number: payload.contact_number,
                password: payload.password,
                remarks: 'Email verification pending',
                email_verified: false,
                status: StatusType.INACTIVE,
                created_at: new Date(),
                updated_at: new Date(),
                address: payload.address,
                lat: payload.lat,
                lng: payload.lng,
            };

            const user_detail = await this.authService.createUser(userObj);
            if (user_detail.user_type == UserType.STUDENT) {
                user_detail.enrollment = Number(new Date().getFullYear().toString() + 1000 + user_detail.id);
            }
            await this.authService.updateUser(user_detail);
            const user_data = {
                id: user_detail.id,
                user_type: user_detail.user_type,
                first_name: user_detail.first_name,
                last_name: user_detail.last_name,
            };

            const otp_detail = await this.authService.generateSaveOTP(user_detail.email, user_detail.id);
            await this.emailService.sendEmail(EmailTypes.VERIFY_EMAIL, user_detail.id, user_detail.id, user_detail.id, '', '', otp_detail.otp);
            return res.status(HttpStatus.CREATED).send({
                message: ['You are successfully sign up. Please verify your email'],
                data: user_data,
            });
        }
    }

    @ApiOperation({ summary: 'Verify email otp' })
    @ApiBody({ type: VerifyDTO })
    @Post('verify')
    async verify(@Res() res: Response, @Body() payload: VerifyDTO) {
        const user = await this.authService.getUserByEmail(payload.email);
        if (user && !user.email_verified) {
            const otp_detail = await this.authService.getOtp(user.id);
            if (otp_detail) {
                if (otp_detail.otp == payload.otp) {
                    user.email_verified = true;
                    user.status = StatusType.ACTIVE;
                    user.remarks = 'Email verified';
                    user.updated_at = new Date();
                    await this.authService.updateUser(user);

                    await this.emailService.sendEmail(EmailTypes.WELCOME_EMAIL, user.id, user.id, user.id, '', '', '');
                    return res.status(HttpStatus.OK).send({
                        message: ['You are successfully verified the otp'],
                    });
                } else {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['Please enter a valid otp'],
                    });
                }
            }
        } else {
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['No user registered with this Email'],
                });
            } else {
                return res.status(HttpStatus.CONFLICT).json({
                    status: false,
                    message: ['Email is already verified'],
                });
            }
        }
    }

    @ApiOperation({ summary: 'Sign in' })
    @ApiBody({ type: SignInDTO })
    @Post('signIn')
    async signIn(@Body() payload: SignInDTO, @Res() res: Response) {
        try {
            const user: any = await this.authService.getUserByEmail(payload.email);
            if (
                user &&
                user.email_verified &&
                user.status == StatusType.ACTIVE &&
                (user.user_type == UserType.TUTOR || user.user_type == UserType.STUDENT)
            ) {
                const validPassword = await bcrypt.compare(payload['password'], user.password);
                if (validPassword) {
                    const payload = { username: user.email, id: user.id, type: user.user_type };
                    const access_token = await this.jwtService.signAsync(payload);
                    await this.badgesService.addBadgeToUser(user.id);
                    return res.status(HttpStatus.OK).json({
                        message: ['Login Successful'],
                        access_token: access_token,
                    });
                } else {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['Password does not match.'],
                    });
                }
            } else {
                if (!user.email_verified) {
                    return res.status(HttpStatus.CONFLICT).json({
                        status: false,
                        message: ['Please verify email first'],
                    });
                } else if (user.status == StatusType.INACTIVE) {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['Your account is inactive. Please contact the administrator for further information.'],
                    });
                } else if (user.user_type != UserType.TUTOR && user.user_type != UserType.STUDENT) {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['Only students or tutors can login'],
                    });
                } else {
                    return res.status(HttpStatus.FORBIDDEN).json({
                        status: false,
                        message: ['No user registered with this Email'],
                    });
                }
            }
        } catch (e) {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }

    @ApiOperation({ summary: 'Forgot Password' })
    @ApiBody({ type: ForgotPasswordDTO })
    @Post('forgot-password')
    async forgotPassword(@Res() res: Response, @Body() payload: ForgotPasswordDTO) {
        const user = await this.authService.getUserByEmail(payload.email);
        if (user && user.email_verified) {
            const payload = { sub: user.email };
            const token = await this.jwtService.signAsync(payload, { expiresIn: '5m' });
            const resetLink = `${this.configService.get<string>('WEB_URL')}/reset-password/${token}`;
            await this.emailService.sendEmail(EmailTypes.RESET_PASSWORD, user.id, user.id, user.id, resetLink, '', '');
            user.is_password_reset_requested = true;
            await this.authService.updateUser(user);
            return res.status(HttpStatus.OK).send({
                message: ['Reset Password email sent to registered email'],
            });
        } else {
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['No user registered with this Email'],
                });
            } else {
                return res.status(HttpStatus.CONFLICT).json({
                    status: false,
                    message: ['Email is not verified'],
                });
            }
        }
    }

    @ApiOperation({ summary: 'Forgot Password' })
    @ApiParam({ name: 'token', description: 'token sended in email' })
    @Get('verify-forgot-password/:token')
    async verifyForgotPassword(@Param('token') token: string, @Res() res: Response) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: jwtSecret,
        });
        const email = payload.sub;
        const user: any = await this.authService.getUserByEmail(email);
        if (user && user.email_verified && user?.is_password_reset_requested) {
            const payload = { username: user.email, id: user.id, type: user.user_type };
            await this.authService.updateUser(user);
            const access_token = await this.jwtService.signAsync(payload);
            return res.status(HttpStatus.OK).send({
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
                    message: ['Email is not verified'],
                });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Change Password' })
    @ApiBody({ type: ChangePasswordDTO })
    @ApiBearerAuth('access-token')
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
            await this.emailService.sendEmail(EmailTypes.PASSWORD_UPDATED, user.id, user.id, user.id, '', '', '');
            // res.redirect('/admin/');
            return res.status(HttpStatus.CREATED).send({
                status:true,
                message: ['Success!, Password changed'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Change Password' })
    @ApiBody({ type: UpdatePasswordDTO })
    @ApiBearerAuth('access-token')
    @Post('update-password')
    async updatePassword(@Req() req: any, @Res() res: Response, @Body() payload: UpdatePasswordDTO) {
        const user = await this.authService.getUserByEmail(req.username);
        if (user) {
            const validPassword = await bcrypt.compare(payload.old_password, user.password);
            if (validPassword) {
                const samePassword = await bcrypt.compare(payload.password, user.password);
                if (samePassword) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        status: false,
                        message: ['Old Password and new password cannot be same'],
                    });
                } else {
                    payload['password'] = await bcrypt.hash(payload['password'], 10);
                    user.password = payload.password;
                    user.updated_at = new Date();
                    user.is_force_password_reset = false;
                    user.is_password_reset_requested = false;
                    await this.authService.updateUser(user);
                    await this.emailService.sendEmail(EmailTypes.PASSWORD_UPDATED, user.id, user.id, user.id, '', '', '');
                    return res.status(HttpStatus.CREATED).send({
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

    @ApiOperation({ summary: 'Resend sign up otp' })
    @ApiBody({ type: ForgotPasswordDTO })
    @Post('resend-otp')
    async resendOtp(@Res() res: Response, @Body() payload: ForgotPasswordDTO) {
        const user = await this.authService.getUserByEmail(payload.email);
        if (user && !user.email_verified) {
            const otp_detail = await this.authService.getOtp(user.id);
            await this.emailService.sendEmail(EmailTypes.VERIFY_EMAIL, user.id, user.id, user.id, '', '', otp_detail.otp);
            return res.status(HttpStatus.OK).send({
                message: ['OTP Resent Successfully!'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).send({
                message: ['No user found.'],
            });
        }
    }
}
