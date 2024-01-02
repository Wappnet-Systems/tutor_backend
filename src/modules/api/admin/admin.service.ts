import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { RequestStatusType, UserType } from 'src/utils/constant';
import { Repository } from 'typeorm';
import { PaginationOptions } from '../../../utils/constant';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(TutorApprovalRequest) private readonly tutorApprovalRequestRepository: Repository<TutorApprovalRequest>,
        private readonly slackService: SlackService,
    ) {}

    async getAllPendingApprovalRequest(pagination: PaginationOptions) {
        try {
            const requests = await this.tutorApprovalRequestRepository.find({
                where: { status: RequestStatusType.PENDING },
                relations: {
                    user: true,
                },
                order: { created_at: pagination.sort },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            return {
                data: requests,
                page: pagination.page,
                itemPerPage: pagination.limit,
                totalItem: await this.tutorApprovalRequestRepository.count({
                    where: {
                        status: RequestStatusType.PENDING,
                    },
                }),
            };
        } catch (error) {
            await this.slackService.send('Error in getAllPendingApprovalRequest', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateApprovalRequest(tutorApprovalRequestObj): Promise<TutorApprovalRequest> {
        try {
            const tutorApprovalRequestDetail = await this.tutorApprovalRequestRepository.save(tutorApprovalRequestObj);
            return tutorApprovalRequestDetail;
        } catch (error) {
            await this.slackService.send('Error in updateApprovalRequest', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getApprovalRequestById(id: number): Promise<TutorApprovalRequest> {
        try {
            const tutorApprovalRequestDetail = await this.tutorApprovalRequestRepository.findOne({
                where: { status: RequestStatusType.PENDING, is_deleted: false, id: id },
            });
            return tutorApprovalRequestDetail;
        } catch (error) {
            await this.slackService.send('Error in getApprovalRequestById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorAllTutors(pagination: PaginationOptions) {
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
                    'user.email_verified',
                    'user.skype',
                    'user.is_approved',
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
                        where: {
                            user_type: UserType.TUTOR,
                        },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getTutorAllTutors', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTutorAllStudents(pagination: PaginationOptions) {
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
                    'user.email_verified',
                    'user.skype',
                    'user.is_approved',
                ])
                .where('user.user_type = :user_type', { user_type: UserType.STUDENT })
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
                        where: {
                            user_type: UserType.STUDENT,
                        },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getTutorAllStudents', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
