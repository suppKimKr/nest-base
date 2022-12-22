import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as XLSX from 'xlsx';
import { extname } from 'path';
import { reportError } from '../utils/handleErrors';
import * as jsZip from 'jszip';
import sharp from 'sharp';
import _ from 'lodash';

@Injectable()
export class FilesService {
    constructor(private readonly configService: ConfigService) {}

    async uploadFile(file: Express.Multer.File, repoPath: string): Promise<S3.ManagedUpload.SendData> {
        const s3 = new S3();
        return await s3
            .upload({
                Bucket: this.configService.get('AWS_S3_IMAGE'),
                Body: file.buffer,
                ContentType: file.mimetype,
                Key: `${this.configService.get('AWS_S3_REPOSITORY')}/${repoPath}/${uuid()}${extname(file.originalname)}`,
            })
            .promise();
    }

    async resizeAndUploadToS3(images: any[], repoPath: string) {
        const s3 = new S3();
        let results = [];
        let id = 1;

        try {
            for (const image of images) {
                const uid = uuid();
                const origin = await s3
                    .upload({
                        Bucket: this.configService.get('AWS_S3_IMAGE'),
                        Body: image.buffer,
                        ContentType: image.mimetype,
                        Key: `${this.configService.get('AWS_S3_REPOSITORY')}/${repoPath}/${uid}${extname(image.originalname)}`,
                    })
                    .promise();

                const thumb = await s3
                    .upload({
                        Bucket: this.configService.get('AWS_S3_IMAGE'),
                        Body: await sharp(image.buffer).resize(500).withMetadata().toBuffer(),
                        ContentType: image.mimetype,
                        Key: `${this.configService.get('AWS_S3_REPOSITORY')}/${repoPath}/${uid}_thumb${extname(image.originalname)}`,
                    })
                    .promise();

                results.push({
                    id,
                    originName: image.originalname,
                    origin: `${this.configService.get('AWS_S3_IMAGE_URL')}${origin.Key}`,
                    thumb: `${this.configService.get('AWS_S3_IMAGE_URL')}${thumb.Key}`,
                });
                id++;
            }

            return results;
        } catch (e) {
            throw new Error(e);
        }
    }

    async uploadFilesWithinOneField(files: Express.Multer.File[], repoPath: string): Promise<S3.ManagedUpload.SendData[]> {
        const s3 = new S3();
        let result: S3.ManagedUpload.SendData[] = [];
        for (const { buffer, mimetype, originalname } of files) {
            const uploadResult = await s3
                .upload({
                    Bucket: this.configService.get('AWS_S3_IMAGE'),
                    Body: buffer,
                    ContentType: mimetype,
                    Key: `${this.configService.get('AWS_S3_REPOSITORY')}/${repoPath}/${uuid()}${extname(originalname)}`,
                })
                .promise();
            result.push(uploadResult);
        }
        return result;
    }

    async deleteFiles(keys: string[]): Promise<S3.DeleteObjectsOutput> {
        try {
            const s3 = new S3();
            const Objects = keys.map((key) => ({ Key: key }));
            return await s3
                .deleteObjects({
                    Bucket: this.configService.get('AWS_S3_IMAGE'),
                    Delete: { Objects },
                })
                .promise();
        } catch (e) {
            reportError({ message: e });
            throw e;
        }
    }

    createExcel(data: any[], sheetName: string, data2?: any[]): any {
        const wb = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, newWorksheet, sheetName);

        if (_.size(data2)) {
            const secondSheet = XLSX.utils.json_to_sheet(data2);
            XLSX.utils.book_append_sheet(wb, secondSheet, 'ref');
        }

        return XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'base64',
        });
    }

    excelToJson(file: File): any[] {
        const workbook = XLSX.read(file, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, {
            defval: null,
        });
    }

    async getPreSignedUrlFromS3(repoPath: string, fileNames: string[]) {
        const s3 = new S3();

        let resultArr = [];
        for (const fileName of fileNames) {
            const signedUrl = await s3.getSignedUrlPromise('putObject', {
                Bucket: this.configService.get('AWS_S3_IMAGE'),
                Key: `${this.configService.get('AWS_S3_REPOSITORY')}/${repoPath}/${uuid()}${extname(fileName)}`,
                Expires: 60,
                ACL: 'public-read',
            });

            resultArr.push(signedUrl);
        }

        return resultArr;
    }

    async getZipData(file: Express.MulterS3.File, path: string) {
        const imgExtArr = ['png', 'jpeg', 'jpg'];
        let excelData: any[] = [];
        let imagesArr: any[] = [];
        let storages = [];

        try {
            await jsZip.loadAsync(file.buffer).then(async (zip: any) => {
                const keys = Object.keys(zip.files);
                for (const filename of keys) {
                    if (!zip.files[filename].dir && filename.includes('xlsx')) {
                        await zip.files[filename].async('ArrayBuffer').then((fileData: any) => {
                            excelData = this.excelToJson(fileData);
                        });
                    } else if (imgExtArr.some((el) => filename.indexOf(el) > -1)) {
                        await zip.files[filename].async('ArrayBuffer').then((fileData: any) => {
                            imagesArr.push({
                                buffer: Buffer.from(fileData),
                                originalname: filename,
                                mimetype: `image/${extname(filename).replace('.', '')}`,
                            });
                        });
                    }
                }
                storages = await this.resizeAndUploadToS3(imagesArr, path);
            });

            return { excelData, storages };
        } catch (e) {
            throw new Error(e);
        }
    }
}
