import React from 'react';
import { EventData } from '../common';
import { OverflowMenu } from '../overflow-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faPencilAlt, faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

interface EventDetailPanelProps {
    activeLayerTitle: string;
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
        activeLayerTitle, setActiveEventEdit, deleteEvent, paneHeaderHeight,
        showEditMenu
    }: EventDetailPanelProps) => {

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventDetail(null);
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
            <div className={'pane-content-header pane-content-header--event'}
                style={{ top: paneHeaderHeight }}>
                <button onClick={handleBack} className={'lt-button-back'}>
                    <span className={'lt-icons lt-button-back__icon'}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </span>
                    <div className={'lt-button-back__clip'}>
                        <span className={'lt-button-back__text'}>
                            {activeLayerTitle && (<>Back to {activeLayerTitle}</>)}
                        </span>
                    </div>
                </button>
            </div>
            <div className={'pane-content-body'}>
                <div className='lt-pane-section__header' data-cy={'event-detail-header'}>
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
                                classCustom: 'caution',
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete event marker',
                                confirmationTitle: 'Delete event?',
                                confirmationText:
                                    'Are you sure that you want to delete this event?',
                                confirmationButtonText: 'Delete',
                            }
                        ]}/>
                    )}
                </div>
                {activeEventDetail && activeEventDetail.media.length > 0 && (
                    <figure className={'lt-pane-section__image'}>
                        <img src={activeEventDetail.media[0].url} />
                        {(activeEventDetail.media[0].caption != '' ||
                            activeEventDetail.media[0].source != '') && (
                            <figcaption>
                                <div className={'img__caption'}>
                                    {activeEventDetail.media[0].caption}
                                </div>
                                <div className={'img__attr'}>
                                    {activeEventDetail.media[0].source}
                                </div>
                            </figcaption>
                        )}
                    </figure>
                )}
                {activeEventDetail && (
                    <section className={'lt-pane-section'}>
                        <div className={'event-attr'}>By {activeEventDetail.owner}</div>

                        <div dangerouslySetInnerHTML={
                            {__html: activeEventDetail.description}}/>
                        <hr className={'w-75 mt-5'} />
                    </section>
                )}
            </div>
        </>
    );
};

