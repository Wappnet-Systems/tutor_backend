import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { SlackService } from 'src/services/slack.service';
import { User } from 'src/entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { Booking } from 'src/entities/booking.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User, Transaction, Booking])],
    providers: [TransactionService, SlackService],
    controllers: [TransactionController],
    exports: [TransactionService],
})
export class TransactionModule {}
