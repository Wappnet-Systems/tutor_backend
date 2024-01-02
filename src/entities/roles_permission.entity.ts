import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { Role } from './role.entity';
import { Modules } from './module.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'role-permission' })
export class RolePermission {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    role_id: number;

    @Column({ type: 'bigint' })
    module_id: number;

    @Column({ type: 'bigint' })
    permission_id: number;

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

    @ManyToOne(() => Role, (role) => role.role_permission)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Modules, (module) => module.role_permission)
    @JoinColumn({ name: 'module_id' })
    module: Modules;

    @ManyToOne(() => Permission, (permission) => permission.role_permission)
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;
}
