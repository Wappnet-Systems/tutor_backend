import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { User } from './user.entity';
import { Badge } from './badge.entity';
import { FeedbackSubject } from './feedback-subject.entity';

@Entity({ name: 'feedback' })
export class Feedback {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    feedback_subject_id: number;

    @Column({ length: 2000 })
    description: string;

    @Column({ length: 200, nullable: true })
    other_subject: string;

    @Column({ type: 'bigint' })
    user_id: number;

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

    @ManyToOne(() => FeedbackSubject, (feedback_subject) => feedback_subject.feedback)
    @JoinColumn({ name: 'feedback_subject_id' })
    feedback_subject: FeedbackSubject;

    @ManyToOne(() => User, (user) => user.feedback)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
