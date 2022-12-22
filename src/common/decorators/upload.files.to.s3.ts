import { UseInterceptors } from '@nestjs/common';
import multerS3 from 'multer-s3-transform';
import sharp from 'sharp';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import * as dotenv from 'dotenv';
import * as AWS from 'aws-sdk';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileFilter } from '../filters';
import _ from 'lodash';

dotenv.config({ path: `config/.env.${process.env.NODE_ENV}` });
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const getTransforms = (repoPath: string) => {
    return [
        {
            id: 'origin',
            key: function (req, file, cb) {
                const originalFileKey = `${process.env.AWS_S3_REPOSITORY}/${repoPath}/${uuid()}`;
                this['originalFileKey'] = originalFileKey;
                cb(null, `${originalFileKey}${extname(file.originalname)}`);
            },
            transform: function (req, file, cb) {
                cb(null, sharp());
            },
        },
        {
            id: 'thumb',
            key: function (req, file, cb) {
                cb(null, `${this['originalFileKey']}_thumb${extname(file.originalname)}`);
            },
            transform: function (req, file, cb) {
                cb(null, sharp().resize(600));
            },
        },
    ];
};

export function UploadFilesToS3(fieldName: string, repoPath: string, imageOnly: boolean = true): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        return UseInterceptors(
            FilesInterceptor(fieldName, 10, {
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_S3_IMAGE,
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    shouldTransform: function (req, file, cb) {
                        cb(null, _.includes(['image/jpg', 'image/jpeg', 'image/png'], file.mimetype));
                    },
                    transforms: getTransforms(repoPath),
                    key: function (req, file, cb) {
                        cb(null, `${process.env.AWS_S3_REPOSITORY}/${repoPath}/${uuid()}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: imageOnly ? FileFilter : null,
            })
        )(target, propertyKey, descriptor);
    };
}

export function UploadFileFieldsToS3(fields: string[], repoPath: string, imageOnly: boolean = true): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const filedOptions: MulterField[] = fields.map((field) => ({ name: field, maxCount: 10 }));
        return UseInterceptors(
            FileFieldsInterceptor(filedOptions, {
                storage: multerS3({
                    s3,
                    bucket: process.env.AWS_S3_IMAGE,
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    shouldTransform: function (req, file, cb) {
                        cb(null, _.includes(['image/jpg', 'image/jpeg', 'image/png'], file.mimetype));
                    },
                    transforms: getTransforms(repoPath),
                    key: function (req, file, cb) {
                        cb(null, `${process.env.AWS_S3_REPOSITORY}/${repoPath}/${uuid()}${extname(file.originalname)}`);
                    },
                }),
                fileFilter: imageOnly ? FileFilter : null,
            })
        )(target, propertyKey, descriptor);
    };
}
