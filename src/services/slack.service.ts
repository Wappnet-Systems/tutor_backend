import { Injectable } from '@nestjs/common';
import { IncomingWebhook, IncomingWebhookResult } from '@slack/webhook';
import { InjectSlack } from 'nestjs-slack-webhook';

@Injectable()
export class SlackService {
    constructor(@InjectSlack() private readonly slack: IncomingWebhook) {}
    send(message: string, isError = false): Promise<IncomingWebhookResult> {
        const slackMessage = isError ? `Error: ${message}` : `${message}`;
        return this.slack.send(slackMessage);
    }
}
