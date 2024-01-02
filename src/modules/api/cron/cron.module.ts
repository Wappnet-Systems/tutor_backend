import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { BookingModule } from '../booking/booking.module';
import { AssignmentModule } from '../assigment/assignment.module';

@Module({
    imports: [BookingModule, AssignmentModule],
    providers: [CronService],
    controllers: [CronController],
})
export class CronModule {}
