import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { User } from './user.entity';
import { AssignmentStatusType } from '../utils/constant';
import { AssignmentSubmissionMedia } from './assignment-submission.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'assignment' })
export class Assignment {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 1000 })
    title: string;

    @Column({ length: 1000 })
    description: string;

    @Column({ type: 'bigint' })
    tutor_user_id: number;

    @Column({ type: 'bigint' })
    student_user_id: number;

    @Column({ type: 'bigint' })
    booking_id: number;

    @Column({ type: 'datetime' })
    target_completion_date: Date;

    @Column({ type: 'datetime', nullable: true })
    actual_completion_date: Date;

    @Column({ default: AssignmentStatusType.PENDING })
    status: AssignmentStatusType;

    @Column({ length: 1000, nullable: true })
    media: string;

    @Column({ length: 100, nullable: true })
    media_type: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ length: 1000, default: '' })
    tutor_review: string;

    @ManyToOne(() => User, (user) => user.tutor_assignment)
    @JoinColumn({ name: 'tutor_user_id' })
    tutor: User;

    @ManyToOne(() => User, (user) => user.student_assignment)
    @JoinColumn({ name: 'student_user_id' })
    student: User;

    @ManyToOne(() => Booking, (booking) => booking.assignments)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @OneToMany(() => AssignmentSubmissionMedia, (assignment_submission: AssignmentSubmissionMedia) => assignment_submission.assignment)
    submissions: AssignmentSubmissionMedia[];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    updated_at: Date;
}
