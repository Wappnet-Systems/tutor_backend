import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { Conversation } from './conversation.entity';

@Entity({ name: 'chat_messages' })
export class ChatMessage {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    sender: number;

    @Column({ type: 'bigint' })
    conversation_id: number;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    document: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    document_type: string;

    @Column({ type: 'tinyint', default: false })
    is_read: boolean;

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

    @ManyToOne(() => Conversation, (conversation) => conversation.chat_messages)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;
}
