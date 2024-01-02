export enum UserType {
    'ADMIN' = 1,
    'TUTOR' = 2,
    'STUDENT' = 3,
}

export enum StatusType {
    'ACTIVE' = 1,
    'INACTIVE' = 2,
}

export const CHAT_DOCUMENT_BASE_PATH = 'public/tutor/chat/';

export const CHAT_DOCUMENT_TYPES = ['png', 'jpg', 'jpeg', 'mp3', 'mp4', 'wav', 'pdf', 'docx', 'xlsx'];
export const CHAT_DOCUMENT_SIZE = 3000000;

export enum RequestStatusType {
    'PENDING' = 0,
    'ACCEPTED' = 1,
    'REJECTED' = 2,
}

export enum AvailabilityStatusType {
    'OPEN' = 0,
    'BOOKED' = 1,
    'CANCELLED' = 2,
}

export enum BookingStatusType {
    'PENDING' = 0,
    'ACCEPTED' = 1,
    'REJECTED' = 2,
    'PAYMENT_PENDING' = 3,
    'ONGOING' = 4,
    'COMPLETED' = 5,
    'CANCELLED' = 6,
    'PAYMENT_FAILED' = 7,
    'PAYMENT_COMPLETED' = 8,
}

export enum AssignmentStatusType {
    'PENDING' = 0,
    'COMPLETED' = 1,
    'DELAYED' = 2,
    'CANCELLED' = 3,
}

export enum GenderType {
    'MALE' = 1,
    'FEMALE' = 2,
    'OTHER' = 3,
}

export enum TutorBookingStatusType {
    'ACCEPTED' = 1,
    'REJECTED' = 2,
}

export enum BookingModes {
    'ONLINE' = 1,
    'OFFLINE' = 2,
}

export type PaginationOptions = {
    page: number;
    limit: number;
    sort: 'ASC' | 'DESC';
    search?: string;
};

export enum PaymentStatusType {
    'PENDING' = 0,
    'SUCCESS' = 1,
    'FAILED' = 2,
}

export const AVATAR_FILE_BASE_PATH = 'public/tutor/avatar/';
export const MEDIA_FILE_BASE_PATH = 'public/tutor/media/';
export const ASSIGNMENT_FILE_BASE_PATH = 'public/tutor/assignment/';
export const CATEGORY_FILE_BASE_PATH = 'public/tutor/category/';
export const jwtSecret = 'kghedy3uj3st12923842yuj29h9829hfo9ofhqwa3u090hjfa08ij87nq';
