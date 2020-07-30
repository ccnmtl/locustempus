import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactMapGL, { _MapContext as MapContext, StaticMap,NavigationControl} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL from '@deck.gl/react';

const authedFetch = (url: string, method: string, data: any) => {
    let csrf = (document.getElementById('csrf-token') as any).getAttribute('content');
    return fetch(url,{
        method: method,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf
        },
        body: data,
        credentials: 'same-origin'
    });
};

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

    const addLayer = (title: string) => {
        authedFetch('/api/layer/', 'POST', JSON.stringify(
            {title: title, content_object: `/api/project/${projectPk}/`}))
            .then((response) => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw 'Layer creation failed.';
                }
            })
            .then((data) => {
                setLayerData([...layerData, data]);
            });
    };

    const deleteLayer = (pk: number) => {
        authedFetch(`/api/layer/${pk}/`, 'DELETE', JSON.stringify({pk: pk}))
            .then((response) => {
                if (response.status !== 204) {
                    throw 'Layer creation failed.';
                } else {
                    setLayerData(layerData.filter((el) => {
                        return el.pk !== pk;
                    }));
                }
            });
    };

    const updateLayer = (pk: number, title: string) => {
        authedFetch(`/api/layer/${pk}/`, 'PUT', JSON.stringify(
            {title: title, content_object: `/api/project/${projectPk}/`}))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw 'Layer creation failed.';
                }
            })
            .then((data) => {
                let layer = layerData.filter((el) => {
                    return el.pk !== pk;
                });
                setLayerData([...layer, data]);
            });
    };


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
                        layers={[]}
                        addLayer={addLayer}
                        deleteLayer={deleteLayer}
                        updateLayer={updateLayer}/>
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
                        layers={layerData}
                        addLayer={addLayer}
                        deleteLayer={deleteLayer}
                        updateLayer={updateLayer}/>
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
    layers: LayerProps[]
    addLayer(layerTitle: string): any;
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
}

export const ProjectMapSidebar = (
    {title, description, layers, addLayer, deleteLayer, updateLayer}: ProjectMapSidebarProps) => {

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
                (layer, idx) => {return (<Layer {...layer} deleteLayer={deleteLayer} updateLayer={updateLayer} key={idx} />);})}
        </div>
    );
};

interface LayerProps {
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
