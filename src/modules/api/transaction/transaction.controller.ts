import { Controller, Get, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { momentUTC } from 'src/helper/date';

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
    constructor(private transactionService: TransactionService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get counts' })
    @Get('stats')
    async getCounts(@Req() req: any, @Res() res: Response) {
        const count = await this.transactionService.getCounts(req.user_id);
        return res.status(HttpStatus.OK).send({
            data: count,
        });
    }

    @UseGuards(AuthGuard)
    @ApiQuery({ name: 'from_date', type: String, example: '25 Aug 2023', description: 'from date', required: false })
    @ApiQuery({ name: 'to_date', type: String, example: '25 Sep 2023', description: 'to date', required: false })
    @ApiOperation({ summary: 'Get tutor earning' })
    @Get('earnings')
    async getEarnings(@Req() req: any, @Query() query: any, @Res() res: Response) {
        if (query.from_date) {
            query.from_date = momentUTC(query.from_date);
        }
        if (query.to_date) {
            query.to_date = momentUTC(query.to_date);
            query.to_date = new Date(new Date(query.to_date).setHours(23, 59, 59));
        }
        const earnings = await this.transactionService.getEarnings(req.user_id, query.from_date, query.to_date);
        return res.status(HttpStatus.OK).send({
            data: earnings,
        });
    }
}
