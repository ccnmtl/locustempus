import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactMapGL, { _MapContext as MapContext, StaticMap,NavigationControl} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL from '@deck.gl/react';

interface ProjectInfo {
    title: string;
    description: string;
    base_map: string;
    layers: LayerProps[];
}

export const ProjectMap = () => {
    const viewportState = {
        viewport: {
            latitude: 40.8075395,
            longitude: -73.9647614,
            zoom: 10,
            bearing: 0,
            pitch: 40.5
        }
    };

    const mapContainer: any = document.querySelector('#project-map-container');
    const BASEMAP_STYLE = mapContainer.dataset.basemap;
    const TOKEN = mapContainer.dataset.maptoken;
    const pathList = window.location.pathname.split('/');
    const projectPk = pathList[pathList.length - 2];
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [layerData, setLayerData] = useState<LayerProps[]>([]);
    const [
        staticMapViewport,
        setStaticMapViewport
    ] = React.useState(viewportState);

    let mapboxLayers: any[] = [];


    useEffect(() => {
        let getData = async() => {
            let projectResponse = await fetch(`/api/project/${projectPk}/`);
            if (!projectResponse.ok) {
                throw new Error('Project data not loaded');
            }
            let projectData = await projectResponse.json();
            setProjectInfo(projectData);

            let layersRsps = await Promise.all(
                projectData.layers.map((layer: string) => {
                    return fetch(layer);
                })
            );
            let layers = await Promise.all(
                layersRsps.map((response: any) => { return response.json(); })
            );
            setLayerData(layers);
        };

        getData();
    }, []);


    if (mapboxLayers.length > 0) {
        return (
            <DeckGL
                layers={mapboxLayers}
                initialViewState={viewportState.viewport}
                width={'100%'}
                height={'100%'}
                controller={true}
                ContextProvider={MapContext.Provider}>
                <StaticMap
                    reuseMaps
                    width={'100%'}
                    height={'100%'}
                    preventStyleDiffing={true}
                    mapStyle={'mapbox://styles/mapbox/' + BASEMAP_STYLE}
                    mapboxApiAccessToken={TOKEN} />
                {projectInfo && (
                    <ProjectMapSidebar
                        title={projectInfo.title}
                        description={projectInfo.description}
                        layers={[]}/>
                )}
                <div id='map-navigation-control'>
                    <NavigationControl />
                </div>
            </DeckGL>
        );
    } else {
        return (
            <ReactMapGL
                {...staticMapViewport.viewport}
                onViewportChange={viewport => setStaticMapViewport({viewport})}
                width={'100%'}
                height={'100%'}
                mapStyle={'mapbox://styles/mapbox/' + BASEMAP_STYLE}
                mapboxApiAccessToken={TOKEN}>
                {projectInfo && (
                    <ProjectMapSidebar
                        title={projectInfo.title}
                        description={projectInfo.description}
                        layers={layerData}/>
                )}
                <div id='map-navigation-control'>
                    <NavigationControl />
                </div>
            </ReactMapGL>
        );
    }
};

interface ProjectMapSidebarProps {
    title: string;
    description: string;
    layers: LayerProps[];
}

export const ProjectMapSidebar = (
    {title, description, layers}: ProjectMapSidebarProps) => {
    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <p>{description}</p>
            <h3>Layers</h3>
            {layers && layers.map(
                (layer, idx) => {return (<Layer {...layer} key={idx} />);})}
        </div>
    );
};

interface LayerProps {
    title: string;
    content_object: string; // The API URL to the parent project/response
}

export const Layer = (layerData: LayerProps)=> {
    return (
        <div className="project-map-sidebar-layer">
            <span className="font-weight-bold">{layerData.title}</span>
            <p>{layerData.content_object}</p>
        </div>
    );
};
