import React, { useState } from 'react';
import { Layer, LayerProps } from './layer';

export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    layers: LayerProps[];
    activeLayer: number | null;
    setActiveLayer(pk: number): any;
    addLayer(layerTitle: string): any;
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
}

export const ProjectMapSidebar = (
    {title, description, layers, activeLayer, setActiveLayer, addLayer, deleteLayer, updateLayer}: ProjectMapSidebarProps) => {

    const [newLayerTitle, setNewLayerTitle] = useState<string>('');

    const handleNewLayerTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewLayerTitle(e.target.value);
    };

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addLayer((e.currentTarget.elements[0] as HTMLInputElement).value);
        setNewLayerTitle('');
    };

    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <p>{description}</p>
            <h3>Layers</h3>
            <form onSubmit={handleCreateLayer}
                className="needs-validation" noValidate >
                <div className="form-group">
                    <label>Layer Title:
                        <input id="new-layer-title"
                            value={newLayerTitle}
                            onChange={handleNewLayerTitle}
                            className="form-control" type="text"/>
                    </label>
                </div>
                <input type='submit'
                    className='btn btn-primary' value={'Add Layer'}/>
            </form>
            {layers && layers.map(
                (layer, idx) => {return (<Layer {...layer} deleteLayer={deleteLayer} updateLayer={updateLayer} key={idx} activeLayer={activeLayer} setActiveLayer={setActiveLayer} />);})}
        </div>
    );
};

