import React, { useState } from 'react';
import { Layer, LayerProps } from './layer';
import { LayerEventDatum } from './project-map';

export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    layers: LayerProps[];
    events: Map<number, LayerEventDatum[]>;
    activeLayer: number | null;
    setActiveLayer(pk: number): any;
    addLayer(): any;
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
}

export const ProjectMapSidebar = (
    {title, description, layers, events, activeLayer, setActiveLayer,
        addLayer, deleteLayer, updateLayer}: ProjectMapSidebarProps) => {

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addLayer();
    };

    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <p>{description}</p>
            <h3>Layers</h3>
            <form onSubmit={handleCreateLayer}>
                <input type='submit'
                    className='btn btn-primary' value={'Add Layer'}/>
            </form>
            {layers && layers.map(
                (layer, idx) => {return (
                    <Layer {...layer}
                        deleteLayer={deleteLayer}
                        updateLayer={updateLayer}
                        key={idx}
                        activeLayer={activeLayer}
                        setActiveLayer={setActiveLayer}
                        layerEvents={events.get(layer.pk) || []}/>
                );})}
        </div>
    );
};

