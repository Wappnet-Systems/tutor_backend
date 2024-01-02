import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Modules } from 'src/entities/module.entity';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/roles_permission.entity';
import { Subject } from 'src/entities/subject.entity';
import { TutorApprovalRequest } from 'src/entities/tutor-approval-request.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { RequestStatusType, UserType } from 'src/utils/constant';
import { Repository } from 'typeorm';
import { UserService } from '../api/user/user.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Subject) private readonly subjectRepository: Repository<Subject>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(RolePermission) private readonly rolePermissionRepository: Repository<RolePermission>,
        @InjectRepository(Modules) private readonly moduleRepository: Repository<Modules>,
        @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(TutorApprovalRequest) private readonly tutorApprovalRequestRepository: Repository<TutorApprovalRequest>,
        private readonly slackService: SlackService,
        private readonly userService: UserService,
    ) {}

    async getDashboardData() {
        try {
            let studentCount = 0;
            let tutorCount = 0;
            let subjectCount = 0;
            let bookingsCount = 0;

            studentCount = await this.userRepository.count({
                where: { user_type: UserType.STUDENT, is_deleted: false, email_verified: true },
            });

            tutorCount = await this.userRepository.count({
                where: { user_type: UserType.TUTOR, is_deleted: false, email_verified: true, is_approved: true },
            });

            subjectCount = await this.subjectRepository.count({
                where: { is_deleted: false },
            });

            bookingsCount = await this.bookingRepository.count({
                where: { is_deleted: false },
            });

            return {
                studentCount: studentCount,
                tutorCount: tutorCount,
                subjectCount: subjectCount,
                bookingsCount: bookingsCount,
            };
        } catch (error) {
            await this.slackService.send('Error in getDashboardData', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllPendingApprovalRequest() {
        try {
            const requests = await this.tutorApprovalRequestRepository.find({
                where: { status: RequestStatusType.PENDING },
                relations: {
                    user: true,
                },
            });
            return requests;
        } catch (error) {
            await this.slackService.send('Error in getAllPendingApprovalRequest', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllRoles() {
        try {
            const roles = await this.roleRepository.find({
                where: { is_deleted: false },
            });
            return roles;
        } catch (error) {
            await this.slackService.send('Error in getAllRoles', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllModules() {
        try {
            const roles = await this.moduleRepository.find({
                where: { is_deleted: false },
            });
            return roles;
        } catch (error) {
            await this.slackService.send('Error in getAllModules', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllPermission() {
        try {
            const roles = await this.permissionRepository.find({
                where: { is_deleted: false },
            });
            return roles;
        } catch (error) {
            await this.slackService.send('Error in getAllPermission', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getRoleById(id) {
        try {
            const role = this.roleRepository
                .createQueryBuilder('role')
                .where('role.id = :id AND role.is_deleted = :is_deleted', { id: id, is_deleted: false })
                .getOne();
            return role;
        } catch (error) {
            await this.slackService.send('Error in getRoleById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getRoleByName(name) {
        try {
            const role = this.roleRepository
                .createQueryBuilder('role')
                .where('role.role_name = :name AND role.is_deleted = :is_deleted', { name: name, is_deleted: false })
                .getOne();
            return role;
        } catch (error) {
            await this.slackService.send('Error in getRoleByName', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getRolePermissionByRoleId(id) {
        try {
            const permission = await this.rolePermissionRepository
                .createQueryBuilder('role_permission')
                .where('role_permission.role_id = :id AND role_permission.is_deleted= :is_deleted', { id: id, is_deleted: false })
                .leftJoinAndSelect('role_permission.module', 'module')
                .leftJoinAndSelect('role_permission.permission', 'permission')
                .getMany();

            return permission;
        } catch (error) {
            await this.slackService.send('Error in getRolePermissionByRoleId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getRolePermissionForAdminByRoleId(id) {
        try {
            const permission = await this.rolePermissionRepository
                .createQueryBuilder('role_permission')
                .where('role_permission.role_id = :id AND role_permission.is_deleted= :is_deleted', { id: id, is_deleted: false })
                .getMany();

            return permission;
        } catch (error) {
            await this.slackService.send('Error in getRolePermissionForAdminByRoleId', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateRole(roleObj): Promise<Role> {
        try {
            const roleDetails = await this.roleRepository.save(roleObj);
            return roleDetails;
        } catch (error) {
            await this.slackService.send('Error in updateRole', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addRole(roleObj): Promise<Role> {
        try {
            const roleDetails = await this.roleRepository.save(roleObj);
            return roleDetails;
        } catch (error) {
            await this.slackService.send('Error in addRole', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateRolePermission(rolePermissionObj): Promise<RolePermission> {
        try {
            const rolePermissionDetails = await this.rolePermissionRepository.save(rolePermissionObj);
            return rolePermissionDetails;
        } catch (error) {
            await this.slackService.send('Error in updateRolePermission', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async addRolePermission(rolePermissionObj): Promise<RolePermission> {
        try {
            const rolePermissionDetails = await this.rolePermissionRepository.save(rolePermissionObj);
            return rolePermissionDetails;
        } catch (error) {
            await this.slackService.send('Error in addRolePermission', true);
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

    async checkForPermission(username, moduleName) {
        const user = await this.userService.getUserByEmailWithRole(username);
        const role = await this.getRoleById(user.user_permission[0]?.role_id);
        const role_permissions = await this.getRolePermissionByRoleId(role?.id);

        const modules = await this.getAllModules();
        const permissions = await this.getAllPermission();

        for (let index = 0; index < modules.length; index++) {
            const module = modules[index];
            module['permissions'] = [];
            for (let index2 = 0; index2 < permissions.length; index2++) {
                const permission = permissions[index2];
                let isAllowed = false;
                for (let index3 = 0; index3 < role_permissions.length; index3++) {
                    const role_permission = role_permissions[index3];
                    if ((role_permission.module_id == module.id && role_permission.permission_id == permission.id) || user.is_super_admin == true) {
                        isAllowed = true;
                    }
                }
                module['permissions'].push({
                    ...permission,
                    isSelected: user.is_super_admin ? true : isAllowed,
                });
            }
        }

        const selectedModule = modules.filter((module) => {
            if (module.module_name === moduleName) {
                return module;
            }
        });

        return selectedModule[0];
    }
}
