import React, { useState } from 'react';
import { EventData } from '../common';
import { OverflowMenu } from '../overflow-menu';
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

    const handleDelete = (): void => {
        if (activeEventDetail && activeLayer) {
            deleteEvent(activeEventDetail.pk, activeLayer);
            setActiveEventDetail(null);
        }
    };

    const handleEdit = (): void => {
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
                    {showEditMenu && (
                        <OverflowMenu items={[
                            {
                                handler: handleEdit,
                                icon: <FontAwesomeIcon icon={faPencilAlt}/>,
                                label: 'Edit event marker'
                            },
                            {
                                handler: handleDelete,
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete event marker'
                            }
                        ]}/>
                    )}
                </div>
                {activeEventDetail && activeEventDetail.media.length > 0 && (
                    <figure className={'lt-pane-section__image'}>
                        <img src={activeEventDetail.media[0].url} />
                        <figcaption>
                            {activeEventDetail.media[0].caption}<br/>
                            <small>
                                Source: {activeEventDetail.media[0].caption}
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

