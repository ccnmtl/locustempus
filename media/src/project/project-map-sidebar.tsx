import React, { useState } from 'react';
import { Layer, LayerProps } from './layer';
import { LayerEventData, LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';


export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    activeLayer: number | null;
    setActiveLayer(pk: number): any;
    addLayer(): any;
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
    setLayerVisibility(pk: number): any;
}

export const ProjectMapSidebar = (
    {title, description, layers, events, activeLayer, setActiveLayer,
        addLayer, deleteLayer, updateLayer, setLayerVisibility}: ProjectMapSidebarProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);

    const handleSetActiveTab = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addLayer();
    };

    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <div>
                <ul className="nav nav-tabs">
                    {['Overview', 'Base'].map((el, idx) => {
                        return (
                            <li className="nav-item" key={idx}>
                                <a className={activeTab == idx ? 'nav-link active' : 'nav-link'}
                                    href='#'
                                    data-active-tab={idx}
                                    onClick={handleSetActiveTab}>{el}</a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {activeTab === 0 && (
                <>
                    <p>{description}</p>
                </>
            )}
            {activeTab === 1 && (
                <>
                    <form onSubmit={handleCreateLayer}>
                        <button type='submit'>
                            <FontAwesomeIcon icon={faLayerGroup}/>Add Layer
                        </button>
                    </form>
                    {layers && layers.map(
                        (layer, idx) => {
                            let layerEvents: LayerEventDatum[] = [];
                            let data = events.get(layer.pk);
                            if (data && data.events) {
                                layerEvents = data.events;
                            }

                            let layerVisibility = true;
                            if (data && data.visibility) {
                                layerVisibility = data.visibility;
                            }

                            return (
                                <Layer {...layer}
                                    deleteLayer={deleteLayer}
                                    updateLayer={updateLayer}
                                    key={idx}
                                    activeLayer={activeLayer}
                                    setActiveLayer={setActiveLayer}
                                    layerEvents={layerEvents}
                                    layerVisibility={layerVisibility}
                                    setLayerVisibility={setLayerVisibility}/>
                            );
                        })}
                </>
            )}
        </div>
    );
};

