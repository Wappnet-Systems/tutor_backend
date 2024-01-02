import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MainSeeder } from '../database/seeder/index';
import { SeederOptions } from 'typeorm-extension';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const typeOrmConfig: TypeOrmModuleOptions & SeederOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts, .js}'],
    seeds: [MainSeeder],
    synchronize: true,
    logging: false,
};

export const AppDataSource = new DataSource(typeOrmConfig as DataSourceOptions);

AppDataSource.initialize();
