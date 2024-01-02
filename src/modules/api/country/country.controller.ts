import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CountryDTO } from './dtos/country.dto';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CountryService } from './country.service';

@ApiTags('country')
@ApiBearerAuth('access-token')
@Controller('country')
export class CountryController {
    constructor(private countryService: CountryService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Country' })
    @ApiBody({ type: CountryDTO })
    @Post('')
    async addCountry(@Req() req: any, @Body() payload: CountryDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const country = await this.countryService.getCountryByName(payload.country_name);
            if (!country) {
                const countryObj = {
                    country_name: payload.country_name,
                };
                const countryDetail = await this.countryService.createCountry(countryObj);
                delete countryDetail.id;
                delete countryDetail.is_deleted;
                delete countryDetail.created_at;
                delete countryDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Country added.'],
                    data: countryDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    message: ['Country already exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to add country'],
            });
        }
    }

    @ApiOperation({ summary: 'Get all countries' })
    @Get('')
    async getAllCountries(@Res() res: Response) {
        const categories = await this.countryService.getAllCountries();
        return res.status(HttpStatus.OK).send({
            data: categories,
        });
    }
}
