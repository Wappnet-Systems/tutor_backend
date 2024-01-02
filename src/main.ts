import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
    const configService = app.get(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    // ejs
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');

    app.use(cookieParser());

    // Create a Swagger document
    const config = new DocumentBuilder()
        .setTitle('Tutor')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'access-token')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Set up the Swagger UI at the /api path
    SwaggerModule.setup('api', app, document);
    const corsOptions: CorsOptions = {
        origin: '*',
        credentials: true,
    };
    const port = configService.get<number>('port');
    app.enableCors(corsOptions);
    await app.listen(port);
}
bootstrap();
