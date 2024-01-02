import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '../auth/auth.guard';
import { TodoDTO } from './dtos/todo.dto';
import { ApiOperation, ApiBody, ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { PaginationOptions } from 'src/utils/constant';

@ApiTags('todo')
@ApiBearerAuth('access-token')
@Controller('todo')
export class TodoController {
    constructor(private todoService: TodoService) {}

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Todo' })
    @ApiBody({ type: TodoDTO })
    @Post('')
    async addTodo(@Req() req: any, @Body() payload: TodoDTO, @Res() res: Response) {
        const todoDetails = await this.todoService.addTodo({
            title: payload.title,
            description: payload.description,
            user_id: req.user_id,
        });

        delete todoDetails.created_at;
        delete todoDetails.updated_at;
        delete todoDetails.is_deleted;
        delete todoDetails.user_id;

        return res.status(HttpStatus.OK).send({
            message: ['Success!, Todo Added'],
            data: todoDetails,
        });
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Add Todo' })
    @ApiBody({ type: TodoDTO })
    @Put('/:id')
    async editTodo(@Param('id') id: number, @Req() req: any, @Body() payload: TodoDTO, @Res() res: Response) {
        let todoDetails = await this.todoService.getTodoDetailById(id, req.user_id);

        if (todoDetails) {
            todoDetails.title = payload.title;
            todoDetails.description = payload.description;

            todoDetails = await this.todoService.updateTodo(todoDetails);

            delete todoDetails.created_at;
            delete todoDetails.updated_at;
            delete todoDetails.is_deleted;
            delete todoDetails.user_id;

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Todo Updated'],
                data: todoDetails,
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['Todo does not exist.'],
                data: todoDetails,
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Delete Todo' })
    @Delete('/:id')
    async deleteTodo(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        let todoDetails = await this.todoService.getTodoDetailById(id, req.user_id);

        if (todoDetails) {
            todoDetails.is_deleted = true;

            todoDetails = await this.todoService.updateTodo(todoDetails);

            return res.status(HttpStatus.OK).send({
                message: ['Success!, Todo Deleted'],
            });
        } else {
            return res.status(HttpStatus.OK).send({
                message: ['Todo does not exist.'],
                data: todoDetails,
            });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Get Todo' })
    @ApiQuery({ name: 'page', type: Number, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, example: 10, description: 'Number of items per page' })
    @ApiQuery({ name: 'sort', type: String, example: 'ASC', description: 'ASC | DESC' })
    @Get('')
    async getTodos(@Req() req: any, @Query() query: PaginationOptions, @Res() res: Response) {
        const todo_list = await this.todoService.getAllTodoOfUser(req.user_id, query);
        return res.status(HttpStatus.OK).send({
            message: ['Success!, Todos'],
            data: todo_list,
        });
    }
}
