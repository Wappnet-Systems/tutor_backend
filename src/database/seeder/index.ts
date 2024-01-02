/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import { Seeder, runSeeder } from 'typeorm-extension';

export class MainSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<any> {
        // await runSeeder(dataSource, UserSeeder);
    }
}
