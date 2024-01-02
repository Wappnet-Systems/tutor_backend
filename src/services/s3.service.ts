import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackService } from './slack.service';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;

    private readonly s3Configs = {
        region: this.configService.get<string>('s3_region'),
        credentials: {
            accessKeyId: this.configService.get<string>('s3_access_key_id'),
            secretAccessKey: this.configService.get<string>('s3_secret_access_key'),
        },
    };

    constructor(private readonly configService: ConfigService, private readonly slackService: SlackService) {
        this.s3Client = new S3Client(this.s3Configs);
    }

    async uploadFile(file: Buffer, path: string, mimeType: string): Promise<boolean> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.configService.get<string>('s3_bucket'),
                ACL: this.configService.get<string>('s3_acl'),
                Key: path,
                Body: file,
                ContentType: mimeType,
            });
            const resp = await this.s3Client.send(command);
            return true;
        } catch (error) {
            await this.slackService.send(error, true);
            return false;
        }
    }

    async removeFile(path: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.configService.get<string>('s3_bucket'),
                Key: path,
            });
            await this.s3Client.send(command);
            return true;
        } catch (error) {
            await this.slackService.send(error, true);
            return false;
        }
    }

    async getFile(path: string): Promise<string> {
        const s3Url = this.configService.get<string>('s3_url');
        return `${s3Url}/${path}`;
    }
}
