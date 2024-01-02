import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { Bookmark } from 'src/entities/bookmark.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from 'src/services/slack.service';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Bookmark])],
    controllers: [BookmarkController],
    providers: [BookmarkService, SlackService],
})
export class BookmarkModule {}
