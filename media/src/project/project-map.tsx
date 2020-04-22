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
}

export const ProjectMap = () => {
    const mapContainer: any = document.querySelector('#project-map-container');
    const BASEMAP_STYLE = mapContainer.dataset.basemap;
    const TOKEN = mapContainer.dataset.maptoken;
    const projectPk = window.location.pathname.split('/').pop();
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
        fetch('/api/projects/' + projectPk)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Project info not loaded');
                }
                return response.json();
            })
            .then((data) => {
                setProjectInfo(data[0]);
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
                    <div id='project-map-sidebar'>
                        <h2>{projectInfo.title}</h2>
                        <p>{projectInfo.description}</p>
                    </div>
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
                    <div id='project-map-sidebar'>
                        <h2>{projectInfo.title}</h2>
                        <p>{projectInfo.description}</p>
                    </div>
                )}
                <div id='map-navigation-control'>
                    <NavigationControl />
                </div>
            </ReactMapGL>
        );
    }
};
