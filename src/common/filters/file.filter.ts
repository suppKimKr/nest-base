import { HttpException, HttpStatus } from '@nestjs/common';

export const FileFilter = (req: Express.Request, file: Express.MulterS3.File, cb: Function) => {
    const fileExtension = file.mimetype.split('/')[1];
    const validFiles = ['jpg', 'jpeg', 'png', 'svg+xml', 'pdf'];

    if (validFiles.some((el) => fileExtension.includes(el))) {
        return cb(null, true);
    }

    return cb(new HttpException(`${file.mimetype} - 허용되지 않은 확장자입니다.`, HttpStatus.BAD_REQUEST), false);
};
