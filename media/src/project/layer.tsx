import React, { useState } from 'react';
import { LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faAngleDown, faAngleUp, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

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
}

export const Layer = (layerData: LayerProps)=> {
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>(layerData.title);
    const [openLayerMenu, setOpenLayerMenu] = useState<boolean>(false);
    const [isLayerCollapsed, setIsLayerCollapsed] = useState<boolean>(false);

    const handleUpdatedLayerTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatedLayerTitle(e.target.value);
    };
    const handleUpdateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        layerData.updateLayer(layerData.pk, updatedLayerTitle);
    };

    const handleDeleteLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        layerData.deleteLayer(layerData.pk);
    };

    const handleSetActiveLayer = (e: React.MouseEvent) => {
        layerData.setActiveLayer(layerData.pk);
    };

    let isActiveLayer = layerData.pk == layerData.activeLayer;

    const handleLayerMenu = (e: React.MouseEvent) => {
        setOpenLayerMenu((prev) => { return !prev;});
    }

    const handleLayerCollapse = (e: React.MouseEvent) => {
        setIsLayerCollapsed((prev) => { return !prev;});
    }

    const handleLayerVisibility = (e: React.MouseEvent) => {
        layerData.setLayerVisibility(layerData.pk);
    }

    return (
        <div className={isActiveLayer ? 'sidebar-layer sidebar-layer--active' : 'sidebar-layer'}
            onClick={handleSetActiveLayer}>
            <div className={'sidebar-layer-infobar'}>
                <button id={'sidebar-layer-infobar__visibility-btn'} onClick={handleLayerVisibility}>
                    <FontAwesomeIcon icon={layerData.layerVisibility ? faEye : faEyeSlash}/>
                </button>
                <button id={'sidebar-layer-infobar__collapsed-btn'} onClick={handleLayerCollapse}>
                    <FontAwesomeIcon icon={isLayerCollapsed ? faAngleUp : faAngleDown}/>
                </button>
                <span id={'sidebar-layer-infobar__title'} className="font-weight-bold">{layerData.title}</span>
                <button id={'sidebar-layer-infobar__menu-btn'} onClick={handleLayerMenu}>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </button>
            </div>
            { openLayerMenu && (
                <div id={'sidebar-layer-infobar__menu'}>
                    <form onSubmit={handleUpdateLayer}>
                        <label>Layer Title:
                            <input id={`update-layer-title-${layerData.pk}`}
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
                    {layerData.layerEvents.map((val, idx) => {
                        return (<div key={idx}>{val.label}</div>);
                    })}
                </div>
            ) }
        </div>
    );
};

