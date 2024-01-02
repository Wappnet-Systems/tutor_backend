import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SubjectDTO } from './dtos/subject.dto';
import { AdminGuard } from 'src/modules/admin/admin.guard';
@ApiTags('subject')
@Controller('subject')
@ApiBearerAuth('access-token')
export class SubjectController {
    constructor(private subjectService: SubjectService) {}

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Add Subject' })
    @ApiBody({ type: SubjectDTO })
    @Post('')
    async addSubject(@Req() req: any, @Body() payload: SubjectDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const subject = await this.subjectService.getSubjectByName(payload.subject_name);
            if (!subject) {
                const subjectObj = {
                    subject_name: payload.subject_name,
                    subject_category_id: payload.subject_category_id,
                };
                const subjectDetail = await this.subjectService.createSubject(subjectObj);
                delete subjectDetail.id;
                delete subjectDetail.is_deleted;
                delete subjectDetail.created_at;
                delete subjectDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, Subject added.'],
                    data: subjectDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    status: false,
                    message: ['Subject already exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                status: false,
                message: ['Only Admin is allowed to add subject'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Edit Subject' })
    @ApiBody({ type: SubjectDTO })
    @Put('/:id')
    async editSubject(@Param('id') id: number, @Req() req: any, @Body() payload: SubjectDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const subject = await this.subjectService.getSubjectById(id);
            if (subject) {
                const subjectObj = {
                    ...subject,
                    ...payload,
                    updated_at: new Date(),
                };
                const subjectDetail = await this.subjectService.updateSubject(subjectObj);
                delete subjectDetail.id;
                delete subjectDetail.is_deleted;
                delete subjectDetail.created_at;
                delete subjectDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, Subject edited.'],
                    data: subjectDetail,
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).send({
                    status: false,
                    message: ['Subject does not exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                status: false,
                message: ['Only Admin is allowed to edit subject'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Edit Subject' })
    @Delete('/:id')
    async deleteSubject(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        if (req.user_type == 1) {
            const subject = await this.subjectService.getSubjectById(id);
            if (subject) {
                const subjectObj = {
                    ...subject,
                    is_deleted: true,
                    updated_at: new Date(),
                };
                const subjectDetail = await this.subjectService.updateSubject(subjectObj);
                delete subjectDetail.id;
                delete subjectDetail.is_deleted;
                delete subjectDetail.created_at;
                delete subjectDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Subject deleted.'],
                    data: subjectDetail,
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).send({
                    message: ['Subject does not exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to delete subject'],
            });
        }
    }

    @ApiOperation({ summary: 'Get all subjects' })
    @Get('')
    async getAllSubject(@Res() res: Response) {
        const subjects = await this.subjectService.getAllSubjects();
        return res.status(HttpStatus.OK).send({
            data: subjects,
        });
    }

    @ApiOperation({ summary: 'Get all subjects' })
    @Get('/:id')
    async getAllSubjectOfCategory(@Param('id') id: number, @Res() res: Response) {
        const subjects = await this.subjectService.getSubjectByCategoryId(id);
        return res.status(HttpStatus.OK).send({
            data: subjects,
        });
    }
}
