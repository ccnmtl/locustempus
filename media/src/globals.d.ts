type InitialData = {
    staticUrl: string;
    baseUrl: string;
    currentUser: {
        [id: string]: string;
    };
}

declare const LocusTempus: InitialData;

type S3UploadSettings = {
    file_dom_selector: string;
    s3_sign_put_url: string;
    s3_object_name: string;
    onProgress(percent: string, message: string): void;
    onFinishS3Put(url: string): void;
    onError(status: string): void;
}

interface Callable {
    new(): void;
}

declare class S3Upload extends Callable {
    constructor(settings: S3UploadSettings);
}
