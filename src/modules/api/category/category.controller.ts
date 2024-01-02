import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubjectCategoryDTO } from '../subject/dtos/subject-category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CATEGORY_FILE_BASE_PATH } from 'src/utils/constant';
import { S3Service } from 'src/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from 'src/modules/admin/admin.guard';

@ApiTags('category')
@ApiBearerAuth('access-token')
@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService, private s3Service: S3Service, private configService: ConfigService) {}

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Add Category' })
    @ApiBody({ type: SubjectCategoryDTO })
    @Post('')
    @UseInterceptors(FileInterceptor('image'))
    async addSubjectCategory(@UploadedFile() image: Express.Multer.File, @Req() req: any, @Body() payload: SubjectCategoryDTO, @Res() res: Response) {
        if (req.user_type == 1) {
            const category = await this.categoryService.getCategoryByName(payload.category_name);
            if (!category) {
                const categoryObj = {
                    category_name: payload.category_name,
                    description: payload.description,
                };
                const categoryDetail = await this.categoryService.createCategory(categoryObj);

                if (image) {
                    const timestamp = Date.now();
                    const basePath = CATEGORY_FILE_BASE_PATH + timestamp + categoryDetail.id;
                    await this.s3Service.uploadFile(image.buffer, basePath, image.mimetype);
                    categoryDetail.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                    await this.categoryService.updateCategory(categoryDetail);
                }

                delete categoryDetail.id;
                delete categoryDetail.is_deleted;
                delete categoryDetail.created_at;
                delete categoryDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    status: true,
                    message: ['Success!, Category added.'],
                    data: categoryDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    status: false,
                    message: ['Category already exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                status: false,
                message: ['Only Admin is allowed to add category'],
            });
        }
    }

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Edit Category' })
    @ApiBody({ type: SubjectCategoryDTO })
    @Put('/:id')
    @UseInterceptors(FileInterceptor('image'))
    async editSubjectCategory(
        @UploadedFile() image: Express.Multer.File,
        @Param('id') id: number,
        @Req() req: any,
        @Body() payload: SubjectCategoryDTO,
        @Res() res: Response,
    ) {
        if (req.user_type == 1) {
            const category = await this.categoryService.getCategoryById(id);
            if (category) {
                const categoryObj = {
                    ...category,
                    ...payload,
                    updated_at: new Date(),
                };

                if (image) {
                    const timestamp = Date.now();
                    const basePath = CATEGORY_FILE_BASE_PATH + timestamp + category.id;
                    await this.s3Service.uploadFile(image.buffer, basePath, image.mimetype);
                    categoryObj.media = `${this.configService.get<string>('S3_URL')}/${basePath}`;
                }

                const categoryDetail = await this.categoryService.updateCategory(categoryObj);
                delete categoryDetail.id;
                delete categoryDetail.is_deleted;
                delete categoryDetail.created_at;
                delete categoryDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Category updated.'],
                    data: categoryDetail,
                    status: true,
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).send({
                    message: ['Category does not exists.'],
                    status: false,
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to edit category'],
                status: false,
            });
        }
    }

    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Add Category' })
    @ApiBody({ type: SubjectCategoryDTO })
    @Delete('/:id')
    async deleteSubjectCategory(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        if (req.user_type == 1) {
            const category = await this.categoryService.getCategoryById(id);
            if (category) {
                const categoryObj = {
                    ...category,
                    is_deleted: true,
                    updated_at: new Date(),
                };
                const categoryDetail = await this.categoryService.updateCategory(categoryObj);
                delete categoryDetail.id;
                delete categoryDetail.is_deleted;
                delete categoryDetail.created_at;
                delete categoryDetail.updated_at;

                return res.status(HttpStatus.OK).send({
                    message: ['Success!, Category deleted.'],
                    data: categoryDetail,
                });
            } else {
                return res.status(HttpStatus.CONFLICT).send({
                    message: ['Category does not exists.'],
                });
            }
        } else {
            return res.status(HttpStatus.FORBIDDEN).send({
                message: ['Only Admin is allowed to delete category'],
            });
        }
    }

    @ApiOperation({ summary: 'Get all categories' })
    @Get('')
    async getAllCategory(@Res() res: Response) {
        const categories = await this.categoryService.getAllCategories();
        return res.status(HttpStatus.OK).send({
            data: categories,
        });
    }
}
