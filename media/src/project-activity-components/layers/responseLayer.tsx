import React, { useState, useEffect, useRef } from 'react';
import { EventData, LayerData, ResponseData } from '../common';
import { ConfirmableAction } from '../overflow-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEyeSlash, faAngleDown, faAngleRight, faBars, faMapMarker,
    faPencilAlt, faTrashAlt, faLightbulb
} from '@fortawesome/free-solid-svg-icons';

export interface LayerProps {
    layer: LayerData;
    activeLayer?: number | null;
    setActiveLayer?(pk: number): void;
    deleteLayer?(pk: number): void;
    updateLayer?(pk: number, title: string): void;
    layerVisibility?: Map<number, boolean>;
    toggleLayerVisibility?(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    setActiveEventDetail(d: EventData | null): void;
    activeEventEdit: EventData | null;
    responseData: ResponseData[] | null;
}

export const ResponseLayer: React.FC<LayerProps> = (
    {
        layer, activeLayer, setActiveLayer,
        layerVisibility, toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, responseData
    }: LayerProps) => {
    const [openLayerMenu, setOpenLayerMenu] = useState<boolean>(false);
    const [isLayerCollapsed, setIsLayerCollapsed] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (openLayerMenu) {
            const closeMenu = (e: MouseEvent): void => {
                if (e.target instanceof Element && menuRef.current &&
                        !menuRef.current.contains(e.target)) {
                    setOpenLayerMenu(false);
                }
            };
            document.addEventListener('click', closeMenu);
            return () => {
                document.removeEventListener('click', closeMenu);
            };
        }
    }, [openLayerMenu]);

    const handleSetActiveLayer = (): void => {
        if (setActiveLayer) {
            setActiveLayer(layer.pk);
        }
    };

    const isActiveLayer = layer.pk == activeLayer;

    const handleLayerCollapse = (): void => {
        setIsLayerCollapsed((prev) => { return !prev;});
    };

    const handleLayerVisibility = (): void => {
        if (toggleLayerVisibility) {
            toggleLayerVisibility(layer.pk);
        }
    };

    return (
        <div
            className={'lt-list-group ' +
                (isActiveLayer ? 'lt-list-group--active' : '')}
            onClick={handleSetActiveLayer}
            data-cy="layer">
            <div className={'lt-list-group__header'}>
                {/* Layer title */}
                <h2 className="lt-list-group__title order-2" data-cy="layer-title">
                    {layer.title}
                </h2>
                {/* Layer show-hide and expand-collapse */}
                <div className="lt-list-group__action leading order-1">
                    {layerVisibility && (
                        <button
                            onClick={handleLayerVisibility}
                            className={'lt-icon-button'}
                            aria-label={layerVisibility ? 'Hide layer' : 'Show layer'}
                            data-cy={'layer-visibility'}>
                            <span className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon
                                    icon={layerVisibility.get(layer.pk) ? faEye : faEyeSlash}/>
                            </span>
                        </button>
                    )}
                    <button
                        onClick={handleLayerCollapse}
                        className={'lt-icon-button'}
                        aria-label={isLayerCollapsed ? 'Expand layer' : 'Collapse layer'}
                        data-cy={'layer-toggle'}>
                        <span className={'lt-icons lt-icon-button__icon'}
                            aria-hidden='true'>
                            <FontAwesomeIcon
                                icon={isLayerCollapsed ? faAngleRight : faAngleDown}/>
                        </span>
                    </button>
                </div>
            </div>
            { !isLayerCollapsed && (
                <>
                    {layer.events.length > 0  ? (
                        <ul className={'lt-list lt-list-layer'}>
                            {layer.events.map((val, idx) => {
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
                                                <FontAwesomeIcon icon={faMapMarker}/> {/* eslint-disable-line max-len */}
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
                                                className={'lt-button btn-sm trailing'}
                                                data-cy={'event-detail-more'}>
                                                <span className='lt-button__label'>More</span>
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <>
                            {isActiveLayer ? (
                                <div data-cy="layer-prompt" className={'lt-banner-tip-prompt'}>
                                    <span className={'lt-icons lt-banner__icon'}>
                                        <FontAwesomeIcon icon={faLightbulb}/>
                                    </span>
                                    <span className={'lt-banner__text'}>
                                        Click on the map to add events in {layer.title}.
                                    </span>
                                </div>
                            ) : (
                                <div data-cy="layer-prompt-muted"
                                    className={'lt-banner-tip-muted'} role="alert">
                                    <span className={'lt-banner__text'}>
                                        {layer.title} is empty.
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

