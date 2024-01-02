import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { User } from './user.entity';
import { Assignment } from './assignment.entity';

@Entity({ name: 'assignment-submission-media' })
export class AssignmentSubmissionMedia {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    student_user_id: number;

    @Column({ type: 'bigint' })
    assignment_id: number;

    @Column({ length: 1000, nullable: true })
    media: string;

    @Column({ length: 100, nullable: true })
    media_type: string;

    @Column({ length: 1000 })
    description: string;

    @Column({ default: false })
    is_deleted: boolean;

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

    @ManyToOne(() => User, (user: User) => user.student_submission)
    @JoinColumn({ name: 'student_user_id' })
    user: User;

    @ManyToOne(() => Assignment, (assignment: Assignment) => assignment.submissions)
    @JoinColumn({ name: 'assignment_id' })
    assignment: Assignment;
}
