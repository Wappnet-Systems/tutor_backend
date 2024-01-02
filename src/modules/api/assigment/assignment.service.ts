import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentSubmissionMedia } from 'src/entities/assignment-submission.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { momentUTC } from 'src/helper/date';
import { SlackService } from 'src/services/slack.service';
import { AssignmentStatusType, BookingStatusType, PaginationOptions } from 'src/utils/constant';
import { Between, In, Repository } from 'typeorm';

@Injectable()
export class AssignmentService {
    constructor(
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        @InjectRepository(AssignmentSubmissionMedia) private readonly assignmentSubmissionRepository: Repository<AssignmentSubmissionMedia>,
        private slackService: SlackService,
    ) {}

    async addAssignment(assignmentObj): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository.save(assignmentObj);
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in addAssignment', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateAssignment(assignmentObj): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository.save(assignmentObj);
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in updateAssignment', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentByIdAndUserId(id: number, user_id: number): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository.findOne({
                where: { is_deleted: false, id: id, tutor_user_id: user_id },
            });
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentByIdAndUserId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentByIdAndStudentId(id: number, user_id: number): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository.findOne({
                where: { is_deleted: false, id: id, student_user_id: user_id },
            });
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentByIdAndStudentId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addAssignmentSubmission(assignmentSubmissionObj): Promise<AssignmentSubmissionMedia> {
        try {
            const assignmentSubmissionDetail = await this.assignmentSubmissionRepository.save(assignmentSubmissionObj);
            return assignmentSubmissionDetail;
        } catch (error) {
            await this.slackService.send('Error in addAssignmentSubmission', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateAssignmentSubmission(assignmentSubmissionObj): Promise<AssignmentSubmissionMedia> {
        try {
            const assignmentSubmissionDetail = await this.assignmentSubmissionRepository.save(assignmentSubmissionObj);
            return assignmentSubmissionDetail;
        } catch (error) {
            await this.slackService.send('Error in updateAssignmentSubmission', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentSubmissionByIdAndUserId(id: number, user_id: number): Promise<AssignmentSubmissionMedia> {
        try {
            const assignmentSubmissionDetail = await this.assignmentSubmissionRepository.findOne({
                where: { is_deleted: false, id: id, student_user_id: user_id },
            });
            return assignmentSubmissionDetail;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentSubmissionByIdAndUserId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentDetailForStudent(id: number, user_id: number): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository
                .createQueryBuilder('assignment')
                .where({ is_deleted: false, student_user_id: user_id, id: id })
                .leftJoinAndSelect('assignment.booking', 'booking')
                .leftJoinAndSelect('assignment.submissions', 'submissions', 'submissions.is_deleted = :is_deleted', {
                    is_deleted: false,
                })
                .leftJoinAndSelect('assignment.student', 'student')
                .leftJoinAndSelect('assignment.tutor', 'tutor')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'assignment.id',
                    'assignment.title',
                    'assignment.description',
                    'assignment.status',
                    'assignment.media',
                    'assignment.media_type',
                    'assignment.tutor_review',
                    'assignment.target_completion_date',
                    'assignment.actual_completion_date',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'submissions.id',
                    'submissions.media',
                    'submissions.created_at',
                    'submissions.description',
                    'submissions.media_type',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.image',
                    'student.email',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.image',
                    'tutor.email',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ])
                .getOne();
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentDetailForStudent', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentDetailForTutor(id: number, user_id: number): Promise<Assignment> {
        try {
            const assignmentDetail = await this.assignmentRepository
                .createQueryBuilder('assignment')
                .where({ is_deleted: false, tutor_user_id: user_id, id: id })
                .leftJoinAndSelect('assignment.booking', 'booking')
                .leftJoinAndSelect('assignment.submissions', 'submissions', 'submissions.is_deleted = :is_deleted', {
                    is_deleted: false,
                })
                .leftJoinAndSelect('assignment.tutor', 'tutor')
                .leftJoinAndSelect('assignment.student', 'student')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'assignment.id',
                    'assignment.title',
                    'assignment.description',
                    'assignment.status',
                    'assignment.media',
                    'assignment.media_type',
                    'assignment.tutor_review',
                    'assignment.target_completion_date',
                    'assignment.actual_completion_date',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'submissions.id',
                    'submissions.media',
                    'submissions.created_at',
                    'submissions.description',
                    'submissions.media_type',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.image',
                    'tutor.email',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.image',
                    'student.email',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ])
                .getOne();
            return assignmentDetail;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentDetailForTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentsForStudent(user_id: number, pagination: PaginationOptions) {
        try {
            const assignmentDetail = await this.assignmentRepository
                .createQueryBuilder('assignment')
                .where({ is_deleted: false, student_user_id: user_id })
                .leftJoinAndSelect('assignment.booking', 'booking')
                .leftJoinAndSelect('assignment.submissions', 'submissions')
                .leftJoinAndSelect('assignment.student', 'student')
                .leftJoinAndSelect('assignment.tutor', 'tutor')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'assignment.id',
                    'assignment.title',
                    'assignment.description',
                    'assignment.status',
                    'assignment.media',
                    'assignment.media_type',
                    'assignment.tutor_review',
                    'assignment.target_completion_date',
                    'assignment.actual_completion_date',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'submissions.id',
                    'submissions.media',
                    'submissions.created_at',
                    'submissions.description',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.image',
                    'student.email',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.image',
                    'tutor.email',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ])
                .orderBy('assignment.id', pagination.sort)
                .skip((pagination.page - 1) * pagination.limit)
                .take(pagination.limit)
                .getMany();

            if (assignmentDetail.length) {
                return {
                    data: assignmentDetail,
                    page: pagination.page,
                    itemPerPage: pagination.limit,
                    totalItem: await this.assignmentRepository.count({
                        where: { is_deleted: false, student_user_id: user_id },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentsForStudent', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAssignmentsForTutor(user_id: number, pagination: PaginationOptions) {
        try {
            const assignmentDetail = await this.assignmentRepository
                .createQueryBuilder('assignment')
                .where({ is_deleted: false, tutor_user_id: user_id })
                .leftJoinAndSelect('assignment.booking', 'booking')
                .leftJoinAndSelect('assignment.submissions', 'submissions')
                .leftJoinAndSelect('assignment.tutor', 'tutor')
                .leftJoinAndSelect('assignment.student', 'student')
                .leftJoinAndSelect('booking.bookingSubjects', 'booking_subjects')
                .leftJoinAndSelect('booking_subjects.subject', 'subject')
                .select([
                    'assignment.id',
                    'assignment.title',
                    'assignment.description',
                    'assignment.status',
                    'assignment.target_completion_date',
                    'assignment.actual_completion_date',
                    'assignment.media',
                    'assignment.media_type',
                    'assignment.tutor_review',
                    'booking.id',
                    'booking.booking_start_date',
                    'booking.booking_end_date',
                    'booking.status',
                    'submissions.id',
                    'submissions.media',
                    'submissions.created_at',
                    'submissions.description',
                    'tutor.id',
                    'tutor.first_name',
                    'tutor.last_name',
                    'tutor.image',
                    'tutor.email',
                    'student.id',
                    'student.first_name',
                    'student.last_name',
                    'student.image',
                    'student.email',
                    'booking_subjects.id',
                    'subject.subject_name',
                    'subject.id',
                ])
                .orderBy('assignment.id', pagination.sort)
                .skip((pagination.page - 1) * pagination.limit)
                .take(pagination.limit)
                .getMany();
            if (assignmentDetail.length) {
                return {
                    data: assignmentDetail,
                    page: pagination.page,
                    itemPerPage: pagination.limit,
                    totalItem: await this.assignmentRepository.count({
                        where: { is_deleted: false, tutor_user_id: user_id },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAssignmentsForTutor', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async markAssignmentAsDelayed() {
        const currentTime = momentUTC(new Date());
        const oneMinuteFromNow = momentUTC(new Date(currentTime.getTime() + 1 * 60000));
        const assignments = await this.assignmentRepository
            .createQueryBuilder('assignment')
            .andWhere('assignment.target_completion_date >= :startDate', { startDate: currentTime })
            .andWhere('assignment.target_completion_date <= :endDate', { endDate: oneMinuteFromNow })
            .getMany();

        for (let index = 0; index < assignments.length; index++) {
            const assignment = assignments[index];
            assignment.status = AssignmentStatusType.DELAYED;
            await this.assignmentRepository.save(assignment);
        }
    }
}
