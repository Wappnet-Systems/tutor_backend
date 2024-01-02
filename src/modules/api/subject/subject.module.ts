import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { ConfigModule } from '@nestjs/config';
import { Subject } from 'src/entities/subject.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Subject])],
    providers: [SubjectService, SlackService],
    controllers: [SubjectController],
    exports: [SubjectService],
})
export class SubjectModule {}
