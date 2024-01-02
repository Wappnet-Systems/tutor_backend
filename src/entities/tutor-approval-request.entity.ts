import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { RequestStatusType } from '../utils/constant';
import { User } from './user.entity';

@Entity({ name: 'tutor-approval-request' })
export class TutorApprovalRequest {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ default: RequestStatusType.PENDING })
    status: RequestStatusType;

    @Column({ length: 1000, default: '' })
    remarks: string;

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

    @OneToOne(() => User, (user: User) => user.approval_request)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
