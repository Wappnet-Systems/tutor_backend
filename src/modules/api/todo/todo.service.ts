import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from 'src/entities/todo.entity';
import { SlackService } from 'src/services/slack.service';
import { PaginationOptions } from 'src/utils/constant';
import { Repository } from 'typeorm';

@Injectable()
export class TodoService {
    constructor(@InjectRepository(Todo) private readonly todoRepository: Repository<Todo>, private slackService: SlackService) {}

    async addTodo(todoObj): Promise<Todo> {
        try {
            const todoDetail = await this.todoRepository.save(todoObj);
            return todoDetail;
        } catch (error) {
            await this.slackService.send('Error in addTodo', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateTodo(todoObj): Promise<Todo> {
        try {
            const todoDetail = await this.todoRepository.save(todoObj);
            return todoDetail;
        } catch (error) {
            await this.slackService.send('Error in updateTodo', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllTodoOfUser(user_id: number, pagination: PaginationOptions) {
        try {
            const todo_list = await this.todoRepository.find({
                where: { is_deleted: false, user_id: user_id },
                order: { created_at: pagination.sort },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
            if (todo_list.length) {
                return {
                    data: todo_list,
                    page: pagination.page,
                    itemPerPage: pagination.limit,
                    totalItem: await this.todoRepository.count({
                        where: { is_deleted: false, user_id: user_id },
                    }),
                };
            }
            return;
        } catch (error) {
            await this.slackService.send('Error in getAllTodoOfUser', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getTodoDetailById(id: number, user_id: number): Promise<Todo> {
        try {
            const todoDetail = await this.todoRepository.findOne({
                where: { is_deleted: false, id: id, user_id: user_id },
            });
            return todoDetail;
        } catch (error) {
            await this.slackService.send('Error in getTodoDetailById', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
