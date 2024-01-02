import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { momentUTC } from '../helper/date';
import { User } from './user.entity';
import { ChatMessage } from './chat-messages.entity';

@Entity({ name: 'conversations' })
export class Conversation {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    tutor_user_id: number;

    @Column({ type: 'bigint' })
    student_user_id: number;

    @Column({ type: 'datetime' })
    conversation_end_date: Date;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ default: false })
    is_disabled: boolean;

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

    @ManyToOne(() => User, (user) => user.student_conversations)
    @JoinColumn({ name: 'student_user_id' })
    student: User;

    @ManyToOne(() => User, (user) => user.tutor_conversations)
    @JoinColumn({ name: 'tutor_user_id' })
    tutor: User;

    @OneToMany(() => ChatMessage, (chat_messages) => chat_messages.conversation)
    chat_messages: ChatMessage[];
}
