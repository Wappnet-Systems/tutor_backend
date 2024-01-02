import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectCategory } from 'src/entities/subject-category.entity';
import { S3Service } from 'src/services/s3.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([SubjectCategory])],
    controllers: [CategoryController],
    providers: [CategoryService, SlackService, S3Service],
    exports: [CategoryService]
})
export class CategoryModule {}
