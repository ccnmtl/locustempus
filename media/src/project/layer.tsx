import React, { useState } from 'react';

export interface LayerProps {
    title: string;
    pk: number;
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
    return (
        <div className="project-map-sidebar-layer">
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
        </div>
    );
};

