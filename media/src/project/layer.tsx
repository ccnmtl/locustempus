import React, { useState } from 'react';
import { LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEyeSlash, faAngleDown, faAngleRight, faEllipsisV, faMapMarker,
    faPencilAlt, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

export interface LayerProps {
    title: string;
    pk: number;
    activeLayer: number | null;
    layerEvents: LayerEventDatum[];
    setActiveLayer(pk: number): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    layerVisibility: boolean;
    setLayerVisibility(pk: number): void;
    activeEvent: LayerEventDatum | null;
    setActiveEvent(d: LayerEventDatum): void;
    setActiveEventDetail(d: LayerEventDatum | null): void;
    activeEventEdit: LayerEventDatum | null;
}

export const Layer: React.FC<LayerProps> = (
    {title, pk, activeLayer, layerEvents, setActiveLayer,
        deleteLayer, updateLayer, layerVisibility, setLayerVisibility,
        activeEvent, setActiveEvent, setActiveEventDetail
    }: LayerProps) => {
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>(title);
    const [openLayerMenu, setOpenLayerMenu] = useState<boolean>(false);
    const [isLayerCollapsed, setIsLayerCollapsed] = useState<boolean>(false);

    const handleUpdatedLayerTitle = (
        e: React.ChangeEvent<HTMLInputElement>): void => {
        setUpdatedLayerTitle(e.target.value);
    };

    const handleUpdateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateLayer(pk, updatedLayerTitle);
    };

    const handleDeleteLayer = (e: React.FormEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        deleteLayer(pk);
    };

    const handleSetActiveLayer = (): void => {
        setActiveLayer(pk);
    };

    const isActiveLayer = pk == activeLayer;

    const handleLayerMenu = (): void => {
        setOpenLayerMenu((prev) => { return !prev;});
    };

    const handleLayerCollapse = (): void => {
        setIsLayerCollapsed((prev) => { return !prev;});
    };

    const handleLayerVisibility = (): void => {
        setLayerVisibility(pk);
    };

    return (
        <div
            className={'lt-list-group ' +
                (isActiveLayer ? 'lt-list-group--active' : '')}
            onClick={handleSetActiveLayer}>
            <div className={'lt-list-group__header'}>
                {/* Layer title */}
                <h2 className="lt-list-group__title order-2">{title}</h2>
                {/* Layer show-hide and expand-collapse */}
                <div className="lt-list-group__action leading order-1">
                    <button
                        onClick={handleLayerVisibility}
                        className={'lt-icon-button lt-icon-button--transparent'}
                        aria-label={layerVisibility ? 'Hide layer' : 'Show layer'}>
                        <span className={'lt-icons lt-icon-button__icon'}
                            aria-hidden='true'>
                            <FontAwesomeIcon
                                icon={layerVisibility ? faEye : faEyeSlash}/>
                        </span>
                    </button>
                    <button
                        onClick={handleLayerCollapse}
                        className={'lt-icon-button lt-icon-button--transparent'}
                        aria-label={isLayerCollapsed ? 'Expand layer' : 'Collapse layer'}>
                        <span className={'lt-icons lt-icon-button__icon'}
                            aria-hidden='true'>
                            <FontAwesomeIcon
                                icon={isLayerCollapsed ? faAngleRight : faAngleDown}/>
                        </span>
                    </button>
                </div>
                <div className={'lt-menu-overflow trailing order-3'}>
                    <button onClick={handleLayerMenu}
                        className={'lt-icon-button lt-icon-button--transparent'}
                        aria-label={openLayerMenu ?
                            'Hide more actions' : 'Show more actions'}>
                        <span
                            className={'lt-icons lt-icon-button__icon'}
                            aria-hidden='true'>
                            <FontAwesomeIcon icon={faEllipsisV}/>
                        </span>
                    </button>
                    {openLayerMenu && (
                        <div className={'lt-menu lt-menu-overflow--expand'}>
                            <ul className={'lt-list'} role='menu'>
                                <li className={'lt-list-item'} role='menuitem'>
                                    <span
                                        className={'lt-icons lt-list-item__icon'}
                                        aria-hidden='true'>
                                        <FontAwesomeIcon icon={faPencilAlt}/>
                                    </span>
                                    <span
                                        className={'lt-list-item__primary-text'}>
                                        Rename layer
                                    </span>
                                </li>
                                <li className={'lt-list-item'} role='menuitem'>
                                    <a href='#' onClick={handleDeleteLayer}
                                        className={'lt-list-item__link'}>
                                        <span
                                            className={'lt-icons lt-list-item__icon'}
                                            aria-hidden='true'>
                                            <FontAwesomeIcon icon={faTrashAlt}/>
                                        </span>
                                        <span
                                            className={'lt-list-item__primary-text'}>
                                            Delete layer
                                        </span>
                                    </a>
                                </li>
                            </ul>
                            <form onSubmit={handleUpdateLayer}>
                                <label>Layer Title:</label>
                                <div className="row mx-0"
                                    style={{width: '20rem'}}>
                                    <input id={`update-layer-title-${pk}`}
                                        value={updatedLayerTitle}
                                        onChange={handleUpdatedLayerTitle}
                                        className="form-control col-8" type="text"/>
                                    <input type='submit'
                                        className='btn btn-primary col-4' value={'Edit Layer'}/>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            { !isLayerCollapsed && (
                <>
                    {layerEvents.length > 0 ? layerEvents.length : 'nothing'}
                    <ul className={'lt-list lt-list-layer'}>
                        {layerEvents.map((val, idx) => {
                            return (
                                <li key={idx}
                                    className={'lt-list-item lt-list-layer-item' +
                                        (activeEvent && activeEvent.pk === val.pk ?
                                            ' lt-list-layer-item--active' : '')}>
                                    <div className={'lt-list-item__link'}
                                        role='button' tabIndex={0}
                                        onClick={(): void => {setActiveEvent(val);}}>
                                        <span className={'lt-icons lt-list-item__icon'}
                                            aria-hidden='true'>
                                            <FontAwesomeIcon icon={faMapMarker}/>
                                        </span>
                                        <span className={'lt-list-item__primary-text'}>
                                            {val.label}
                                        </span>
                                    </div>
                                    {activeEvent && activeEvent.pk === val.pk && (
                                        <button
                                            type="button"
                                            onClick={(): void => {
                                                setActiveEventDetail(val);}}
                                            className={'lt-button btn-sm trailing'}>
                                            <span className='lt-button__text'>More</span>
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) }
        </div>
    );
};

