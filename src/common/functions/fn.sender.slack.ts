import { IncomingWebhook } from '@slack/client';
import moment from 'moment';
import { SlackSenderOptions } from '../interfaces';

/**
 * @params str: string
 * @example '80JjDFLTN0'
 */
export const sendSlack = async (channel: string, body: SlackSenderOptions): Promise<void> => {
    const webhook = new IncomingWebhook(channel);
    await webhook.send({
        attachments: [
            {
                ...body,
                ts: moment().utc().format('X'),
            },
        ],
    });
};
