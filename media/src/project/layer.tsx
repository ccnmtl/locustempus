import React, { useState } from 'react';
import { LayerEventDatum } from './project-map';

export interface LayerProps {
    title: string;
    pk: number;
    activeLayer: number | null;
    layerEvents: LayerEventDatum[];
    setActiveLayer(pk: number): any;
    content_object: string; // The API URL to the parent project/response
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
}

export const Layer = (layerData: LayerProps)=> {
    const [updatedLayerTitle, setUpdatedLayerTitle] = useState<string>(layerData.title);

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

    return (
        <div className={isActiveLayer ? 'project-map-sidebar-layer project-map-sidebar-layer--active' : 'project-map-sidebar-layer'}
            onClick={handleSetActiveLayer}>
            <span className="font-weight-bold">{layerData.title}</span>
            <p>{layerData.content_object}</p>
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
            <div>
                {layerData.layerEvents.map((val, idx) => {
                    return (<div key={idx}>{val.label}</div>);
                })}
            </div>
        </div>
    );
};

