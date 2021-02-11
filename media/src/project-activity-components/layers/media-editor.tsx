import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationCircle, faCheckCircle, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

export interface MediaEditorProps {
    fileS3Url: string | null;
    setFileS3Url(url: string | null): void;
    source: string | null;
    setSource(source: string): void;
    caption: string | null;
    setCaption(caption: string): void;
}

export const MediaEditor: React.FC<MediaEditorProps> = (
    { fileS3Url, setFileS3Url, source, setSource, caption, setCaption }: MediaEditorProps
) => {

    const [fileUploadProgress, setFileUploadProgress] = useState<number>(-1);
    const [fileUploadError, setFileUploadError] = useState<boolean>(false);
    const [fileUploadSuccess, setFileUploadSuccess] = useState<boolean>(false);

    const handleClearImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setFileS3Url(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        // Reset the form state prior to each upload
        setFileUploadProgress(-1);
        setFileS3Url(null);
        setFileUploadError(false);
        setFileUploadSuccess(false);

        ((): void => {
            new S3Upload({
                file_dom_selector: e.target.id,
                s3_sign_put_url: '/sign_s3/',
                s3_object_name: e.target.value,
                onProgress: (percent): void => {setFileUploadProgress(Number(percent));},
                onFinishS3Put: (url): void => {
                    setFileUploadSuccess(true);
                    setFileS3Url(url);
                },
                onError: (status): void => {
                    setFileUploadError(true);
                    console.error(status);
                }
            });
        })();
    };

    const handleCaption = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        setCaption(e.target.value);
    };

    const handleSource = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        setSource(e.target.value);
    };

    return (
        <>
            {!fileS3Url ? (
                <>
                    <p>
                        Reminder: Before uploading or sourcing an
                        image, you must have permission to use it.
                        Google provides an easy-to-use guide that
                        helps find and choose appropriate images.
                        See here for more information:
                        <a target="about:blank" href="https://support.google.com/websearch/answer/29508?hl=en">
                            Find free-to-use images</a>.
                    </p>
                    <div className={'row m-0'}>
                        <div className={'col-4 p-0 position-relative'}>
                            <div className={'lt-pane-section__imageplaceholder'} />
                            <div className={'upload-status'}>
                                {!fileUploadError &&
                                    fileUploadProgress > -1 &&
                                    fileUploadProgress < 100 && (
                                    <>
                                        <div className={'upload-status--progress'} />
                                        <div className={'upload-status__percent'}>
                                            {fileUploadProgress}%
                                        </div>
                                    </>
                                )}
                                {fileUploadError && (
                                    <div className={'upload-status--error'}>
                                        <FontAwesomeIcon
                                            icon={faExclamationCircle} size='2x'/>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={'col-8'}>
                            <input
                                type={'file'}
                                id={'form-field__image'}
                                className={'lt-file-button-upload'}
                                accept={'image/*'}
                                onChange={handleFileUpload}/>
                            {fileUploadError && (
                                <div className={'alert--error'}>
                                    There’s a problem with this image upload
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={'row m-0 mb-2 fade-load'}>
                        <div className={'col-4 p-0 position-relative'}>
                            <div className={'lt-pane-section__thumbnail'}>
                                <img src={fileS3Url} />
                            </div>
                            <div className={'upload-status'}>
                                {fileUploadSuccess && (
                                    <div className={'upload-status--success'}>
                                        <FontAwesomeIcon icon={faCheckCircle} size='2x'/>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={'col-8'}>
                            <button
                                onClick={handleClearImage}
                                type={'button'}
                                className={'lt-button'}>
                                <span className={'lt-icons lt-button__icon'}>
                                    <FontAwesomeIcon icon={faTrashAlt}/>
                                </span>
                                <span className={'lt-button__text'}>
                                    Remove this image
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className={'pane-form-subgroup'}>
                        <div className={'form-group'}>
                            <label htmlFor={'form-field__caption'}>Caption</label>
                            <input
                                type={'text'}
                                id={'form-field__caption'}
                                className={'form-control'}
                                value={caption || ''}
                                onChange={handleCaption}
                                autoFocus={true} />
                        </div>
                        <div className={'form-group'}>
                            <label htmlFor={'form-field__imgsrc'}>Source</label>
                            <input
                                type={'text'}
                                id={'form-field__imgsrc'}
                                className={'form-control'}
                                value={source || ''}
                                onChange={handleSource}/>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
