import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';
import { User } from 'src/entities/user.entity';
import { SubjectCategory } from 'src/entities/subject-category.entity';
import { Booking } from 'src/entities/booking.entity';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([SubjectCategory, User, Booking])],
    providers: [TutorService, SlackService],
    controllers: [TutorController],
})
export class TutorModule {}
