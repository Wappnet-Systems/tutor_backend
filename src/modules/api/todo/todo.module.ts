import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { Todo } from 'src/entities/todo.entity';
import { SlackService } from 'src/services/slack.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Todo])],
    providers: [TodoService, SlackService],
    controllers: [TodoController],
})
export class TodoModule {}
