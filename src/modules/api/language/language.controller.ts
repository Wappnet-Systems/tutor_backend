import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LanguageService } from './language.service';
import { AuthGuard } from '../auth/auth.guard';
import { LanguageDTO } from './dtos/language.dto';
import { Response } from 'express';
import { ApiOperation, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('language')
@ApiBearerAuth('access-token')
@Controller('language')
export class LanguageController {
    constructor(private languageService: LanguageService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Language' })
    @ApiBody({ type: LanguageDTO })
    @Post('')
    async addLanguage(@Req() req: any, @Body() payload: LanguageDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const language = await this.languageService.getLanguageByName(payload.language);
            if (!language) {
                const languageObj = {
                    language: payload.language,
                };
                const languageDetail = await this.languageService.createLanguage(languageObj);
                delete languageDetail.id;
                delete languageDetail.is_deleted;
                delete languageDetail.created_at;
                delete languageDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Language added.'],
                    data: languageDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    message: ['Language already exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to add Language'],
            });
        }
    }

    @ApiOperation({ summary: 'Get all languages' })
    @Get('')
    async getAllLanguages(@Res() res: Response) {
        const languages = await this.languageService.getAllLanguages();
        return res.status(HttpStatus.OK).send({
            data: languages,
        });
    }
}
