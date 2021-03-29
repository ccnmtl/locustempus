import React, { useState, useRef, useEffect, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
    handler(): void;
    icon: ReactElement;
    label: string;
    confirmationTitle?: string;
    confirmationText?: string;
    confirmationButtonText?: string;
}

interface ConfirmableActionProps {
    handler(): void;
    icon: ReactElement;
    label: string;
    confirmationTitle: string;
    confirmationText: string;
    confirmationButtonText: string;
    setShowMenu(show: boolean): void;
}

export const ConfirmableAction: React.FC<ConfirmableActionProps> = ({
    handler, icon, label, confirmationTitle, confirmationText,
    confirmationButtonText, setShowMenu}: ConfirmableActionProps) => {
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setShowConfirmation(false);
        setShowMenu(false);
    };

    const handleConfirmation = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        handler();
        setShowConfirmation(false);
        setShowMenu(false);
    };

    return (
        <>
            {showConfirmation && (
                <div id="lt-confirmation-modal"
                    tabIndex={-1}
                    role="dialog"
                    onClick={handleCancel}
                    aria-labelledby="confirmableActionLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="confirmableActionLabel">
                                    {confirmationTitle}
                                </h5>
                                <button type="button"
                                    onClick={handleCancel}
                                    className="close"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {confirmationText}
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                    onClick={handleCancel}
                                    className="btn btn-secondary lt-modal-cancel">
                                    Close
                                </button>
                                <button type="button"
                                    onClick={handleConfirmation}
                                    className="btn btn-primary">
                                    {confirmationButtonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <a href='#'
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    setShowConfirmation(true);}}
                className={'lt-list-item__link'}>
                <span
                    className={'lt-icons lt-list-item__icon'}
                    aria-hidden='true'>
                    {icon}
                </span>
                <span
                    className={'lt-list-item__primary-text'}>
                    {label}
                </span>
            </a>
        </>
    );
};

interface OverflowMenuProps {
    items: MenuItem[];
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({items}: OverflowMenuProps) => {

    const [showMenu, setShowMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (e: MouseEvent): void => {
            if (e.target instanceof Element && menuRef.current &&
                    !menuRef.current.contains(e.target)) {
                if (showMenu) {
                    setShowMenu(false);
                }
            }
        };
        /* eslint-disable-next-line scanjs-rules/call_addEventListener */
        document.addEventListener('click', closeMenu);
        return () => {
            document.removeEventListener('click', closeMenu);
        };
    }, [showMenu]);

    return (
        <div ref={menuRef} className={'lt-menu-overflow trailing'}>
            <button onClick={() => setShowMenu((prev) => !prev)}
                className={'lt-icon-button lt-icon-button--transparent'}
                aria-label={showMenu ?
                    'Hide more actions' : 'Show more actions'}>
                <span
                    className={'lt-icons lt-icon-button__icon'}
                    aria-hidden='true'>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </span>
            </button>
            {showMenu && (
                <div className={'lt-menu lt-menu-overflow--expand'}>
                    <ul className={'lt-list'} role='menu'>
                        {items.map((item, idx) => {
                            return (
                                <li className={'lt-list-item'} role='menuitem' key={idx}>
                                    { /* eslint-disable-next-line max-len */ }
                                    {item.confirmationTitle && item.confirmationText && item.confirmationButtonText ? (
                                        <ConfirmableAction
                                            // eslint-disable-next-line max-len
                                            // eslint-disable-next-line @typescript-eslint/unbound-method
                                            handler={item.handler}
                                            icon={item.icon}
                                            label={item.label}
                                            confirmationTitle={item.confirmationTitle}
                                            confirmationText={item.confirmationText}
                                            confirmationButtonText={item.confirmationButtonText}
                                            setShowMenu={setShowMenu}/>
                                    ) : (
                                        <a href='#'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                item.handler();
                                                setShowMenu(false);}}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                {item.icon}
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                {item.label}
                                            </span>
                                        </a>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};
