import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GenderType, StatusType, UserType } from '../utils/constant';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { TutorApprovalRequest } from './tutor-approval-request.entity';
import { TutorEducation } from './tutor-education.entity';
import { TutorMediaGallery } from './tutor-media-gallery.entity';
import { TutorSubject } from './tutor-subject.entity';
import { Country } from './country.entity';
import { City } from './city.entity';
import { Booking } from './booking.entity';
import { Bookmark } from './bookmark.entity';
import { Assignment } from './assignment.entity';
import { AssignmentSubmissionMedia } from './assignment-submission.entity';
import { Review } from './review.entity';
import { Todo } from './todo.entity';
import { Notification } from './notification.entity';
import { TutorPostcode } from './tutor-postcode.entity';
import { TutorAvailability } from './tutor-availability.entity';
import { Transaction } from './transaction.entity';
import { TutorBadges } from './tutor_badges.entity';
import { Conversation } from './conversation.entity';
import { Feedback } from './feedback.entity';
import { UserPermission } from './user-permission.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'enum', enum: UserType, default: UserType.STUDENT })
    user_type: UserType;

    @Column({ length: 50, unique: true })
    email: string;

    @Column({ length: 80 })
    first_name: string;

    @Column({ length: 80 })
    last_name: string;

    @Column({ length: 1000, nullable: true })
    image: string;

    @Column({ type: 'date', nullable: true })
    dob: Date;

    @Column({ length: 10 })
    contact_number: string;

    @Column({ length: 80 })
    password: string;

    @Column({ length: 1000, nullable: true })
    tag_line: string;

    @Column({ nullable: true })
    hourly_rate: number;

    @Column({ nullable: true })
    hourly_rate2: number;

    @Column({ nullable: true })
    hourly_rate3: number;

    @Column({ type: 'enum', enum: GenderType })
    gender: GenderType;

    @Column({ nullable: true })
    avg_rating: number;

    @Column({ length: 100, nullable: true })
    address_line_one: string;

    @Column({ length: 100, nullable: true })
    address_line_two: string;

    @Column({ type: 'bigint', nullable: true })
    country_id: number;

    @Column({ type: 'bigint', nullable: true })
    city_id: number;

    @Column({ length: 10, nullable: true })
    zipcode: string;

    @Column({ length: 100, nullable: true })
    languages: string;

    @Column({ length: 100, nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    lat: string;

    @Column({ length: 100, nullable: true })
    lng: string;

    @Column({ length: 100, default: '' })
    skype: string;

    @Column({ length: 100, default: '' })
    whatsapp: string;

    @Column({ length: 100, default: '' })
    website: string;

    @Column({ length: 2000, default: '' })
    introduction: string;

    // default fields
    @Column({ length: 1000, default: 'Email verification pending' })
    remarks: string;

    @Column({ type: 'bigint', nullable: true })
    enrollment: number;

    @Column({ default: 0 })
    total_reviews: number;

    @Column({ default: false })
    email_verified: boolean;

    @Column({ default: false })
    teach_at_online: boolean;

    @Column({ default: false })
    teach_at_offline: boolean;

    @Column({ default: false })
    is_approved: boolean;

    @Column({ default: false })
    is_password_reset_requested: boolean;

    @Column({ default: false })
    is_force_password_reset: boolean;

    @Column({ default: false })
    is_admin_users: boolean;

    @Column({ default: false })
    is_super_admin: boolean;

    @Column({ type: 'enum', enum: StatusType, default: StatusType.INACTIVE })
    status: number;

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

    @OneToOne(() => TutorApprovalRequest, (approval_request: TutorApprovalRequest) => approval_request.user)
    approval_request: TutorApprovalRequest;

    @OneToMany(() => TutorEducation, (education_details: TutorEducation) => education_details.user)
    education_details: TutorEducation;

    @OneToMany(() => TutorAvailability, (tutor_availability: TutorAvailability) => tutor_availability.user)
    tutor_availability: TutorAvailability;

    @OneToMany(() => TutorMediaGallery, (media_gallery: TutorMediaGallery) => media_gallery.user)
    media_gallery: TutorMediaGallery;

    @OneToMany(() => TutorSubject, (tutorSubject) => tutorSubject.user)
    tutor_subjects: TutorSubject[];

    @OneToMany(() => TutorPostcode, (tutorPostcode) => tutorPostcode.user)
    tutor_postcodes: TutorPostcode[];

    @OneToMany(() => UserPermission, (user_permission) => user_permission.user)
    user_permission: UserPermission[];

    @ManyToOne(() => Country, (country_details) => country_details.user)
    @JoinColumn({ name: 'country_id' })
    country_details: Country;

    @ManyToOne(() => City, (city_details) => city_details.user)
    @JoinColumn({ name: 'city_id' })
    city_details: City;

    @OneToMany(() => Booking, (booking) => booking.tutor)
    tutor_bookings: Booking[];

    @OneToMany(() => Booking, (booking) => booking.student)
    student_bookings: Booking[];

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => Bookmark, (bookmark) => bookmark.tutor)
    student_bookmarks: Bookmark[];

    @OneToMany(() => Assignment, (assignment) => assignment.student)
    student_assignment: Assignment[];

    @OneToMany(() => Assignment, (assignment) => assignment.tutor)
    tutor_assignment: Assignment[];

    @OneToMany(() => AssignmentSubmissionMedia, (assignment) => assignment.user)
    student_submission: AssignmentSubmissionMedia[];

    @OneToMany(() => Review, (review) => review.student)
    reviews_given: Review[];

    @OneToMany(() => Review, (review) => review.tutor)
    reviews: Review[];

    @OneToMany(() => Todo, (todo) => todo.user)
    todos: Todo[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => TutorBadges, (tutor_badge) => tutor_badge.tutor)
    tutor_badge: TutorBadges[];

    @OneToMany(() => Conversation, (conversation) => conversation.student)
    student_conversations: Conversation[];

    @OneToMany(() => Conversation, (conversation) => conversation.tutor)
    tutor_conversations: Conversation[];

    @OneToMany(() => Feedback, (feedback) => feedback.user)
    feedback: Feedback[];
}
