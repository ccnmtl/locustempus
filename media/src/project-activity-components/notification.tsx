import React from 'react';

interface NotificationProps {
    alertString: string;
    closeHandler(): void;
}

export const Notification: React.FC<NotificationProps> = (
    {alertString, closeHandler}: NotificationProps) => {
    const handleClick = (evt: React.MouseEvent<HTMLButtonElement>): void => {
        evt.preventDefault();
        closeHandler();
    };

    return (
        <div className="lt-alert lt-alert--top alert alert-dismissible fade show" role="status">
            <div className="lt-alert__text">
                {alertString}
            </div>
            <button
                onClick={handleClick}
                className="close lt-icon-button lt-button--transparent"
                aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};
