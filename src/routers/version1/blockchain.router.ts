import { Router } from 'express';
import blockchainController from '../../controllers/blockchain.controller';
import multer from 'multer';
import multerConfig from '../../configs/multer.config';

const blockchainRouter: Router = Router();
const upload = multer(multerConfig);

blockchainRouter
    .route('/retrieve-metadata')
    .get(blockchainController.retrieveMetaDataFromBlockchain)
    .post(blockchainController.getMetadataByUploaderAndTimestamp);

blockchainRouter.post(
    '/store-metadata',
    blockchainController.storeCIDToBlockchain
);

blockchainRouter.post(
    '/upload-video',
    upload.single('video'),
    blockchainController.uploadVideoToIPFS
);

blockchainRouter.post(
    '/download-video',
    blockchainController.downloadFileFromIPFS
);

export default blockchainRouter;
