import { HttpStatus, Inject, Injectable, Logger, LoggerService, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(Logger) private readonly logger: LoggerService) {}
    use(req: Request, res: Response, next: NextFunction) {
        let send = res.send;
        res.send = (body) => {
            if (body) {
                const { method, originalUrl } = req;
                const userAgent = req.get('user-agent') || '';

                if (!userAgent.includes('ELB-HealthChecker')) {
                    const ip = requestIp.getClientIp(req);
                    const uuid = uuidv4();
                    const parseBody = JSON.parse(body);
                    let { statusCode, message } = parseBody;
                    statusCode = originalUrl.includes('sweet') ? HttpStatus.OK : statusCode;
                    res.on('finish', () => {
                        const contentLength = res.get('content-length');
                        const info = `${uuid} ${method} ${originalUrl} ${statusCode} ${HttpStatus[statusCode]} ${contentLength || ''} - ${userAgent} ${ip}`;
                        const requestParams = (() => {
                            let message: string = '';
                            if (req.params) {
                                message += `params: ${JSON.stringify(req.params)} `;
                            }
                            if (req.query) {
                                message += `query: ${JSON.stringify(req.query)} `;
                            }
                            if (req.params) {
                                message += `body: ${JSON.stringify(req.body)}`;
                            }
                            return message;
                        })();
                        if (statusCode === 200 || statusCode === 201) {
                            this.logger.log(requestParams, info);
                        } else {
                            this.logger.error(requestParams, message, info);
                        }
                    });
                }
            }
            res.send = send;
            return res.send(body);
        };
        next();
    }
}
