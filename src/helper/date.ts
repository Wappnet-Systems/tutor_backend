import * as moment from 'moment-timezone';

export const formatDate = (date?: Date | string | number): string => {
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD');
};

export const newDate = (): string => {
    return formatDate();
};

export const timeStamp = (date?: Date | string | number): string => {
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};

export const stringToDate = (date: string): Date => {
    return moment(date).tz('Asia/Kolkata').toDate();
};

export const dateToUTC = (date): string => {
    return new Date(date).toUTCString();
};

export const momentUTC = (date) => {
    return moment(date).utc().toDate();
};
