import React, { useState } from 'react';
import { LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faAngleDown, faAngleUp, faEllipsisV, faMapMarker } from '@fortawesome/free-solid-svg-icons';

export interface LayerProps {
    title: string;
    pk: number;
    activeLayer: number | null;
    layerEvents: LayerEventDatum[];
    setActiveLayer(pk: number): any;
    content_object: string; // The API URL to the parent project/response
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
    layerVisibility: boolean;
    setLayerVisibility(pk: number): any;
    activeEvent: LayerEventDatum | null;
    setActiveEvent(d: LayerEventDatum): any;
    activeEventDetail: LayerEventDatum | null;
    setActiveEventDetail(d: LayerEventDatum | null): any;
    activeEventEdit: LayerEventDatum | null;
    setActiveEventEdit(d: LayerEventDatum | null): any;
}

export const Layer = (
    {title, pk, activeLayer, layerEvents, setActiveLayer, content_object,
        deleteLayer, updateLayer, layerVisibility, setLayerVisibility,
        activeEvent, setActiveEvent, activeEventDetail, setActiveEventDetail,
        activeEventEdit, setActiveEventEdit}: LayerProps)=> {
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>(title);
    const [openLayerMenu, setOpenLayerMenu] = useState<boolean>(false);
    const [isLayerCollapsed, setIsLayerCollapsed] = useState<boolean>(false);

    const handleUpdatedLayerTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedLayerTitle(e.target.value);
    };
    const handleUpdateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateLayer(pk, updatedLayerTitle);
    };

    const handleDeleteLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        deleteLayer(pk);
    };

    const handleSetActiveLayer = (e: React.MouseEvent) => {
        setActiveLayer(pk);
    };

    let isActiveLayer = pk == activeLayer;

    const handleLayerMenu = (e: React.MouseEvent) => {
        setOpenLayerMenu((prev) => { return !prev;});
    };

    const handleLayerCollapse = (e: React.MouseEvent) => {
        setIsLayerCollapsed((prev) => { return !prev;});
    };

    const handleLayerVisibility = (e: React.MouseEvent) => {
        setLayerVisibility(pk);
    };

    return (
        <div className={isActiveLayer ? 'sidebar-layer sidebar-layer--active' : 'sidebar-layer'}
            onClick={handleSetActiveLayer}>
            <div className={'sidebar-layer-infobar'}>
                <button id={'sidebar-layer-infobar__visibility-btn'} onClick={handleLayerVisibility}>
                    <FontAwesomeIcon icon={layerVisibility ? faEye : faEyeSlash}/>
                </button>
                <button id={'sidebar-layer-infobar__collapsed-btn'} onClick={handleLayerCollapse}>
                    <FontAwesomeIcon icon={isLayerCollapsed ? faAngleUp : faAngleDown}/>
                </button>
                <span id={'sidebar-layer-infobar__title'} className="font-weight-bold">{title}</span>
                <button id={'sidebar-layer-infobar__menu-btn'} onClick={handleLayerMenu}>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </button>
            </div>
            { openLayerMenu && (
                <div id={'sidebar-layer-infobar__menu'}>
                    <form onSubmit={handleUpdateLayer}>
                        <label>Layer Title:
                            <input id={`update-layer-title-${pk}`}
                                value={updatedLayerTitle}
                                onChange={handleUpdatedLayerTitle}
                                className="form-control" type="text"/>
                        </label>
                        <input type='submit'
                            className='btn btn-primary' value={'Edit Layer'}/>
                    </form>
                    <form onSubmit={handleDeleteLayer}>
                        <input type='submit'
                            className='btn btn-danger' value={'Delete Layer'}/>
                    </form>
                </div>
            ) }
            { !isLayerCollapsed && (
                <div>
                    {layerEvents.map((val, idx) => {
                        return (
                            <div key={idx}
                                className={'sidebar-layer-event' + (activeEvent && activeEvent.pk === val.pk ? ' sidebar-layer-event--active' : '')}
                                onClick={() => {setActiveEvent(val);}}>
                                <FontAwesomeIcon icon={faMapMarker}/>
                                {val.label}
                                {activeEvent && activeEvent.pk === val.pk && (
                                    <button onClick={() => {setActiveEventDetail(val);}}>
                                        More
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) }
        </div>
    );
};

