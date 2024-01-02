import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('postcode')
@Controller('postcode')
export class PostcodeController {
    constructor(private postcodeService: PostcodeService) {}

    @ApiOperation({ summary: 'Get all postcodes' })
    @Get('')
    async getAllLanguages(@Res() res: Response) {
        const postcodes = await this.postcodeService.getAllPostcode();
        return res.status(HttpStatus.OK).send({
            data: postcodes,
        });
    }
}
