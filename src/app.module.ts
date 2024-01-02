import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/configuration';
import { typeOrmConfig } from './config/typeorm.config';
import { SlackModule } from 'nestjs-slack-webhook';
import { SlackService } from './services/slack.service';
import { S3Service } from './services/s3.service';
import { MailService } from './services/mail.service';
import { AuthModule } from './modules/api/auth/auth.module';
import { UserModule } from './modules/api/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from './utils/constant';
import { SubjectModule } from './modules/api/subject/subject.module';
import { ChatModule } from './modules/api/chat/chat.module';
import { CountryModule } from './modules/api/country/country.module';
// import { AdminModule } from './modules/api/admin/admin.module';
import { BookingModule } from './modules/api/booking/booking.module';
import { BookmarkModule } from './modules/api/bookmark/bookmark.module';
import { CityModule } from './modules/api/city/city.module';
import { AssignmentModule } from './modules/api/assigment/assignment.module';
import { ReviewModule } from './modules/api/review/review.module';
import { TodoModule } from './modules/api/todo/todo.module';
import { NotificationModule } from './modules/api/notification/notification.module';
import { CategoryModule } from './modules/api/category/category.module';
import { TutorModule } from './modules/api/tutor/tutor.module';
import { AdminModule } from './modules/admin/admin.module';
import { LanguageModule } from './modules/api/language/language.module';
import { PostcodeModule } from './modules/api/postcode/postcode.module';
import { TransactionModule } from './modules/api/transaction/transaction.module';
import { PaymentModule } from './modules/api/payment/payment.module';
import { BadgesModule } from './modules/api/badges/badges.module';
import { FeedbackModule } from './modules/api/feedback/feedback.module';
import { CronModule } from './modules/api/cron/cron.module';
import { NoCacheMiddleware } from './middleware/noCache.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        SlackModule.forRootAsync({
            imports: [ConfigModule.forRoot()],
            useFactory: async (configService: ConfigService) => ({
                url: configService.get<string>('slack_webhook_url'),
            }),
            inject: [ConfigService],
        }),
        JwtModule.register({
            global: true,
            secret: jwtSecret,
            signOptions: { expiresIn: '1d' },
        }),
        AuthModule,
        UserModule,
        ChatModule,
        CityModule,
        CountryModule,
        CategoryModule,
        SubjectModule,
        AdminModule,
        BookingModule,
        BookmarkModule,
        AssignmentModule,
        ReviewModule,
        TodoModule,
        NotificationModule,
        TutorModule,
        LanguageModule,
        PostcodeModule,
        TransactionModule,
        PaymentModule,
        BadgesModule,
        FeedbackModule,
        CronModule,
    ],
    controllers: [AppController],
    providers: [AppService, SlackService, S3Service, MailService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(NoCacheMiddleware).forRoutes('admin');
    }
}
