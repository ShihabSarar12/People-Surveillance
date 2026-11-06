import blockchainService, { PublicUser } from '../services/blockchain.service';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import HttpStatus from '../constants/status.constant';
import isValidCID from '../utilities/isValidCID.utility';

/**
 * @swagger
 * tags:
 *   name: Blockchain
 *   description: API to manage blockchain operations
 */
class BlockchainController {
    constructor() {}

    public initialize = asyncHandler(
        async (_: Request, res: Response): Promise<void> => {
            res.status(HttpStatus.OK).json({
                message: 'Blockchain controller initialized successfully',
            });
        }
    );

    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/blockchain/store:
     *   post:
     *     summary: stores data (Integer) to the blockchain
     *     description: Stores the provided integer data to the blockchain smart contract.
     *     tags: [Blockchain]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - data
     *             properties:
     *               data:
     *                 type: number
     *                 format: number
     *                 example: 12345
     *     responses:
     *       200:
     *         description: A single transaction receipt
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Data stored to blockchain successfully
     *                 transactionReceipt:
     *                   type: string
     *                   description: The transaction receipt object
     *                   example: 0xabc123d...def456
     *       400:
     *         description: Invalid data provided or wrong data format
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid data provided or wrong data format
     *                 transactionReceipt:
     *                   type: object
     *                   nullable: true
     *                   example: null
     *       500:
     *         description: Failed to store data to blockchain
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Failed to store data to blockchain
     *                 transactionReceipt:
     *                   type: object
     *                   nullable: true
     *                   example: null
     */
    /* prettier-ignore-end */
    public storeDataToBlockchain = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { data } = req.body;
            if (!data || isNaN(Number(data))) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid data provided. Data must be a number.',
                    transactionReceipt: null,
                });
                return;
            }
            const receipt = await blockchainService.storeDataToBlockchain(
                Number(data)
            );
            if (!receipt) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Failed to store data to blockchain',
                    transactionReceipt: null,
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                message: 'Data stored to blockchain successfully',
                transactionReceipt: receipt,
            });
        }
    );

    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/blockchain/retrieve:
     *   get:
     *     summary: retrieves data (Integer) from the blockchain
     *     description: retrieves the integer data from the blockchain smart contract.
     *     tags: [Blockchain]
     *     responses:
     *       200:
     *         description: data (Integer) retrieved from blockchain
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Data retrieved from blockchain successfully
     *                 data:
     *                   type: number
     *                   nullable: true
     *                   description: The integer data retrieved from the blockchain
     *                   example: 12345
     *       500:
     *         description: Failed to retrieve data from blockchain
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Failed to retrieve data from blockchain
     *                 data:
     *                   type: object
     *                   nullable: true
     *                   example: null
     */
    /* prettier-ignore-end */
    public retrieveDataFromBlockchain = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const data = await blockchainService.retrieveDataFromBlockchain();
            if (!data) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Failed to retrieve data from blockchain',
                    data: null,
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                message: 'Data retrieved from blockchain successfully',
                data,
            });
        }
    );

    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/blockchain/tx:
     *   post:
     *     summary: Get transaction status from the blockchain
     *     description: Retrieves the status and receipt of a blockchain transaction using its hash.
     *     tags: [Blockchain]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - hash
     *             properties:
     *               hash:
     *                 type: string
     *                 format: hex
     *                 description: The transaction hash to look up
     *                 example: 0x16b7cfa390132ca0ed5d9dc4e814026748173d1ea5f9367b2edb835469534149
     *     responses:
     *       200:
     *         description: Transaction status retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: confirmed
     *                 message:
     *                   type: string
     *                   example: Transaction confirmed
     *                 receipt:
     *                   type: object
     *                   description: Raw blockchain transaction receipt
     *                   properties:
     *                     transactionHash:
     *                       type: string
     *                     transactionIndex:
     *                       type: string
     *                     blockHash:
     *                       type: string
     *                     blockNumber:
     *                       type: string
     *                     from:
     *                       type: string
     *                     to:
     *                       type: string
     *                     gasUsed:
     *                       type: string
     *                     cumulativeGasUsed:
     *                       type: string
     *                     logs:
     *                       type: array
     *                       items:
     *                         type: object
     *                     status:
     *                       type: string
     *                     logsBloom:
     *                       type: string
     *       400:
     *         description: Missing or invalid transaction hash
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Transaction hash is required
     *       500:
     *         description: Failed to retrieve the transaction status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Failed to retrieve the transaction status
     */
    /* prettier-ignore-end */
    public getTransactionStatus = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { hash } = req.body;
            if (!hash) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Transaction hash is required',
                });
                return;
            }
            const status = await blockchainService.getTransactionStatus(hash);
            if (!status) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to retrieve the transaction status',
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                ...status,
            });
        }
    );

    public retrieveMetaDataFromBlockchain = asyncHandler(
        async (_: Request, res: Response) => {
            const metadata =
                await blockchainService.retrieveLastMetaDataFromBlockchain();
            if (!metadata) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message:
                        'Failed to retrieve lastest metadata from blockchain',
                    metadata: null,
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Successfully retrieved metadata',
                metadata,
            });
        }
    );

    public storeCIDToBlockchain = asyncHandler(
        async (req: Request, res: Response) => {
            const { cid } = req.body;
            if (!cid || !isValidCID(cid)) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'cid is required or is not valid',
                    transactionHash: null,
                });
            }
            const transactionHash =
                await blockchainService.storeCIDToBlockchain(cid);
            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Successfully stored cid to blockchain',
                transactionHash,
            });
        }
    );

    public uploadVideoToIPFS = asyncHandler(
        async (req: Request, res: Response) => {
            if (!req.file) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to upload video to server',
                    data: null,
                });
                return;
            }
            const result = await blockchainService.uploadFileToIPFS(
                req.file.path
            );
            if (!result) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to upload file to IPFS',
                    data: null,
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Successfully uploaded file to IPFS',
                data: result,
            });
        }
    );

    public downloadFileFromIPFS = asyncHandler(
        async (req: Request, res: Response) => {
            const { cid } = req.body;
            if (!cid || !isValidCID(cid)) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'cid is required or is not valid',
                    data: null,
                });
                return;
            }
            const fileBuffer = await blockchainService.downloadFileFromIPFS(
                cid
            );
            if (!fileBuffer) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to download file from IPFS',
                    data: null,
                });
                return;
            }
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${cid}"`
            );
            res.status(HttpStatus.OK).send(fileBuffer);
        }
    );

    public getMetadataByUploaderAndTimestamp = asyncHandler(
        async (req: Request, res: Response) => {
            const { uploader, timestamp } = req.body;
            if (!uploader || typeof uploader !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'uploader is required or is not valid',
                    metadata: null,
                });
                return;
            }
            if (!timestamp || typeof timestamp !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'timestamp is required or is not valid',
                    metadata: null,
                });
                return;
            }
            let timestampInSeconds: string;
            if (/^\d+$/.test(timestamp)) {
                timestampInSeconds = timestamp;
            } else {
                const parsedTimestamp = Date.parse(timestamp);
                if (Number.isNaN(parsedTimestamp)) {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: 'Invalid timestamp format',
                        metadata: null,
                    });
                    return;
                }
                timestampInSeconds = Math.floor(
                    parsedTimestamp / 1000
                ).toString();
            }
            const metadata =
                await blockchainService.retrieveMetaDataByUploaderAndTimestamp(
                    uploader,
                    timestampInSeconds
                );
            if (!metadata) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message:
                        'Failed to retrieve lastest metadata from blockchain',
                    metadata: null,
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Successfully retrieved metadata',
                metadata,
            });
        }
    );
}

export default new BlockchainController();
