import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) {}

    @ApiOperation({ summary: 'Webhook for stripe' })
    @Post('update')
    async updatePayment(@Req() req: any, @Body() payload: any, @Res() response: Response) {
        await this.paymentService.updateTransaction(payload);
        return response.status(HttpStatus.OK).send({ message: 'Success' });
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create Payment Intent For Booking' })
    @Get('/:id')
    async createPayments(@Param('id') id: number, @Req() req: any, @Res() response: Response) {
        const bookingDetail = await this.paymentService.getBookingById(id, req.user_id);
        if (bookingDetail) {
            let transaction_detail = await this.paymentService.getTransactionByBookingId(id, req.user_id);
            if (!transaction_detail) {
                transaction_detail = {
                    txn_amount: bookingDetail.total_amount,
                    user_id: req.user_id,
                    booking_id: bookingDetail.id,
                    stripe_payment_intent_id: '',
                };
            }
            const res = await this.paymentService.createPayment(100, transaction_detail);
            response.status(HttpStatus.CREATED).json(res);
        } else {
            return response.status(HttpStatus.OK).send({
                message: ['Booking does not exist'],
                data: { bookingDetail },
            });
        }
    }
}
