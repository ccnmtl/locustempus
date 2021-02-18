import React, { useState } from 'react';
import { EventData } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faEllipsisV, faPencilAlt, faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

interface EventDetailPanelProps {
    activeLayer: number | null;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData | null): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData | null): void;
    deleteEvent(pk: number, layerPk: number): void;
    showEditMenu: boolean;
    paneHeaderHeight: number;
}

export const EventDetailPanel: React.FC<EventDetailPanelProps> = (
    {
        activeLayer, activeEventDetail, setActiveEventDetail,
        setActiveEventEdit, deleteEvent, paneHeaderHeight, showEditMenu
    }: EventDetailPanelProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventDetail(null);
    };

    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowMenu((prev) => {return !prev;});
    };

    const handleDelete = (e: React.MouseEvent): void => {
        e.preventDefault();
        if (activeEventDetail && activeLayer) {
            deleteEvent(activeEventDetail.pk, activeLayer);
            setActiveEventDetail(null);
        }
    };

    const handleEdit = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveEventEdit(activeEventDetail);
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <button onClick={handleBack} className={'lt-button-back'}>
                    <span className={'lt-icons lt-button-back__icon'}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </span>
                    <span className={'lt-button-back__text'}>Back</span>
                </button>
            </div>
            <div className={'pane-content-body'}>
                <div className='lt-pane-section__header'>
                    <h2>{activeEventDetail && activeEventDetail.label}</h2>
                    <div className={'lt-menu-overflow trailing'}>
                        {showEditMenu && (
                            <button onClick={handleMenuToggle}
                                className={'lt-icon-button lt-icon-button--transparent'}
                                aria-label={showMenu ?
                                    'Hide more actions' : 'Show more actions'}>
                                <span
                                    className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden='true'>
                                    <FontAwesomeIcon icon={faEllipsisV}/>
                                </span>
                            </button>
                        )}
                        {showMenu && (
                            <div className={'lt-menu lt-menu-overflow--expand'}>
                                <ul className={'lt-list'} role='menu'>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        <a href='#' onClick={handleEdit}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faPencilAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Edit event marker
                                            </span>
                                        </a>
                                    </li>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        {/* TODO: Implement confirmation */}
                                        <a href='#' onClick={handleDelete}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faTrashAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Delete event marker
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {activeEventDetail && activeEventDetail.media.length > 0 && (
                    <figure className={'lt-pane-section__image'}>
                        <img src={activeEventDetail.media[0].url} />
                        <figcaption>
                            {activeEventDetail.media[0].caption}<br/>
                            <small>
                                Source: {activeEventDetail.media[0].source}
                            </small>
                        </figcaption>
                    </figure>

                )}
                {activeEventDetail && (
                    <div className={'lt-pane-section__event-desc'} dangerouslySetInnerHTML={
                        {__html: activeEventDetail.description}}/>
                )}
            </div>
        </>
    );
};

