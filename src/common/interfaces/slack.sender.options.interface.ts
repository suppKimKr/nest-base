export interface SlackSenderOptions {
    color: string;
    text: string;
    fields: [
        {
            title: string;
            value: string;
            short: boolean;
        }
    ];
    thumb_url: string;
}
