import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const allowedVideoMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/mkv',
    'video/mov',
    'video/flv',
    'video/x-msvideo',
    'video/quicktime',
];

const uploadDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, uploadDir);
    },

    filename: (_, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter: multer.Options['fileFilter'] = (
    req,
    file,
    cb: FileFilterCallback
) => {
    const isValidVideo = allowedVideoMimeTypes.includes(file.mimetype);
    if (isValidVideo) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'));
    }
};

const multerConfig: multer.Options = {
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
};

export default multerConfig;
