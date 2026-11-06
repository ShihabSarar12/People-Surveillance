import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import HttpError from '../errors/http.error';
import HttpStatus from '../constants/status.constant';
import logger from '../utilities/logger.utility';

class IPFSRepository {
    private ipfsAPIURL = 'http://127.0.0.1:5001/api/v0';
    constructor() {}

    public uploadFileToIPFS = async (
        filePath: string
    ): Promise<{
        cid: string;
        fileSize: number;
        originalName: string;
    }> => {
        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(filePath));
            const res = await axios.post(`${this.ipfsAPIURL}/add`, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
            });

            const data = res.data;
            if (!data) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Failed to upload file to IPFS'
                );
            }
            return {
                cid: data.Hash,
                fileSize: Number(data.Size),
                originalName: data.Name,
            };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'IPFS Repository: Unexpected error occurred in uploadFileToIPFS',
                {
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to upload file to IPFS'
            );
        }
    };

    public downloadFileFromIPFS = async (cid: string): Promise<Buffer> => {
        try {
            const res = await axios.post(`${this.ipfsAPIURL}/cat`, null, {
                params: { arg: cid },
                responseType: 'arraybuffer',
                maxBodyLength: Infinity,
            });
            if (!res) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Failed to download from IPFS'
                );
            }
            return Buffer.from(res.data);
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'IPFS Repository: Unexpected error occurred in downloadFileFromIPFS',
                {
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to download file from IPFS'
            );
        }
    };
}

export default new IPFSRepository();
