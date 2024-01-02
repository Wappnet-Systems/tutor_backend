import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { CronService } from './cron.service';
import { Response } from 'express';
import { BookingService } from '../booking/booking.service';
import { AssignmentService } from '../assigment/assignment.service';

@Controller('cron')
export class CronController {
    constructor(private cronService: CronService, private assignmentService: AssignmentService, private bookingService: BookingService) {}
    // send booking notifications
    @Get('booking-notifications')
    async sendBookingNotifications(@Res() res: Response) {
        await this.bookingService.sendBookingNotifications();
        return res.status(HttpStatus.OK);
    }

    // update booking status
    @Get('booking-status')
    async updateBookingStatus(@Res() res: Response) {
        await this.bookingService.startBookingStatus();
        await this.bookingService.completeBookingStatus();
        return res.status(HttpStatus.OK).json({
            status: true,
            message: ['Bookings updated'],
        });
    }

    // cancel the booking if payment is not completed or booking is not accepted before the start time
    @Get('booking-cancellation')
    async cancelBooking(@Res() res: Response) {
        await this.bookingService.cancelBooking();
        res.status(HttpStatus.OK).json({
            status: true,
            message: ['Bookings updated'],
        });
    }

    // mark the assignment as delayed at soon as it passes the time
    @Get('update-assignment')
    async updateAssignment(@Res() res: Response) {
        await this.assignmentService.markAssignmentAsDelayed();
        res.status(HttpStatus.OK).json({
            status: true,
            message: ['Assignments updated'],
        });
    }
}
