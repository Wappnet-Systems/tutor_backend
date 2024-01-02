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
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserPersonalDetailsDTO } from './dtos/user-personal-details.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TutorEducationDetailsDTO } from './dtos/tutor-education.dto';
import { AVATAR_FILE_BASE_PATH, MEDIA_FILE_BASE_PATH, PaginationOptions, StatusType, UserType } from 'src/utils/constant';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { S3Service } from 'src/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { TutorSubjectDTO } from './dtos/tutor-subject.dto';
import * as _ from 'lodash';
import { UserGuard } from '../auth/user.guard';
import { momentUTC } from 'src/helper/date';
import { AdminGuard } from 'src/modules/admin/admin.guard';
import { AdminDTO } from '../auth/dtos/admin.dto';
import { PasswordService } from 'src/services/password.service';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../notification/notification.service';
import { NotificationMessages, NotificationTitles, NotificationTypes } from 'src/utils/notifications';

@ApiTags('user')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private passwordService: PasswordService,
        private s3service: S3Service,
        private configService: ConfigService,
        private notificationService: NotificationService,
    ) {}

    @UseGuards(AdminGuard)
    @Put('admin-profile')
    @UseInterceptors(FileInterceptor('image'))
    async editProfile(
        @UploadedFile() image: Express.Multer.File,
        @Param('id') id: number,
        @Req() req: any,
        @Body() payload: any,
        @Res() res: Response,
    ) {
        if (req.user_type == 1) {
            const user = await this.userService.getUserByEmail(req.username);
            if (user) {
                user.first_name = payload.first_name;
                user.last_name = payload.last_name;
                user.contact_number = payload.contact_number;
                if (payload.user_image != 'http://projects.wappnet.us:3002/admin/profile') {
                    user.image = payload.user_image;
                }
                if (image?.buffer) {
                    const timestamp = Date.now();
                    const basePath = AVATAR_FILE_BASE_PATH + timestamp + user.id;
                    await this.s3service.uploadFile(image.buffer, basePath, image.mimetype);
                    user.image = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                }

                const userDetail = await this.userService.updateUser(user);
                delete userDetail.id;
                delete userDetail.is_deleted;
                delete userDetail.created_at;
                delete userDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, User updated.'],
                    data: userDetail,
                    status: true,
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).send({
                    message: ['User does not exists.'],
                    status: false,
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to edit profile'],
                status: false,
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get User Details' })
    @Get('')
    async getUserDetails(@Req() req: any, @Res() res: Response) {
        const user: any = await this.userService.getUserByEmail(req.username);
        if (user.user_type == UserType.TUTOR) {
            const tutorPostcodeDetails = await this.userService.getAllTutorPostcode(req.user_id);
            user['tutorPostcodeDetails'] = tutorPostcodeDetails;
            const tutorApprovalRequest = await this.userService.getUserApprovalRequest(req.user_id);
            user['tutorApprovalRequest'] = tutorApprovalRequest;
        }
        if (user) {
            delete user.password;
            delete user.created_at;
            delete user.updated_at;

            await this.userService.updateUser(user);
            return res.status(HttpStatus.OK).send({
                user: user,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: 'No user registered with this Email',
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Personal details' })
    @ApiBody({ type: UserPersonalDetailsDTO })
    @Put('personal-details')
    async updatePersonalDetails(@Req() req: any, @Body() payload: UserPersonalDetailsDTO, @Res() res: Response) {
        let user: any = await this.userService.getUserByEmail(req.username);
        if (user) {
            payload.dob = momentUTC(payload.dob as Date);
            user = {
                ...user,
                ...payload,
            };
            const tutorPostcode: any = payload.postcode_ids ? payload.postcode_ids.split(',') : [];
            const tutorPostcodeList = [];
            let tutorPostcodeDetails = await this.userService.getAllTutorPostcode(req.user_id);
            for (let index = 0; index < tutorPostcodeDetails.length; index++) {
                const element = tutorPostcodeDetails[index];
                if (!tutorPostcode.includes(element.postcode_id)) {
                    element.is_deleted = true;
                    element.updated_at = new Date();
                    await this.userService.updatePostcode(element);
                } else {
                    tutorPostcodeList.push(element.postcode_id);
                }
            }

            for (let index = 0; index < tutorPostcode.length; index++) {
                const postcode = tutorPostcode[index];
                if (!tutorPostcodeList.includes(postcode)) {
                    const tutorPostcode = {
                        postcode_id: postcode,
                        user_id: req.user_id,
                    };
                    await this.userService.addPostcode(tutorPostcode);
                }
            }

            user = await this.userService.updateUser(user);
            tutorPostcodeDetails = await this.userService.getAllTutorPostcode(req.user_id);
            user['tutorPostcodeDetails'] = tutorPostcodeDetails;
            const tutorApprovalRequest = await this.userService.getUserApprovalRequest(req.user_id);
            user['tutorApprovalRequest'] = tutorApprovalRequest;
            delete user.password;
            delete user.status;
            delete user.id;
            delete user.created_at;
            delete user.updated_at;
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Profile Updated'],
                data: user,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['No user registered with this Email'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Tutor Education' })
    @ApiBody({ type: TutorEducationDetailsDTO })
    @Post('education')
    async addTutorEducation(@Req() req: any, @Body() payload: TutorEducationDetailsDTO, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            payload.start_date = momentUTC(payload.start_date);
            payload.end_date = momentUTC(payload.end_date);

            const educationObj = {
                ...payload,
                user_id: req.user_id,
            };

            const educationDetail = await this.userService.addEducation(educationObj);
            delete educationDetail.user_id;
            delete educationDetail.is_deleted;
            delete educationDetail.created_at;
            delete educationDetail.updated_at;

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Education added'],
                data: educationDetail,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Education can only be added to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get all education detail of tutor' })
    @Get('education')
    async getAllEducationDetailOfUser(@Req() req: any, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            const educationDetails = await this.userService.getAllEducationOfUser(req.user_id);
            return res.status(HttpStatus.OK).send({
                data: educationDetails,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Education can only be added to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Edit Tutor Education' })
    @ApiBody({ type: TutorEducationDetailsDTO })
    @Put('education/:id')
    async editTutorEducation(@Param('id') id: number, @Req() req: any, @Body() payload: TutorEducationDetailsDTO, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            let educationDetail = await this.userService.getEducationDetailById(req.user_id, id);
            if (educationDetail) {
                payload.start_date = momentUTC(payload.start_date);
                payload.end_date = momentUTC(payload.end_date);
                const educationObj = {
                    ...educationDetail,
                    ...payload,
                };
                educationDetail = await this.userService.updateEducation(educationObj);
                delete educationDetail.user_id;
                delete educationDetail.is_deleted;
                delete educationDetail.created_at;
                delete educationDetail.updated_at;
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Education updated'],
                    data: educationDetail,
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Education details does not exist.'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Education can only be added to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Tutor Education' })
    @Delete('education/:id')
    async deleteTutorEducation(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            const educationDetail = await this.userService.getEducationDetailById(req.user_id, id);
            if (educationDetail) {
                educationDetail.is_deleted = true;
                educationDetail.updated_at = new Date();
                await this.userService.updateEducation(educationDetail);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Education deleted'],
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Education details does not exist.'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Education can only be added to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add User Profile Image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['image'],
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Post('profile-image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadProfileImage(@Req() req: any, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        const user = await this.userService.getUserById(req.user_id);
        if (user && file) {
            const timestamp = Date.now();
            const basePath = AVATAR_FILE_BASE_PATH + timestamp + req.user_id;
            const fileUpload = await this.s3service.uploadFile(file.buffer, basePath, file.mimetype);

            if (fileUpload) {
                await this.s3service.removeFile(user.image);
                user.image = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                await this.userService.updateUser(user);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Profile Image added'],
                    data: user.image,
                });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add User Media' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['image'],
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Post('media')
    @UseInterceptors(FileInterceptor('image'))
    async uploadMedia(@Req() req: any, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
        const user = await this.userService.getUserById(req.user_id);
        if (user && req.user_type == UserType.TUTOR) {
            const mediaObj = {
                user_id: req.user_id,
                media_type: file.mimetype.split('/')[0],
            };
            const mediaDetail = await this.userService.addMedia(mediaObj);
            if (user && file) {
                const timestamp = Date.now();
                const basePath = MEDIA_FILE_BASE_PATH + timestamp + mediaDetail.id;
                const fileUpload = await this.s3service.uploadFile(file.buffer, basePath, file.mimetype);

                if (fileUpload) {
                    mediaDetail.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                    await this.userService.updateMedia(mediaDetail);
                    return res.status(HttpStatus.OK).send({
                        message: ['Success!, Media added'],
                    });
                } else {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        status: false,
                        message: ['Media details does not exist.'],
                    });
                }
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Media can only be added to tutor'],
                });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete User Media' })
    @Delete('media/:id')
    async deleteMedia(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const user = await this.userService.getUserById(req.user_id);
        if (user && user.user_type == UserType.TUTOR) {
            const mediaDetail = await this.userService.getMediaById(req.user_id, id);
            if (mediaDetail) {
                mediaDetail.is_deleted = true;
                await this.userService.updateMedia(mediaDetail);
                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Media deleted'],
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Media details does not exist.'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Media can only be deleted to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get all media of tutor' })
    @Get('media')
    async getAllMediaOfUser(@Req() req: any, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            const mediaDetails = await this.userService.getAllMediaOfUser(req.user_id);
            return res.status(HttpStatus.OK).send({
                data: mediaDetails,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Media can only be visible to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Tutor Subject' })
    @ApiBody({ type: TutorSubjectDTO })
    @Post('subject')
    async addTutorSubject(@Req() req: any, @Body() payload: TutorSubjectDTO, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(req.username);
        if (user && user.user_type == UserType.TUTOR) {
            const tutorSubject: any = payload.subject_ids.split(',');
            const tutorSubjectList = [];
            let tutorSubjectDetails = await this.userService.getAllTutorSubjects(req.user_id, payload.category_id);
            for (let index = 0; index < tutorSubjectDetails.length; index++) {
                const element = tutorSubjectDetails[index];
                if (!tutorSubject.includes(element.subject_id)) {
                    // delete the subject
                    element.is_deleted = true;
                    element.updated_at = new Date();
                    await this.userService.updateSubject(element);
                } else {
                    tutorSubjectList.push(element.subject_id);
                }
            }

            for (let index = 0; index < tutorSubject.length; index++) {
                const subject = tutorSubject[index];
                if (!tutorSubjectList.includes(subject)) {
                    // add the subject
                    const tutorSubjectObj = {
                        subject_id: subject,
                        category_id: payload.category_id,
                        user_id: req.user_id,
                    };
                    await this.userService.addSubject(tutorSubjectObj);
                }
            }

            tutorSubjectDetails = await this.userService.getAllTutorSubjects(req.user_id, payload.category_id);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Subject updated'],
                data: tutorSubjectDetails,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Subject can only be added to tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Tutor Subject' })
    @Get('subject')
    async getTutorSubjects(@Req() req: any, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            let result = [];
            const tutorSubjectDetails: any = await this.userService.getAllTutorSubjectsWithoutCategory(req.user_id);
            if (tutorSubjectDetails) {
                const groupedSubjects = tutorSubjectDetails.reduce((groups, subject) => {
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

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Subject List'],
                data: result,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Subject can only be viewed by tutor'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Submit Tutor profile for approval' })
    @Put('verification')
    async submitProfileForVerification(@Req() req: any, @Res() res: Response) {
        if (req.user_type == UserType.TUTOR) {
            const tutorPendingRequest = await this.userService.checkForApproval(req.user_id);

            if (tutorPendingRequest) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: false,
                    message: ['Request already submitted.'],
                });
            }

            const tutorDetails = await this.userService.getUserById(req.user_id);
            let tutorEducationDetails = [];
            tutorEducationDetails = await this.userService.getAllEducationOfUser(req.user_id);
            let tutorSubjects = [];
            tutorSubjects = await this.userService.getAllTutorSubjectsWithoutCategory(req.user_id);

            if (tutorDetails) {
                if (tutorDetails.first_name != '') {
                    if (tutorDetails.last_name != '') {
                        if (tutorDetails.tag_line != '') {
                            if (tutorDetails.hourly_rate > 1) {
                                if (tutorDetails.languages) {
                                    if (tutorDetails.teach_at_offline || tutorDetails.teach_at_online) {
                                        if (tutorDetails.introduction) {
                                            if (tutorDetails.contact_number) {
                                                if (tutorDetails.email) {
                                                    if (tutorEducationDetails.length > 0) {
                                                        if (tutorSubjects.length > 0) {
                                                            if (tutorDetails.image) {
                                                                const requestObj = {
                                                                    user_id: req.user_id,
                                                                };
                                                                await this.userService.submitUserForApproval(requestObj);
                                                                tutorDetails.remarks = 'Profile submitted for approval';
                                                                await this.userService.updateUser(tutorDetails);
                                                                return res.status(HttpStatus.OK).send({
                                                                    message: ['Success!, Profile Submitted for review'],
                                                                });
                                                            } else {
                                                                return res.status(HttpStatus.BAD_REQUEST).json({
                                                                    status: false,
                                                                    message: ['Please upload profile picture'],
                                                                });
                                                            }
                                                        } else {
                                                            return res.status(HttpStatus.BAD_REQUEST).json({
                                                                status: false,
                                                                message: ['Please enter at least 1 subject'],
                                                            });
                                                        }
                                                    } else {
                                                        return res.status(HttpStatus.BAD_REQUEST).json({
                                                            status: false,
                                                            message: ['Please enter at least 1 education detail.'],
                                                        });
                                                    }
                                                } else {
                                                    return res.status(HttpStatus.BAD_REQUEST).json({
                                                        status: false,
                                                        message: ['Please enter email address.'],
                                                    });
                                                }
                                            } else {
                                                return res.status(HttpStatus.BAD_REQUEST).json({
                                                    status: false,
                                                    message: ['Please enter contact number.'],
                                                });
                                            }
                                        } else {
                                            return res.status(HttpStatus.BAD_REQUEST).json({
                                                status: false,
                                                message: ['Please enter introduction.'],
                                            });
                                        }
                                    } else {
                                        return res.status(HttpStatus.BAD_REQUEST).json({
                                            status: false,
                                            message: ['Please select teaching way.'],
                                        });
                                    }
                                } else {
                                    return res.status(HttpStatus.BAD_REQUEST).json({
                                        status: false,
                                        message: ['Please select atleast 1 language.'],
                                    });
                                }
                            } else {
                                return res.status(HttpStatus.BAD_REQUEST).json({
                                    status: false,
                                    message: ['Please add hourly rate.'],
                                });
                            }
                        } else {
                            return res.status(HttpStatus.BAD_REQUEST).json({
                                status: false,
                                message: ['Please enter tag line.'],
                            });
                        }
                    } else {
                        return res.status(HttpStatus.BAD_REQUEST).json({
                            status: false,
                            message: ['Please enter last name.'],
                        });
                    }
                } else {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        status: false,
                        message: ['Please enter first name.'],
                    });
                }
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: false,
                    message: ['Tutor not found.'],
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Only tutor can submit profile for verification'],
            });
        }
    }

    @UseGuards(UserGuard)
    @ApiOperation({ summary: 'Get Tutor Detail' })
    @Get('tutor/:id')
    async getTutorDetail(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const userDetail = await this.userService.getUserById(id);
        if (userDetail.user_type == UserType.TUTOR) {
            const tutorDetail: any = await this.userService.getTutorDetailById(id, req?.user_id ?? 0);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Tutor detail'],
                data: tutorDetail,
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: false,
                message: ['Tutor not found.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get All tutor for students' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('tutors')
    async getTutors(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        const tutorDetail = await this.userService.getTutorList(query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Tutors'],
            data: tutorDetail,
        });
    }

    @UseGuards(AdminGuard)
    @Put('status/:id')
    async markUserAsActiveInactive(@Param('id') id: number, @Res() res: Response) {
        const user = await this.userService.getUserById(id);
        user.status = user.status == StatusType.ACTIVE ? StatusType.INACTIVE : StatusType.ACTIVE;
        await this.userService.updateUser(user);
        await this.notificationService.addNotification({
            user_id: user.id,
            title: NotificationTitles.INACTIVE,
            description: NotificationMessages.INACTIVE,
            type: NotificationTypes.INACTIVE,
        });
        return res.status(HttpStatus.OK).send({
            message: ['Success!, User updated'],
        });
    }

    @UseGuards(AdminGuard)
    @Post('')
    async addAdminUser(@Req() req: any, @Body() payload: AdminDTO, @Res() res: Response) {
        const user = await this.userService.getUserByEmail(payload.email);
        if (user) {
            return res.status(HttpStatus.CONFLICT).send({
                status: false,
                message: ['Duplicate user found.'],
            });
        } else {
            try {
                const adminDetail = await this.userService.getUserById(req.user_id);
                const password = this.passwordService.generateRandomPassword();
                const user = await this.userService.createUser({
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    email: payload.email,
                    contact_number: payload.contact_number,
                    password: await bcrypt.hash(password, 10),
                    user_type: UserType.ADMIN,
                    email_verified: true,
                    status: StatusType.ACTIVE,
                    is_admin_users: true,
                });
                await this.userService.addUserPermission({
                    user_id: user.id,
                    role_id: payload.role_id,
                });
                await this.userService.sendEmail(user.email, adminDetail.first_name + ' ' + adminDetail.last_name, password);
                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, User Added'],
                });
            } catch (error) {
                return res.status(HttpStatus.OK).send({
                    status: false,
                    message: ['Something went wrong'],
                });
            }
        }
    }

    @UseGuards(AdminGuard)
    @Put('/:id')
    async updateAdminUser(@Param('id') id: number, @Body() payload: AdminDTO, @Res() res: Response) {
        const user = await this.userService.getAdminUserForAdminById(id);
        if (user) {
            const userObj = {
                ...user,
                ...payload,
            };
            await this.userService.updateUser(userObj);
            const userPermission = await this.userService.getUserPermissionByUserId(id);
            userPermission.role_id = Number(payload.role_id);
            await this.userService.addUserPermission({
                user_id: user.id,
                role_id: payload.role_id,
            });
            return res.status(HttpStatus.OK).send({
                status: true,
                message: ['Success!, User updated'],
            });
        } else {
            return res.status(HttpStatus.CONFLICT).send({
                status: false,
                message: ['User not found.'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @Delete('/:id')
    async deleteAdminUser(@Param('id') id: number, @Res() res: Response) {
        const user = await this.userService.getAdminUserForAdminById(id);
        if (user) {
            user.is_deleted = true;
            await this.userService.updateUser(user);
            return res.status(HttpStatus.OK).send({
                status: true,
                message: ['Success!, User Deleted'],
            });
        } else {
            return res.status(HttpStatus.CONFLICT).send({
                status: false,
                message: ['User not found.'],
            });
        }
    }
}
