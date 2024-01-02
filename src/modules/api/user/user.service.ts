import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { Repository } from 'typeorm';
import { SlackService } from '../../../services/slack.service';
import { UserActivationOtp } from 'src/entities/user-activation-otp.entity';
import { TutorEducation } from 'src/entities/tutor-education.entity';
import { TutorMediaGallery } from 'src/entities/tutor-media-gallery.entity';
import { TutorSubject } from 'src/entities/tutor-subject.entity';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { PaginationOptions, RequestStatusType, UserType } from 'src/utils/constant';
import { TutorPostcode } from 'src/entities/tutor-postcode.entity';
import { Language } from 'src/entities/language.entity';
import { Postcode } from 'src/entities/postcode.entity';
import { UserPermission } from 'src/entities/user-permission.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/services/mail.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(TutorEducation) private readonly tutorEducationRepository: Repository<TutorEducation>,
        @InjectRepository(TutorSubject) private readonly tutorSubjectRepository: Repository<TutorSubject>,
        @InjectRepository(UserActivationOtp) private readonly userActivationOtpRepository: Repository<UserActivationOtp>,
        @InjectRepository(TutorMediaGallery) private readonly tutorMediaGalleryRepository: Repository<TutorMediaGallery>,
        @InjectRepository(TutorApprovalRequest) private readonly tutorApprovalRequestRepository: Repository<TutorApprovalRequest>,
        @InjectRepository(TutorPostcode) private readonly tutorPostcodeRepository: Repository<TutorPostcode>,
        @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
        @InjectRepository(Postcode) private readonly postcodeRepository: Repository<Postcode>,
        @InjectRepository(UserPermission) private readonly userPermissionRepository: Repository<UserPermission>,
        private readonly slackService: SlackService,
        private configService: ConfigService,
        private mailService: MailService,
    ) {}

    async getUserById(user_id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: user_id },
            });
            if (user) {
                return user;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getUserById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email },
            });
            if (user) {
                return user;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getUserByEmail', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserByEmailWithRole(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email },
                relations: {
                    user_permission: true,
                },
            });
            if (user) {
                return user;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getUserByEmailWithRole', true);
            await this.slackService.send(error, true);
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

    async addUserPermission(permissionObj: any): Promise<UserPermission> {
        try {
            const userPermission = await this.userPermissionRepository.save(permissionObj);
            return userPermission;
        } catch (error) {
            await this.slackService.send('Error in addUserPermission', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserPermissionByUserId(user_id: number): Promise<UserPermission> {
        try {
            const userPermission = await this.userPermissionRepository.findOne({
                where: { user_id: user_id },
            });
            return userPermission;
        } catch (error) {
            await this.slackService.send('Error in getUserPermissionByUserId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateUser(user: any): Promise<User> {
        try {
            const user_detail = await this.userRepository.save(user);
            if (user_detail) {
                return user_detail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async generateSaveOtp(email: string, user_id: number): Promise<UserActivationOtp> {
        const otp_detail: any = {
            email: email,
            otp: Math.floor(1000 + Math.random() * 9000),
            user_id: user_id,
        };

        try {
            const otp = await this.userActivationOtpRepository.save(otp_detail);
            if (otp) {
                return otp;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in generateSaveOtp', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getOtp(user_id: number): Promise<UserActivationOtp> {
        try {
            const otp_detail = await this.userActivationOtpRepository.findOne({
                where: { user_id: user_id },
                order: { id: 'DESC' },
            });
            if (otp_detail) {
                return otp_detail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getOtp', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addEducation(educationObj: any): Promise<TutorEducation> {
        try {
            const educationDetail = await this.tutorEducationRepository.save(educationObj);
            if (educationDetail) {
                return educationDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in addEducation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateEducation(educationObj: any): Promise<TutorEducation> {
        try {
            const educationDetail = await this.tutorEducationRepository.save(educationObj);
            if (educationDetail) {
                return educationDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateEducation', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllEducationOfUser(user_id: number): Promise<TutorEducation[]> {
        try {
            const educationDetail = await this.tutorEducationRepository.find({
                where: { user_id: user_id, is_deleted: false },
            });
            if (educationDetail) {
                return educationDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllEducationOfUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getEducationDetailById(user_id: number, id: number): Promise<TutorEducation> {
        try {
            const educationDetail = await this.tutorEducationRepository.findOne({
                where: { user_id: user_id, is_deleted: false, id: id },
            });
            if (educationDetail) {
                return educationDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getEducationDetailById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addMedia(mediaObj: any): Promise<TutorMediaGallery> {
        try {
            const mediaDetail = await this.tutorMediaGalleryRepository.save(mediaObj);
            if (mediaDetail) {
                return mediaDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in addMedia', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateMedia(mediaObj: any): Promise<TutorMediaGallery> {
        try {
            const mediaDetail = await this.tutorMediaGalleryRepository.save(mediaObj);
            if (mediaDetail) {
                return mediaDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateMedia', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllMediaOfUser(user_id: number): Promise<TutorMediaGallery[]> {
        try {
            const mediaDetail = await this.tutorMediaGalleryRepository.find({
                where: { user_id: user_id, is_deleted: false },
            });
            if (mediaDetail) {
                return mediaDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllMediaOfUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getMediaById(user_id: number, id: number): Promise<TutorMediaGallery> {
        try {
            const mediaDetail = await this.tutorMediaGalleryRepository.findOne({
                where: { user_id: user_id, is_deleted: false, id: id },
            });
            if (mediaDetail) {
                return mediaDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getMediaById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addSubject(subjectObj: any): Promise<TutorSubject> {
        try {
            const subjectDetail = await this.tutorSubjectRepository.save(subjectObj);
            if (subjectDetail) {
                return subjectDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in addSubject', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateSubject(subjectObj: any): Promise<TutorSubject> {
        try {
            const subjectDetail = await this.tutorSubjectRepository.save(subjectObj);
            if (subjectDetail) {
                return subjectDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in updateSubject', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addPostcode(subjectObj: any): Promise<TutorPostcode> {
        try {
            const postcodeDetail = await this.tutorPostcodeRepository.save(subjectObj);
            return postcodeDetail;
        } catch (error) {
            await this.slackService.send('Error in addPostcode', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updatePostcode(subjectObj: any): Promise<TutorPostcode> {
        try {
            const postcodeDetail = await this.tutorPostcodeRepository.save(subjectObj);
            return postcodeDetail;
        } catch (error) {
            await this.slackService.send('Error in updatePostcode', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllTutorSubjects(user_id: number, category_id: number): Promise<TutorSubject[]> {
        try {
            const subjectDetail = await this.tutorSubjectRepository.find({
                where: { user_id: user_id, category_id: category_id, is_deleted: false },
            });
            if (subjectDetail) {
                return subjectDetail;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllTutorSubjects', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllTutorPostcode(user_id: number): Promise<TutorPostcode[]> {
        try {
            const tutorPostcode = await this.tutorPostcodeRepository.find({
                where: { user_id: user_id, is_deleted: false },
            });
            return tutorPostcode;
        } catch (error) {
            await this.slackService.send('Error in getAllTutorPostcode', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllTutorSubjectsWithoutCategory(user_id: number): Promise<TutorSubject[]> {
        try {
            const tutorSubjects = await this.tutorSubjectRepository
                .createQueryBuilder('tutor_subject')
                .leftJoinAndSelect('tutor_subject.subject_category', 'subject_category')
                .leftJoinAndSelect('tutor_subject.subject', 'subject')
                .where('tutor_subject.user_id = :userId AND tutor_subject.is_deleted = :isDeleted', { userId: user_id, isDeleted: false })
                .select(['tutor_subject.id', 'subject_category.id', 'subject_category.category_name', 'subject.id', 'subject.subject_name'])
                .getMany();

            return tutorSubjects;
        } catch (error) {
            await this.slackService.send('Error in getAllTutorSubjectsWithoutCategory', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async submitUserForApproval(approvalObj: any): Promise<TutorApprovalRequest> {
        try {
            let request;
            const profile = await this.tutorApprovalRequestRepository.findOne({
                where: { user_id: approvalObj.user_id, status: RequestStatusType.REJECTED },
            });
            if (profile) {
                profile.status = RequestStatusType.PENDING;
                request = await this.tutorApprovalRequestRepository.save(profile);
            } else {
                request = await this.tutorApprovalRequestRepository.save(approvalObj);
            }
            return request;
        } catch (error) {
            await this.slackService.send('Error in submitUserForApproval', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async checkForApproval(user_id: number): Promise<TutorApprovalRequest> {
        try {
            const request = await this.tutorApprovalRequestRepository.findOne({
                where: { user_id: user_id, status: RequestStatusType.PENDING, is_deleted: false },
            });
            return request;
        } catch (error) {
            await this.slackService.send('Error in checkForApproval', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getUserApprovalRequest(user_id: number): Promise<TutorApprovalRequest> {
        try {
            const request = await this.tutorApprovalRequestRepository.findOne({
                where: { user_id: user_id, is_deleted: false },
            });
            return request;
        } catch (error) {
            await this.slackService.send('Error in getUserApprovalRequest', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorDetailById(user_id: number, student_user_id: number): Promise<User> {
        try {
            const selections = [
                'user.id',
                'user.first_name',
                'user.last_name',
                'user.image',
                'user.dob',
                'user.contact_number',
                'user.tag_line',
                'user.hourly_rate',
                'user.hourly_rate2',
                'user.hourly_rate3',
                'user.address',
                'user.address_line_two',
                'user.country_id',
                'user.city_id',
                'user.zipcode',
                'user.skype',
                'user.whatsapp',
                'user.website',
                'user.introduction',
                'user.teach_at_online',
                'user.teach_at_offline',
                'user.is_approved',
                'user.avg_rating',
                'user.total_reviews',
                'user.languages',
                'user.email',
                'education_details.course_name',
                'education_details.university_name',
                'education_details.location',
                'education_details.description',
                'education_details.start_date',
                'education_details.end_date',
                'education_details.is_ongoing',
                'tutor_subjects.subject_id',
                'tutor_subjects.category_id',
                'subject_category.category_name',
                'subject.subject_name',
                'media_gallery.media',
                'media_gallery.media_type',
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
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.education_details', 'education_details', 'education_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                    select: ['course_name', 'university_name', 'location', 'description', 'start_date', 'end_date', 'is_ongoing'],
                })
                .leftJoinAndSelect('user.media_gallery', 'media_gallery', 'media_gallery.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_subjects', 'tutor_subjects', 'tutor_subjects.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_postcodes', 'tutor_postcodes', 'tutor_postcodes.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_postcodes.postcode', 'postcode', 'postcode.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_subjects.subject_category', 'subject_category', 'subject_category.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('tutor_subjects.subject', 'subject', 'subject.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_badge', 'tutor_badge', 'tutor_badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_badge.badge', 'badge', 'badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.country_details', 'country_details', 'country_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('user.city_details', 'city_details', 'city_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .where('user.id = :userId', { userId: user_id });
            if (user_id) {
                queryBuilder.leftJoinAndSelect(
                    'user.student_bookmarks',
                    'student_bookmarks',
                    'student_bookmarks.is_deleted = :isDeleted AND student_bookmarks.student_user_id = :user_id',
                    {
                        isDeleted: false,
                        user_id: student_user_id,
                    },
                );
                queryBuilder.select([...selections, 'student_bookmarks.id']);
            } else {
                queryBuilder.select([...selections]);
            }

            const user = await queryBuilder.getOne();
            if (user) {
                return user;
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getTutorDetailById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorDetailByIdForAdmin(user_id: number) {
        try {
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.education_details', 'education_details', 'education_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                    select: ['course_name', 'university_name', 'location', 'description', 'start_date', 'end_date', 'is_ongoing'],
                })
                .leftJoinAndSelect('user.media_gallery', 'media_gallery', 'media_gallery.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_subjects', 'tutor_subjects', 'tutor_subjects.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_postcodes', 'tutor_postcodes', 'tutor_postcodes.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_postcodes.postcode', 'postcode', 'postcode.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_subjects.subject_category', 'subject_category', 'subject_category.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('tutor_subjects.subject', 'subject', 'subject.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.tutor_badge', 'tutor_badge', 'tutor_badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('tutor_badge.badge', 'badge', 'badge.is_deleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('user.country_details', 'country_details', 'country_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('user.city_details', 'city_details', 'city_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .where('user.id = :userId', { userId: user_id });
            const user = await queryBuilder.getOne();
            const languages = await this.languageRepository.find({
                where: { is_deleted: false },
            });
            user['allLanguages'] = '';
            const tempAllLang = user.languages.split(',');
            for (let index = 0; index < tempAllLang.length; index++) {
                for (let index2 = 0; index2 < languages.length; index2++) {
                    const lang = tempAllLang[index];
                    const element = languages[index2];
                    if (element.id == Number(lang)) {
                        if (user['allLanguages'] == '') {
                            user['allLanguages'] = element.language;
                        } else {
                            user['allLanguages'] = user['allLanguages'] + ', ' + element.language;
                        }
                    }
                }
            }
            user['allPostCodes'] = '';
            const tutorPostcode = await this.tutorPostcodeRepository.find({
                where: { user_id: user_id, is_deleted: false },
            });
            const allPostCodes = await this.postcodeRepository.find({
                where: { is_deleted: false },
            });

            for (let index = 0; index < tutorPostcode.length; index++) {
                for (let index2 = 0; index2 < allPostCodes.length; index2++) {
                    const postcode = tutorPostcode[index];
                    const element = allPostCodes[index2];
                    if (element.id == postcode.postcode_id) {
                        if (user['allPostCodes'] == '') {
                            user['allPostCodes'] = element.place_name + ' (' + element.postcode + ')';
                        } else {
                            user['allPostCodes'] = user['allPostCodes'] + ', ' + element.place_name + ' (' + element.postcode + ')';
                        }
                    }
                }
            }

            user['allBadges'] = '';
            if (user?.tutor_badge?.length > 0) {
                for (let index = 0; index < user.tutor_badge.length; index++) {
                    const element = user?.tutor_badge?.[index]?.badge;
                    if (user['allBadges'] == '') {
                        user['allBadges'] = element.title;
                    } else {
                        user['allBadges'] = user['allBadges'] + ', ' + element.title;
                    }
                }
            }
            return user;
        } catch (error) {
            await this.slackService.send('Error in getTutorDetailByIdForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentDetailByIdForAdmin(user_id: number) {
        try {
            const queryBuilder = this.userRepository.createQueryBuilder('user').where('user.id = :userId', { userId: user_id });
            const user = await queryBuilder.getOne();
            const languages = await this.languageRepository.find({
                where: { is_deleted: false },
            });
            user['allLanguages'] = '';
            if (user?.languages) {
                const tempAllLang = user.languages.split(',');
                for (let index = 0; index < tempAllLang.length; index++) {
                    for (let index2 = 0; index2 < languages.length; index2++) {
                        const lang = tempAllLang[index];
                        const element = languages[index2];
                        if (element.id == Number(lang)) {
                            if (user['allLanguages'] == '') {
                                user['allLanguages'] = element.language;
                            } else {
                                user['allLanguages'] = user['allLanguages'] + ', ' + element.language;
                            }
                        }
                    }
                }
            }
            return user;
        } catch (error) {
            await this.slackService.send('Error in getStudentDetailByIdForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorList(pagination: PaginationOptions) {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.country_details', 'country_details', 'country_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('user.city_details', 'city_details', 'city_details.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .select([
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.image',
                    'user.dob',
                    'user.contact_number',
                    'user.tag_line',
                    'user.hourly_rate',
                    'user.address_line_one',
                    'user.address_line_two',
                    'user.country_id',
                    'user.city_id',
                    'user.zipcode',
                    'user.languages',
                    'user.created_at',
                    'user.skype',
                    'user.whatsapp',
                    'user.website',
                    'user.email',
                    'user.introduction',
                    'user.teach_at_my_home',
                    'user.teach_at_students_home',
                    'user.teach_at_online',
                    'user.is_approved',
                    'country_details.country_name',
                    'city_details.city_name',
                ])
                .where('user.user_type = :user_type', { user_type: UserType.TUTOR })
                .orderBy('user.created_at', pagination.sort)
                .skip((pagination.page - 1) * pagination.limit)
                .take(pagination.limit)
                .getMany();

            if (user.length) {
                return {
                    data: user,
                    page: pagination.page,
                    itemPerPage: pagination.limit,
                    totalItem: await this.userRepository.count({
                        where: { user_type: UserType.TUTOR },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getTutorList', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorListForAdmin() {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .select([
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.image',
                    'user.dob',
                    'user.contact_number',
                    'user.tag_line',
                    'user.hourly_rate',
                    'user.address_line_one',
                    'user.address_line_two',
                    'user.country_id',
                    'user.city_id',
                    'user.zipcode',
                    'user.languages',
                    'user.status',
                    'user.created_at',
                    'user.skype',
                    'user.whatsapp',
                    'user.website',
                    'user.email',
                    'user.introduction',
                    'user.teach_at_offline',
                    'user.teach_at_online',
                    'user.is_approved',
                ])
                .leftJoinAndSelect('user.approval_request', 'approval_request')
                .where('user.user_type = :user_type AND approval_request.status =:status', { user_type: UserType.TUTOR, status: 1 })
                .getMany();
            return user;
        } catch (error) {
            await this.slackService.send('Error in getTutorListForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getStudentListForAdmin() {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .select([
                    'user.id',
                    'user.enrollment',
                    'user.first_name',
                    'user.last_name',
                    'user.image',
                    'user.dob',
                    'user.contact_number',
                    'user.tag_line',
                    'user.hourly_rate',
                    'user.address_line_one',
                    'user.address_line_two',
                    'user.country_id',
                    'user.city_id',
                    'user.zipcode',
                    'user.languages',
                    'user.status',
                    'user.created_at',
                    'user.skype',
                    'user.whatsapp',
                    'user.website',
                    'user.email',
                    'user.introduction',
                    'user.teach_at_offline',
                    'user.teach_at_online',
                    'user.is_approved',
                ])
                .where('user.user_type = :user_type', { user_type: UserType.STUDENT })
                .getMany();
            return user;
        } catch (error) {
            await this.slackService.send('Error in getStudentListForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAdminUserForAdmin() {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .where('user.is_admin_users = :is_admin_users AND user.is_deleted= :isDeleted', { is_admin_users: true, isDeleted: false })
                .getMany();
            return user;
        } catch (error) {
            await this.slackService.send('Error in getAdminUserForAdmin', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAdminUserForAdminById(id) {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .where('user.is_admin_users = :is_admin_users AND user.id =:id AND user.is_deleted = :isDeleted', {
                    is_admin_users: true,
                    isDeleted: false,
                    id: id,
                })
                .leftJoinAndSelect('user.user_permission', 'user_permission', 'user_permission.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .getOne();
            return user;
        } catch (error) {
            await this.slackService.send('Error in getAdminUserForAdminById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async sendEmail(email: string, username: string, password: string) {
        const loginLink = `${this.configService.get<string>('ADMIN_URL')}/`;

        const content =
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<title>Login Details</title>' +
            '</head>' +
            '<body>' +
            '<p> Hello, </p>' +
            '<p>' +
            'You have been added to tutor admin panel by ' +
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
}
