import React from 'react';
import ReactDOM from 'react-dom';
import ReactMapGL, { _MapContext as MapContext, StaticMap,NavigationControl} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL from '@deck.gl/react';


export const ProjectMap = () => {
    const mapContainer: any = document.querySelector('#project-map-container');
    const BASEMAP_STYLE = mapContainer.dataset.basemap;
    const TOKEN = mapContainer.dataset.maptoken;
    const projectTitle = 'A stub for project titles';
    const projectDescription = 'A very fine project description indeed.';


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

    const [staticMapViewport, setStaticMapViewport] = React.useState(viewportState);

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
                <div id='project-map-sidebar'>
                    <h2>{projectTitle}</h2>
                    <p>{projectDescription}</p>
                </div>
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
                <div id='project-map-sidebar'>
                    <h2>{projectTitle}</h2>
                    <p>{projectDescription}</p>
                </div>
                <div id='map-navigation-control'>
                    <NavigationControl />
                </div>
            </ReactMapGL>
        );
    }
};
