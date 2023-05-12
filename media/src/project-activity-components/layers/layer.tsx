import React, { useState, useEffect, useRef } from 'react';
import { EventData, LayerData } from '../common';
import { ConfirmableAction } from '../overflow-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEyeSlash, faAngleDown, faAngleRight, faEdit, faMapMarker,
    faPencilAlt, faTrashAlt, faLightbulb, faExclamationCircle
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
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>('');
    const [openLayerMenu, setOpenLayerMenu] = useState<boolean>(false);
    const [isLayerCollapsed, setIsLayerCollapsed] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUpdatedLayerTitle(layer.title);
    }, [layer.title]);

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

    const handleUpdatedLayerTitle = (
        e: React.ChangeEvent<HTMLInputElement>): void => {
        setUpdatedLayerTitle(e.target.value);
    };

    const handleUpdateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (updateLayer) {
            updateLayer(layer.pk, updatedLayerTitle);
            setOpenLayerMenu(false);
        }
    };

    const handleDeleteLayer = (): void => {
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

    const isUntitled = (title: string): boolean => {
        if(title.toLowerCase() === 'untitled layer') {
            return true;
        } else {
            return false;
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
                <h2 className={'lt-list-group__title order-2'}
                    data-cy="layer-title">
                    {isUntitled(layer.title) ? (
                        <span className={'lt-list-group__title-default'}>
                            {layer.title} *
                        </span>
                    ):(
                        <span>{layer.title}</span>
                    )}
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
                {updateLayer && deleteLayer && (
                    <div ref={menuRef} className={'lt-menu-overflow trailing order-3'}>
                        <button onClick={handleLayerMenu}
                            className={'lt-icon-button'}
                            aria-label={openLayerMenu ?
                                'Hide more actions' : 'Show more actions'}
                            data-cy={'layer-menu'}>
                            <span
                                className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon icon={faEdit}/>
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
                                            className={'d-flex flex-column'}
                                            data-cy="layer-rename">
                                            <label
                                                className={'lt-menu-form__label'}>
                                                Rename layer:
                                            </label>
                                            <input id={`update-layer-title-${layer.pk}`}
                                                value={updatedLayerTitle}
                                                onChange={handleUpdatedLayerTitle}
                                                className={'form-control lt-menu-form__input-text'}
                                                type="text"
                                                data-cy={'layer-rename-title'}/>
                                            <div className={'lt-menu-form__button-group'}>
                                                <button
                                                    type={'button'}
                                                    onClick={handleLayerMenu}
                                                    data-cy={'layer-rename-cancel'}
                                                    className={'lt-button lt-button--outlined leading'}> {/* eslint-disable-line max-len */}
                                                    <span className={'lt-button__label'}>
                                                        Cancel
                                                    </span>
                                                </button>
                                                <button type={'submit'}
                                                    className={'lt-button lt-button--priority'}
                                                    data-cy={'layer-rename-save'}>
                                                    <span className={'lt-button__label'}>
                                                        Save
                                                    </span>
                                                </button>
                                            </div>
                                        </form>
                                    </li>
                                    <li className={'lt-list-item lt-list-item--caution'}
                                        role='menuitem'
                                        data-cy="layer-delete">
                                        <ConfirmableAction
                                            icon={<FontAwesomeIcon icon={faTrashAlt}/>}
                                            handler={handleDeleteLayer}
                                            label={'Delete layer'}
                                            confirmationTitle={'Delete layer?'}
                                            confirmationText={
                                                'Are you sure you want to delete this layer?'}
                                            confirmationButtonText={'Delete'}
                                            setShowMenu={setOpenLayerMenu}/>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
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
                            {isUntitled(layer.title) && (
                                <div data-cy="untitled-prompt" className={'lt-banner-tip-plain'}>
                                    <span className={'lt-icons lt-banner__icon'}>
                                        <FontAwesomeIcon icon={faExclamationCircle}/>
                                    </span>
                                    <span className={'lt-banner__text'}>
                                        This layer is untitled. <a href='#'
                                            onClick=  {handleLayerMenu}>Rename it?</a>
                                    </span>
                                </div>
                            )}
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

