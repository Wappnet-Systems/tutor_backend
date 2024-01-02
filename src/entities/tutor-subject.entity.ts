import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { User } from './user.entity';
import { SubjectCategory } from './subject-category.entity';
import { Subject } from './subject.entity';

@Entity({ name: 'tutor-subject' })
export class TutorSubject {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    category_id: number;

    @Column({ type: 'bigint' })
    subject_id: number;

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

    @ManyToOne(() => User, (user) => user.tutor_subjects)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => SubjectCategory, (subject_category) => subject_category.tutor_subject)
    @JoinColumn({ name: 'category_id' })
    subject_category: SubjectCategory;

    @ManyToOne(() => Subject, (subject) => subject.tutor_subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;
}
