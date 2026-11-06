import Web3 from 'web3';
import path from 'path';
import fs from 'fs';
import HttpError from '../errors/http.error';
import {
    ACCOUNT_PRIVATE_KEY,
    CONTRACT_ADDRESS,
} from '../constants/env.constants';
import logger from '../utilities/logger.utility';
import {
    MetadataResult,
    MetadataResultByUploaderAndTimestamp,
} from '../types/blockchain.type';
import HttpStatus from '../constants/status.constant';
class BlockchainRepository {
    private web3;
    private contractABI;
    private account;
    private contract;

    constructor() {
        this.web3 = new Web3('http://127.0.0.1:8545');
        const abiPath = path.resolve(
            __dirname,
            '../contracts/SurveillanceManager.abi'
        );
        if (!fs.existsSync(abiPath)) {
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'ABI file not found'
            );
        }
        const abiJSON = fs.readFileSync(abiPath, 'utf-8');
        const contractABI = JSON.parse(abiJSON);
        if (contractABI.length === 0) {
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'ABI is empty or invalid'
            );
        }
        this.contractABI = contractABI;
        if (!ACCOUNT_PRIVATE_KEY) {
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Account private key is not defined'
            );
        }
        this.account =
            this.web3.eth.accounts.privateKeyToAccount(ACCOUNT_PRIVATE_KEY);
        this.web3.eth.accounts.wallet.add(this.account);
        this.contract = new this.web3.eth.Contract(
            this.contractABI,
            CONTRACT_ADDRESS
        );
        if (!CONTRACT_ADDRESS) {
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Contract address is not defined'
            );
        }
        this.web3.eth.getCode(CONTRACT_ADDRESS).then((code) => {
            if (code === '0x') {
                logger.error('Contract not found at the specified address.');
            } else {
                logger.info('Contract is deployed at the specified address.');
            }
        });
    }

    public storeData = async (data: number): Promise<string> => {
        const gas = await this.contract.methods.store(data).estimateGas({
            from: this.account.address,
        });
        const gasString = typeof gas === 'bigint' ? gas.toString() : gas;
        const gasPrice = await this.web3.eth.getGasPrice();
        const gasPriceString =
            typeof gasPrice === 'bigint' ? gasPrice.toString() : gasPrice;
        const result = await this.contract.methods.store(data).send({
            from: this.account.address,
            gas: gasString,
            gasPrice: gasPriceString,
        });
        return result.transactionHash ?? null;
    };

    public retrieveData = async (): Promise<number> => {
        const data = await this.contract.methods.retrieve().call();
        return Number(data) ?? null;
    };

    public getTransactionStatus = async (hash: string): Promise<object> => {
        const receipt = await this.web3.eth.getTransactionReceipt(hash);
        if (!receipt) {
            return {
                status: 'pending',
                message: 'Transaction not found or pending',
                receipt: null,
                logs: [],
            };
        }
        const serializedReceipt = JSON.parse(
            JSON.stringify(receipt, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );
        if (!serializedReceipt) {
            return {
                status: 'pending',
                message: 'Transaction not found or pending',
                receipt: null,
                logs: [],
            };
        }
        return {
            status: 'confirmed',
            message: 'Transaction confirmed',
            receipt: serializedReceipt,
            logs: serializedReceipt.logs,
        };
    };

    ///-------------------Updated Smart Contract-------------------///

    public retrieveMetaData = async (
        index: number
    ): Promise<{ cid: string; timestamp: string; uploader: string }> => {
        try {
            const metadata = (await this.contract.methods
                .getMetadata(index)
                .call({
                    from: this.account.address,
                })) as MetadataResult;

            if (!metadata) {
                throw new HttpError(HttpStatus.NOT_FOUND, 'Metadata not found');
            }

            const cid: string = metadata.cid ?? metadata[0];
            const uploaderAddress: string = metadata.uploader ?? metadata[2];

            const rawTimestamp = metadata.timestamp ?? metadata[1];

            const timestampNumber: number =
                typeof rawTimestamp === 'bigint' ||
                typeof rawTimestamp === 'string'
                    ? Number(rawTimestamp)
                    : rawTimestamp;
            if (
                !cid ||
                !uploaderAddress ||
                !timestampNumber ||
                Number.isNaN(timestampNumber)
            ) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Metadata incomplete'
                );
            }
            return {
                cid,
                timestamp: new Date(timestampNumber * 1000).toISOString(),
                uploader: uploaderAddress,
            };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'Blockchain Repository: Unexpected error occurred in retrieveMetaData',
                {
                    index,
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to retrieve metadata from blockchain'
            );
        }
    };

    public storeCID = async (cid: string): Promise<string | null> => {
        try {
            const gas: bigint = await this.contract.methods
                .storeCID(cid)
                .estimateGas({
                    from: this.account.address,
                });
            const gasString: string =
                typeof gas === 'bigint' ? gas.toString() : gas;
            if (!gasString) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Failed to convert gas to string'
                );
            }
            const gasPrice: bigint = await this.web3.eth.getGasPrice();
            const gasPriceString: string =
                typeof gasPrice === 'bigint' ? gasPrice.toString() : gasPrice;
            if (!gasPriceString) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Failed to convert gas price to string'
                );
            }
            const transaction = await this.contract.methods.storeCID(cid).send({
                from: this.account.address,
                gas: gasString,
                gasPrice: gasPriceString,
            });
            if (!transaction) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Failed to store cid to blockchain'
                );
            }
            return transaction.transactionHash ?? null;
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'Blockchain Repository: Unexpected error occurred in storeCID',
                {
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to store cid to blockchain'
            );
        }
    };

    public getLatestMetaDataIndex = async (): Promise<number> => {
        try {
            const metadataCount = await this.contract.methods
                .metadataCount()
                .call({
                    from: this.account.address,
                });
            if (!metadataCount) {
                throw new HttpError(
                    HttpStatus.NOT_FOUND,
                    'Metadata count not found'
                );
            }
            const index = Number(metadataCount);
            if (index === 0) {
                throw new HttpError(
                    HttpStatus.NO_CONTENT,
                    'Metadata is empty',
                    true
                );
            }
            if (Number.isNaN(index)) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'result can not be converted to number'
                );
            }
            return index - 1;
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'Blockchain Repository: Unexpected error occurred in getLatestMetaDataIndex',
                {
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to retrieve metadata count from blockchain'
            );
        }
    };

    public getMetadataByUploaderAndTimestamp = async (
        uploader: string,
        timestamp: string
    ): Promise<{
        cid: string;
        timestamp: string;
        uploader: string;
    }> => {
        try {
            const metadata = (await this.contract.methods
                .getMetadataByUploaderAndTimestamp(uploader, timestamp)
                .call({
                    from: this.account.address,
                })) as MetadataResultByUploaderAndTimestamp;
            if (!metadata) {
                throw new HttpError(HttpStatus.NOT_FOUND, 'Metadata not found');
            }

            const cid: string = metadata.cid ?? metadata[0];
            const uploaderAddress: string =
                metadata.storedUploader ?? metadata[2];

            const rawTimestamp = metadata.storedTimestamp ?? metadata[1];

            const timestampNumber: number =
                typeof rawTimestamp === 'bigint' ||
                typeof rawTimestamp === 'string'
                    ? Number(rawTimestamp)
                    : rawTimestamp;
            if (
                !cid ||
                !uploaderAddress ||
                !timestampNumber ||
                Number.isNaN(timestampNumber)
            ) {
                throw new HttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Metadata incomplete'
                );
            }
            return {
                cid,
                timestamp: new Date(timestampNumber * 1000).toISOString(),
                uploader: uploaderAddress,
            };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            logger.error(
                'Blockchain Repository: Unexpected error occurred in getMetadataByUploaderAndTimestamp',
                {
                    error: error?.message ?? error,
                }
            );
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to retrieve metadata count from blockchain'
            );
        }
    };
}

export default new BlockchainRepository();
