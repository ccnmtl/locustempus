import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactMapGL, { _MapContext as MapContext, StaticMap,NavigationControl} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL from '@deck.gl/react';

interface ProjectMapSidebarProps {
    title: string;
    description: string;
}

export const ProjectMapSidebar = (
    {title, description}: ProjectMapSidebarProps) => {
    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    )

}

interface ProjectInfo {
    title: string;
    description: string;
    base_map: string;
}

export const ProjectMap = () => {
    const mapContainer: any = document.querySelector('#project-map-container');
    const BASEMAP_STYLE = mapContainer.dataset.basemap;
    const TOKEN = mapContainer.dataset.maptoken;
    const pathList = window.location.pathname.split('/');
    const projectPk = pathList[pathList.length - 2];
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>();


    let layers: any[] = [];

    const viewportState = {
        viewport: {
            latitude: 40.8075395,
            longitude: -73.9647614,
            zoom: 10,
            bearing: 0,
            pitch: 40.5
        }
    };

    useEffect(() => {
        fetch(`/api/project/${projectPk}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Project info not loaded');
                }
                return response.json();
            })
            .then((data) => {
                setProjectInfo(data);
            });
    }, []);

    const [
        staticMapViewport,
        setStaticMapViewport
    ] = React.useState(viewportState);

    if (layers.length > 0) {
        return (
            <DeckGL
                layers={layers}
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
                        description={projectInfo.description} />
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
                        description={projectInfo.description} />
                )}
                <div id='map-navigation-control'>
                    <NavigationControl />
                </div>
            </ReactMapGL>
        );
    }
};
