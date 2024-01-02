import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1693219152608 implements MigrationInterface {
    name = 'Init1693219152608';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`tutor-approval-request\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`status\` int NOT NULL DEFAULT '0', \`remarks\` varchar(1000) NOT NULL DEFAULT '', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_853752d1bf333baa4c1317f824\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tutor-education\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`course_name\` varchar(200) NOT NULL, \`university_name\` varchar(200) NOT NULL, \`location\` varchar(100) NOT NULL, \`start_date\` date NOT NULL, \`end_date\` date NULL, \`document\` varchar(100) NULL, \`description\` varchar(500) NOT NULL DEFAULT '', \`is_ongoing\` tinyint NOT NULL DEFAULT 0, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tutor-media-gallery\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`media\` varchar(1000) NULL, \`media_type\` varchar(100) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`subject\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`subject_name\` varchar(50) NOT NULL, \`subject_category_id\` bigint NOT NULL, \`description\` varchar(200) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`subject-category\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`category_name\` varchar(50) NOT NULL, \`description\` varchar(200) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`media\` varchar(1000) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tutor-subject\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`category_id\` bigint NOT NULL, \`subject_id\` bigint NOT NULL, \`user_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`country\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`country_name\` varchar(50) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`city\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`city_name\` varchar(50) NOT NULL, \`country_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`bookmark\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`tutor_user_id\` bigint NOT NULL, \`student_user_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`assignment-submission-media\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`student_user_id\` bigint NOT NULL, \`assignment_id\` bigint NOT NULL, \`media\` varchar(1000) NULL, \`description\` varchar(1000) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`assignment\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`title\` varchar(80) NOT NULL, \`description\` varchar(1000) NOT NULL, \`tutor_user_id\` bigint NOT NULL, \`student_user_id\` bigint NOT NULL, \`booking_id\` bigint NOT NULL, \`target_completion_date\` date NOT NULL, \`actual_completion_date\` date NULL, \`status\` int NOT NULL DEFAULT '0', \`media\` varchar(1000) NULL, \`media_type\` varchar(100) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`tutor_review\` varchar(1000) NOT NULL DEFAULT '', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`review\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`remarks\` varchar(1000) NOT NULL, \`rating\` int NOT NULL, \`user_id\` bigint NOT NULL, \`tutor_user_id\` bigint NOT NULL, \`booking_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`todo\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`title\` varchar(50) NOT NULL, \`description\` varchar(200) NULL, \`user_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`notification\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`title\` varchar(50) NOT NULL, \`description\` varchar(200) NULL, \`user_id\` bigint NOT NULL, \`type\` varchar(50) NOT NULL, \`is_unread\` tinyint NOT NULL DEFAULT 1, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`postcode\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`postcode\` varchar(50) NOT NULL, \`place_name\` varchar(50) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tutor-postcode\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`postcode_id\` bigint NOT NULL, \`user_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`tutor-availability\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`date\` date NOT NULL, \`from_time\` datetime NOT NULL, \`to_time\` datetime NOT NULL, \`week_day\` int NOT NULL, \`status\` int NOT NULL DEFAULT '0', \`booking_id\` bigint NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`users\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_type\` enum ('1', '2', '3') NOT NULL DEFAULT '3', \`email\` varchar(50) NOT NULL, \`first_name\` varchar(80) NOT NULL, \`last_name\` varchar(80) NOT NULL, \`image\` varchar(1000) NULL, \`dob\` date NULL, \`contact_number\` varchar(10) NOT NULL, \`password\` varchar(80) NOT NULL, \`tag_line\` varchar(1000) NULL, \`hourly_rate\` int NULL, \`hourly_rate2\` int NULL, \`hourly_rate3\` int NULL, \`gender\` enum ('1', '2', '3') NOT NULL, \`avg_rating\` int NULL, \`address_line_one\` varchar(100) NULL, \`address_line_two\` varchar(100) NULL, \`country_id\` bigint NULL, \`city_id\` bigint NULL, \`zipcode\` varchar(10) NULL, \`languages\` varchar(100) NULL, \`address\` varchar(100) NULL, \`lat\` varchar(100) NULL, \`lng\` varchar(100) NULL, \`skype\` varchar(100) NOT NULL DEFAULT '', \`whatsapp\` varchar(100) NOT NULL DEFAULT '', \`website\` varchar(100) NOT NULL DEFAULT '', \`introduction\` varchar(2000) NOT NULL DEFAULT '', \`remarks\` varchar(1000) NOT NULL DEFAULT 'Email verification pending', \`enrollment\` bigint NULL, \`total_reviews\` int NOT NULL DEFAULT '0', \`email_verified\` tinyint NOT NULL DEFAULT 0, \`teach_at_my_home\` tinyint NOT NULL DEFAULT 0, \`teach_at_students_home\` tinyint NOT NULL DEFAULT 0, \`teach_at_online\` tinyint NOT NULL DEFAULT 0, \`teach_at_offline\` tinyint NOT NULL DEFAULT 0, \`is_approved\` tinyint NOT NULL DEFAULT 0, \`status\` enum ('1', '2') NOT NULL DEFAULT '2', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`booking\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`tutor_user_id\` bigint NOT NULL, \`student_user_id\` bigint NOT NULL, \`booking_start_date\` datetime NOT NULL, \`booking_end_date\` datetime NOT NULL, \`hourly_rate\` bigint NOT NULL, \`total_amount\` bigint NOT NULL, \`total_slots\` bigint NOT NULL, \`special_comments\` varchar(2000) NOT NULL DEFAULT '', \`address\` varchar(100) NULL, \`lat\` varchar(100) NULL, \`lng\` varchar(100) NULL, \`mode\` int NOT NULL, \`subject_id\` bigint NOT NULL, \`rejection_reason\` varchar(2000) NOT NULL DEFAULT '', \`status\` int NOT NULL DEFAULT '0', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`is_paid\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`booking-user\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`booking_id\` bigint NOT NULL, \`user_id\` bigint NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`language\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`language\` varchar(50) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_activation_otp\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`email\` varchar(50) NOT NULL, \`otp\` int NOT NULL, \`user_id\` bigint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-approval-request\` ADD CONSTRAINT \`FK_853752d1bf333baa4c1317f8245\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-education\` ADD CONSTRAINT \`FK_8ded3a83c8e072364f6d5fcef7f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-media-gallery\` ADD CONSTRAINT \`FK_b26fee13fa5a2811ac833230c99\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`subject\` ADD CONSTRAINT \`FK_d094118c1e989fd11a895bdd268\` FOREIGN KEY (\`subject_category_id\`) REFERENCES \`subject-category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-subject\` ADD CONSTRAINT \`FK_651f354b91bc7a6d2649d596b9b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-subject\` ADD CONSTRAINT \`FK_1cf401fa9e96bfba78bf91e4def\` FOREIGN KEY (\`category_id\`) REFERENCES \`subject-category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-subject\` ADD CONSTRAINT \`FK_8eb3596a9ee029945c1e61add47\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookmark\` ADD CONSTRAINT \`FK_7b39267e94f77ce789a37c27792\` FOREIGN KEY (\`tutor_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`assignment-submission-media\` ADD CONSTRAINT \`FK_fc9299eba0be119a6dcf45078e1\` FOREIGN KEY (\`student_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`assignment-submission-media\` ADD CONSTRAINT \`FK_1920fe7e1116c0e8d837a37b7d9\` FOREIGN KEY (\`assignment_id\`) REFERENCES \`assignment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`assignment\` ADD CONSTRAINT \`FK_f954b2f00f3ff234d2c86a376fd\` FOREIGN KEY (\`tutor_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`assignment\` ADD CONSTRAINT \`FK_9d8d7077e4d5036d01d812c5200\` FOREIGN KEY (\`student_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`assignment\` ADD CONSTRAINT \`FK_60a5d6a9ec89ab94a392b69b0db\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_81446f2ee100305f42645d4d6c2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_fc8f80e144be0627a9734dc1137\` FOREIGN KEY (\`tutor_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1aec399a19f4e433d02a53cd8e2\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_9cb7989853c4cb7fe427db4b260\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_928b7aa1754e08e1ed7052cb9d8\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-postcode\` ADD CONSTRAINT \`FK_f0ac1ebd62436fce5aa25d4a27e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-postcode\` ADD CONSTRAINT \`FK_c1180df5fd3ebc1da49e2b59f15\` FOREIGN KEY (\`postcode_id\`) REFERENCES \`postcode\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-availability\` ADD CONSTRAINT \`FK_52dcbcf9292d26c61183a8e6837\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tutor-availability\` ADD CONSTRAINT \`FK_0f684f8555afd82a730f9a1fcae\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_ae78dc6cb10aa14cfef96b2dd90\` FOREIGN KEY (\`country_id\`) REFERENCES \`country\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_03934bca2709003c5f08fd436d2\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_676e9e65e9bd9623a41b0fc2529\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subject\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_144ae131da2ad27e8add43149e9\` FOREIGN KEY (\`tutor_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_fa3f7fffcfa9df1509ac751732a\` FOREIGN KEY (\`student_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking-user\` ADD CONSTRAINT \`FK_20e90c07395e4c3aa9aa76eb640\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`booking-user\` ADD CONSTRAINT \`FK_a2b4f806dd3495595680516fe7b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`booking-user\` DROP FOREIGN KEY \`FK_a2b4f806dd3495595680516fe7b\``);
        await queryRunner.query(`ALTER TABLE \`booking-user\` DROP FOREIGN KEY \`FK_20e90c07395e4c3aa9aa76eb640\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_fa3f7fffcfa9df1509ac751732a\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_144ae131da2ad27e8add43149e9\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_676e9e65e9bd9623a41b0fc2529\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_03934bca2709003c5f08fd436d2\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_ae78dc6cb10aa14cfef96b2dd90\``);
        await queryRunner.query(`ALTER TABLE \`tutor-availability\` DROP FOREIGN KEY \`FK_0f684f8555afd82a730f9a1fcae\``);
        await queryRunner.query(`ALTER TABLE \`tutor-availability\` DROP FOREIGN KEY \`FK_52dcbcf9292d26c61183a8e6837\``);
        await queryRunner.query(`ALTER TABLE \`tutor-postcode\` DROP FOREIGN KEY \`FK_c1180df5fd3ebc1da49e2b59f15\``);
        await queryRunner.query(`ALTER TABLE \`tutor-postcode\` DROP FOREIGN KEY \`FK_f0ac1ebd62436fce5aa25d4a27e\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_928b7aa1754e08e1ed7052cb9d8\``);
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_9cb7989853c4cb7fe427db4b260\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1aec399a19f4e433d02a53cd8e2\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_fc8f80e144be0627a9734dc1137\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_81446f2ee100305f42645d4d6c2\``);
        await queryRunner.query(`ALTER TABLE \`assignment\` DROP FOREIGN KEY \`FK_60a5d6a9ec89ab94a392b69b0db\``);
        await queryRunner.query(`ALTER TABLE \`assignment\` DROP FOREIGN KEY \`FK_9d8d7077e4d5036d01d812c5200\``);
        await queryRunner.query(`ALTER TABLE \`assignment\` DROP FOREIGN KEY \`FK_f954b2f00f3ff234d2c86a376fd\``);
        await queryRunner.query(`ALTER TABLE \`assignment-submission-media\` DROP FOREIGN KEY \`FK_1920fe7e1116c0e8d837a37b7d9\``);
        await queryRunner.query(`ALTER TABLE \`assignment-submission-media\` DROP FOREIGN KEY \`FK_fc9299eba0be119a6dcf45078e1\``);
        await queryRunner.query(`ALTER TABLE \`bookmark\` DROP FOREIGN KEY \`FK_7b39267e94f77ce789a37c27792\``);
        await queryRunner.query(`ALTER TABLE \`tutor-subject\` DROP FOREIGN KEY \`FK_8eb3596a9ee029945c1e61add47\``);
        await queryRunner.query(`ALTER TABLE \`tutor-subject\` DROP FOREIGN KEY \`FK_1cf401fa9e96bfba78bf91e4def\``);
        await queryRunner.query(`ALTER TABLE \`tutor-subject\` DROP FOREIGN KEY \`FK_651f354b91bc7a6d2649d596b9b\``);
        await queryRunner.query(`ALTER TABLE \`subject\` DROP FOREIGN KEY \`FK_d094118c1e989fd11a895bdd268\``);
        await queryRunner.query(`ALTER TABLE \`tutor-media-gallery\` DROP FOREIGN KEY \`FK_b26fee13fa5a2811ac833230c99\``);
        await queryRunner.query(`ALTER TABLE \`tutor-education\` DROP FOREIGN KEY \`FK_8ded3a83c8e072364f6d5fcef7f\``);
        await queryRunner.query(`ALTER TABLE \`tutor-approval-request\` DROP FOREIGN KEY \`FK_853752d1bf333baa4c1317f8245\``);
        await queryRunner.query(`DROP TABLE \`user_activation_otp\``);
        await queryRunner.query(`DROP TABLE \`language\``);
        await queryRunner.query(`DROP TABLE \`booking-user\``);
        await queryRunner.query(`DROP TABLE \`booking\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`tutor-availability\``);
        await queryRunner.query(`DROP TABLE \`tutor-postcode\``);
        await queryRunner.query(`DROP TABLE \`postcode\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`todo\``);
        await queryRunner.query(`DROP TABLE \`review\``);
        await queryRunner.query(`DROP TABLE \`assignment\``);
        await queryRunner.query(`DROP TABLE \`assignment-submission-media\``);
        await queryRunner.query(`DROP TABLE \`bookmark\``);
        await queryRunner.query(`DROP TABLE \`city\``);
        await queryRunner.query(`DROP TABLE \`country\``);
        await queryRunner.query(`DROP TABLE \`tutor-subject\``);
        await queryRunner.query(`DROP TABLE \`subject-category\``);
        await queryRunner.query(`DROP TABLE \`subject\``);
        await queryRunner.query(`DROP TABLE \`tutor-media-gallery\``);
        await queryRunner.query(`DROP TABLE \`tutor-education\``);
        await queryRunner.query(`DROP INDEX \`REL_853752d1bf333baa4c1317f824\` ON \`tutor-approval-request\``);
        await queryRunner.query(`DROP TABLE \`tutor-approval-request\``);
    }
}
