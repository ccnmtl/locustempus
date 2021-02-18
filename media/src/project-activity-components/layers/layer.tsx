import React, { useState, useEffect, useRef } from 'react';
import { EventData, LayerData } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEyeSlash, faAngleDown, faAngleRight, faEllipsisV, faMapMarker,
    faPencilAlt, faTrashAlt
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
}

export const Layer: React.FC<LayerProps> = (
    {
        layer, activeLayer, setActiveLayer, deleteLayer, updateLayer,
        layerVisibility, toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail
    }: LayerProps) => {
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>(layer.title);
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
            /* eslint-disable-next-line scanjs-rules/call_addEventListener */
            document.addEventListener('click', closeMenu);
            return () => {
                document.removeEventListener('click', closeMenu);
            };
        }
    }, [openLayerMenu]);

    const handleUpdatedLayerTitle = (
        e: React.ChangeEvent<HTMLInputElement>): void => {
        setUpdatedLayerTitle(e.target.value);
    };

    const handleUpdateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (updateLayer) {
            updateLayer(layer.pk, updatedLayerTitle);
        }
    };

    const handleDeleteLayer = (e: React.FormEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        if (deleteLayer) {
            deleteLayer(layer.pk);
        }
    };

    const handleSetActiveLayer = (): void => {
        if (setActiveLayer) {
            setActiveLayer(layer.pk);
        }
    };

    const isActiveLayer = layer.pk == activeLayer;

    const handleLayerMenu = (): void => {
        setOpenLayerMenu((prev) => { return !prev;});
    };

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
            onClick={handleSetActiveLayer}>
            <div className={'lt-list-group__header'}>
                {/* Layer title */}
                <h2 className="lt-list-group__title order-2">{layer.title}</h2>
                {/* Layer show-hide and expand-collapse */}
                <div className="lt-list-group__action leading order-1">
                    {layerVisibility && (
                        <button
                            onClick={handleLayerVisibility}
                            className={'lt-icon-button lt-icon-button--transparent'}
                            aria-label={layerVisibility ? 'Hide layer' : 'Show layer'}>
                            <span className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon
                                    icon={layerVisibility.get(layer.pk) ? faEye : faEyeSlash}/>
                            </span>
                        </button>
                    )}
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
                {updateLayer && deleteLayer && (
                    <div ref={menuRef} className={'lt-menu-overflow trailing order-3'}>
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
                                    <li className={'lt-list-item lt-menu-form'} role='menuitem'>
                                        <span
                                            className={'lt-icons lt-list-item__icon'}
                                            aria-hidden='true'>
                                            <FontAwesomeIcon icon={faPencilAlt}/>
                                        </span>
                                        <form onSubmit={handleUpdateLayer}
                                            className={'d-flex flex-column'}>
                                            <label
                                                className={'lt-menu-form__label'}>
                                                Rename layer:
                                            </label>
                                            <input id={`update-layer-title-${layer.pk}`}
                                                value={updatedLayerTitle}
                                                onChange={handleUpdatedLayerTitle}
                                                className={'form-control lt-menu-form__input-text'}
                                                type="text"/>
                                            <div className={'lt-menu-form__button-group'}>
                                                <input type='button'
                                                    onClick={handleLayerMenu}
                                                    className={'lt-button all-transparent leading'}
                                                    value={'Cancel'} />
                                                <input type='submit'
                                                    className={'lt-button'}
                                                    value={'Save'} />
                                            </div>
                                        </form>
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
                            </div>
                        )}
                    </div>
                ) }
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
                    ) : (
                        <div className={'alert alert-secondary'}>
                            Click on the map to add events in this layer.
                        </div>
                    )}
                </>
            ) }
        </div>
    );
};

