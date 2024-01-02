import { Controller, Get, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TutorService } from './tutor.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../auth/user.guard';

@Controller('tutor')
@ApiTags('tutor')
export class TutorController {
    constructor(private readonly tutorService: TutorService) {}

    @Get('top_rated')
    @UseGuards(UserGuard)
    @ApiOperation({ summary: 'Get top-rated Tutor' })
    async getTopRatedTutor(@Req() req: any, @Res() res: Response) {
        const topRatedTutor = await this.tutorService.getTopRatedTutor(req?.user_id ?? 0);
        return res.status(HttpStatus.OK).send({
            data: topRatedTutor,
        });
    }

    @Get('top_experienced')
    @ApiOperation({ summary: 'Get top-experienced Tutor' })
    async getTopExperiencedTutor(@Res() res: Response) {
        const topExperiencedTutor = await this.tutorService.getTopExperiencedTutor();
        return res.status(HttpStatus.OK).send({
            data: topExperiencedTutor,
        });
    }

    @Get('new')
    @ApiOperation({ summary: 'Get new Tutors' })
    async getNewTutor(@Res() res: Response) {
        const topRatedTutor = await this.tutorService.getNewTutor();
        return res.status(HttpStatus.OK).send({
            data: topRatedTutor,
        });
    }

    @Get('category')
    @ApiOperation({ summary: 'Get category' })
    async getPopularCategory(@Res() res: Response) {
        const topCategories = await this.tutorService.getPopularCategories();
        return res.status(HttpStatus.OK).send({
            data: topCategories,
        });
    }

    @Get()
    @UseGuards(UserGuard)
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'item per page' })
    @ApiQuery({ name: 'search', type: String, example: 'john', description: 'search by tutor name', required: false })
    @ApiQuery({ name: 'category', type: String, example: '1,2', description: 'category ids', required: false })
    @ApiQuery({ name: 'subject', type: String, example: '1,2', description: 'subject ids', required: false })
    @ApiQuery({ name: 'postcode', type: String, example: '1,2', description: 'postcode ids', required: false })
    @ApiQuery({ name: 'hourly_rate_min', type: Number, example: 20, description: 'minimum hour rate', required: false })
    @ApiQuery({ name: 'hourly_rate_max', type: Number, example: 40, description: 'maximum hour rate', required: false })
    @ApiQuery({ name: 'gender', type: Number, example: 1, description: 'Male: 1, Female: 2, Other: 3', required: false })
    @ApiQuery({ name: 'rating', type: Number, example: 1, description: 'rating 1 to 5', required: false })
    @ApiQuery({ name: 'location', type: String, example: 'Ahmadabad', description: 'city and country name', required: false })
    @ApiQuery({ name: 'booking_type', type: String, example: 'online', description: 'online | offline', required: false })
    @ApiOperation({ summary: 'Get Tutors' })
    async getAllTutors(@Req() req: any, @Query() query: any, @Res() res: Response) {
        const tutors = await this.tutorService.getTutors(query, req?.user_id ?? 0);
        return res.status(HttpStatus.OK).send({
            data: tutors,
        });
    }

    @Get('counts')
    @ApiOperation({ summary: 'Get counts' })
    async getCounts(@Res() res: Response) {
        const topExperiencedTutor = await this.tutorService.getCounts();
        return res.status(HttpStatus.OK).send({
            data: topExperiencedTutor,
        });
    }

    //3 related tutor
}
