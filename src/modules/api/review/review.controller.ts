import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ReviewDTO } from './dtos/review.dto';
import { BookingService } from '../booking/booking.service';
import { Response } from 'express';
import { UpdateReviewDTO } from './dtos/update-review.dto';
import { PaginationOptions } from 'src/utils/constant';
import { momentUTC } from 'src/helper/date';
import { BadgesService } from '../badges/badges.service';

@ApiTags('review')
@ApiBearerAuth('access-token')
@Controller('review')
export class ReviewController {
    constructor(private reviewService: ReviewService, private bookingService: BookingService, private badgeService: BadgesService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Review' })
    @ApiBody({ type: ReviewDTO })
    @Post('')
    async addReview(@Req() req: any, @Body() payload: ReviewDTO, @Res() res: Response) {
        const bookingDetail = await this.bookingService.getBookingByIdForReview(payload.booking_id);
        const bookingUserDetail = await this.bookingService.getBookingUserByIdForReview(payload.booking_id, req.user_id);
        if (bookingDetail && bookingUserDetail) {
            let reviewDetail = await this.reviewService.getReviewByUserIdAndBookingId(payload.booking_id, req.user_id);
            if (reviewDetail) {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Review Already exist for this booking'],
                });
            }

            if (payload.rating >= 1 && payload.rating <= 5) {
                const reviewObj = {
                    remarks: payload.remarks,
                    rating: payload.rating,
                    booking_id: payload.booking_id,
                    user_id: req.user_id,
                    tutor_user_id: bookingDetail.tutor_user_id,
                };
                reviewDetail = await this.reviewService.addReview(reviewObj);

                await this.reviewService.updateUserRating(bookingDetail.tutor_user_id);
                await this.badgeService.addBadgeToUser(reviewDetail.tutor_user_id);
                delete reviewDetail.updated_at;
                delete reviewDetail.created_at;
                delete reviewDetail.is_deleted;
                delete reviewDetail.id;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Review Added'],
                    data: reviewDetail,
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Rating can only be between 1 to 5'],
                });
            }
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Booking does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update Review' })
    @ApiBody({ type: UpdateReviewDTO })
    @Put('/:id')
    async updateReview(@Param('id') id: number, @Req() req: any, @Body() payload: UpdateReviewDTO, @Res() res: Response) {
        let reviewDetail = await this.reviewService.getReviewByUserIdAndId(id, req.user_id);
        if (reviewDetail) {
            if (payload.rating >= 1 && payload.rating <= 5) {
                reviewDetail.rating = payload.rating;
                reviewDetail.remarks = payload.remarks;

                reviewDetail = await this.reviewService.updateReview(reviewDetail);

                await this.reviewService.updateUserRating(reviewDetail.tutor_user_id);
                await this.badgeService.addBadgeToUser(reviewDetail.tutor_user_id);
                delete reviewDetail.updated_at;
                delete reviewDetail.created_at;
                delete reviewDetail.is_deleted;
                delete reviewDetail.id;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Review Updated'],
                    data: reviewDetail,
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).send({
                    message: ['Rating can only be between 1 to 5'],
                });
            }
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Review does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Review' })
    @Delete('/:id')
    async deleteReview(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        let reviewDetail = await this.reviewService.getReviewByUserIdAndId(id, req.user_id);
        if (reviewDetail) {
            reviewDetail.is_deleted = true;
            reviewDetail = await this.reviewService.updateReview(reviewDetail);

            await this.reviewService.updateUserRating(reviewDetail.tutor_user_id);

            delete reviewDetail.updated_at;
            delete reviewDetail.created_at;
            delete reviewDetail.is_deleted;
            delete reviewDetail.id;

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Review Deleted'],
                data: reviewDetail,
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).send({
                message: ['Review does not exist.'],
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Review for Booking' })
    @Get('booking/:id')
    async getReviewForBooking(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        const reviewDetail = await this.reviewService.getReviewDetailByBookingId(id, req.user_id);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Review'],
            data: reviewDetail,
        });
    }

    @ApiOperation({ summary: 'Get All Review for tutor' })
    @Get('tutor/:id')
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    async getReviewForTutor(@Param('id') id: number, @Query() query: PaginationOptions, @Res() res: Response) {
        const reviewDetail = await this.reviewService.getAllReviewsForTutor(id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Review'],
            data: reviewDetail,
        });
    }
}
