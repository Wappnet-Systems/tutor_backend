import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CityDTO } from './dtos/city.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CityService } from './city.service';
import { Response } from 'express';

@ApiTags('city')
@ApiBearerAuth('access-token')
@Controller('city')
export class CityController {
    constructor(private cityService: CityService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add City' })
    @ApiBody({ type: CityDTO })
    @Post('')
    async addCity(@Req() req: any, @Body() payload: CityDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const city = await this.cityService.getCityByName(payload.city_name, payload.country_id);
            if (!city) {
                const cityObj = {
                    city_name: payload.city_name,
                    country_id: payload.country_id,
                };
                const cityDetail = await this.cityService.createCity(cityObj);
                delete cityDetail.id;
                delete cityDetail.is_deleted;
                delete cityDetail.created_at;
                delete cityDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, City added.'],
                    data: cityDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    message: ['City already exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to add city'],
            });
        }
    }

    @ApiOperation({ summary: 'Get all cities of a country' })
    @Get('/:id')
    async getAllCity(@Param('id') id: number, @Res() res: Response) {
        const cities = await this.cityService.getAllCitiesById(id);
        return res.status(HttpStatus.OK).send({
            data: cities,
        });
    }
}
