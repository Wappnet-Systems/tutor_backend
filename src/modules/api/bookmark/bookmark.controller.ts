import { Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { PaginationOptions } from '../../../utils/constant';

@ApiTags('bookmark')
@ApiBearerAuth('access-token')
@Controller('bookmark')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) { }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get student bookmarks' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('')
    async getStudentBookmark(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        const bookmarkDetail = await this.bookmarkService.getUserBookmark(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, BookMark list'],
            data: { bookmarkDetail },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add bookmarks' })
    @Post('tutor/:id')
    async addBookmark(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        // check for duplicate bookmark
        const bookmark = await this.bookmarkService.getBookmarkByTutorAndUserId(id, req.user_id);
        if (!bookmark) {
            await this.bookmarkService.addBookmark({
                student_user_id: req.user_id,
                tutor_user_id: id,
            });
        }
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Bookmark Added'],
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add bookmarks' })
    @Delete('/:id')
    async deleteBookmark(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const bookmarkDetail = await this.bookmarkService.getUserBookmarkId(id, req.user_id);
        if (bookmarkDetail) {
            bookmarkDetail.is_deleted = true;
            await this.bookmarkService.updateBookmark(bookmarkDetail);
            return res.status(HttpStatus.OK).send({
                message: ['Success!, Bookmark Deleted'],
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).send({
                message: ['Bookmark does not exist.'],
            });
        }
    }
}
