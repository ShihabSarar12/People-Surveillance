interface MetadataResult {
    0: string;
    1: string | number | bigint;
    2: string;

    cid: string;
    timestamp: string | number | bigint;
    uploader: string;
}

interface MetadataResultByUploaderAndTimestamp {
    0: string;
    1: string | number | bigint;
    2: string;

    cid: string;
    storedTimestamp: string | number | bigint;
    storedUploader: string;
}

export { MetadataResult, MetadataResultByUploaderAndTimestamp };
