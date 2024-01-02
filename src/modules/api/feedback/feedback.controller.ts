import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { Response } from 'express';
import { FeedbackDTO } from './dtos/feedback.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('feedback')
@ApiBearerAuth('access-token')
@Controller('feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @ApiOperation({ summary: 'Get feedback subjects' })
    @Get('subjects')
    async getStudentBookmark(@Req() req: any, @Res() res: Response) {
        const feedbackSubjects = await this.feedbackService.getFeedbackSubjects();
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Feedback Subject list'],
            data: { feedbackSubjects },
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Feedback' })
    @Post('')
    async addBookmark(@Req() req: any, @Body() payload: FeedbackDTO, @Res() res: Response) {
        const feedbackObj = {
            ...payload,
            user_id: req.user_id,
        };
        await this.feedbackService.addFeedback(feedbackObj);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Feedback Added'],
        });
    }
}
