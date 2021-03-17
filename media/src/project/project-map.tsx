import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    _MapContext as MapContext, StaticMap, NavigationControl, Popup
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL, { Controller, FlyToInterpolator }  from 'deck.gl';
import { BitmapLayer, IconLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { Position } from '@deck.gl/core/utils/positions';
import { PickInfo } from '@deck.gl/core/lib/deck';

import { ProjectMapPane } from './project-map-pane';
import { LoadingModal } from '../project-activity-components/loading-modal';

import {
    ICON_ATLAS, ICON_MAPPING, ICON_SCALE, ICON_SIZE, ICON_COLOR,
    ICON_COLOR_ACTIVE, ProjectData, ActivityData, LayerData, EventData,
    MediaObject, DeckGLClickEvent, TileSublayerProps
} from '../project-activity-components/common';

import {get, put, post, del, getBoundedViewport } from '../utils';

interface ViewportState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
    transitionDuration?: number;
    transitionInterpolator?: FlyToInterpolator;
}

export const ProjectMap: React.FC = () => {
    const [viewportState, setViewportState] = useState<ViewportState>({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        bearing: 0,
        pitch: 0
    });

    const mapContainer: HTMLElement | null =
        document.querySelector('#project-map-container');
    const TOKEN = mapContainer ? mapContainer.dataset.maptoken : '';
    const newProjectFlag = mapContainer ?
        mapContainer.dataset.newproject === 'True': false;
    const pathList = window.location.pathname.split('/');
    const projectPk = pathList[pathList.length - 2];
    const coursePk = pathList[pathList.length - 4];
    const deckglMap = useRef<DeckGL>(null);
    const mapPane = useRef<HTMLDivElement>(null);
    const [isNewProject, setIsNewProject] = useState<boolean>(newProjectFlag);
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [layerData, setLayerData] = useState<Map<number, LayerData>>(new Map());
    const [activeLayer, setActiveLayer] = useState<number | null>(null);

    // The selected event on the map
    const [ activeEvent, setActiveEvent] =
        useState<EventData | null>(null);
    // The even rendered in the detail pane
    const [ activeEventDetail, setActiveEventDetail ] =
        useState<EventData | null>(null);
    // The event to be edited in the edit pane
    const [activeEventEdit, setActiveEventEdit] =
        useState<EventData | null>(null);
    const [activity, setActivity] = useState<ActivityData | null>(null);

    const [mapboxLayers, setMapboxLayers] =
        useState<IconLayer<EventData>[]>([]);

    const [rasterLayers, setRasterLayers] = useState<TileLayer<string>[]>([]);

    const [layerVisibility, setLayerVisibility] = useState<Map<number, boolean>>(new Map());

    const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);
    const [activePosition, setActivePosition] = useState<Position | null>(null);

    const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

    const clearActivePosition = (): void => {
        setActivePosition(null);
        setMapboxLayers((prev) => {
            return prev.filter((el) => {
                return el.id !== 'active-position';
            });
        });
    };

    const setBaseMap = (baseMap: string) => {
        if (projectData) {
            setProjectData({...projectData, base_map: baseMap});
        }
    };

    const pickEventClickHandler = (info: PickInfo<EventData>): boolean => {
        // Clear the 'Add Event Form' and 'Add Event Pin'
        setShowAddEventForm(false);
        clearActivePosition();

        // Set the active event
        setActiveEvent(info.object);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    const updateMapboxLayers = (
        layers: Map<number, LayerData>, setterFunc = setMapboxLayers,
        layerVisMap = layerVisibility): void => {
        const mapLayers = [...layers.entries()].reduce(
            (acc: IconLayer<EventData>[], val: [number, LayerData]) => {
                const layer = val[1];
                if (layer && (layerVisMap.get(layer.pk) || false)) {
                    const MBLayer = new IconLayer<EventData>({
                        id: `icon-layer-${layer.pk}`,
                        data: layer.events,
                        pickable: true,
                        iconAtlas: ICON_ATLAS,
                        iconMapping: ICON_MAPPING,
                        getIcon: (): string => 'marker',
                        sizeScale: ICON_SCALE,
                        getPosition: (d) => d.location.lng_lat,
                        onClick: pickEventClickHandler,
                        getSize: ICON_SIZE,
                        getColor: ICON_COLOR,
                    });
                    return [...acc, MBLayer];
                } else {
                    return acc;
                }
            },
            []);

        setterFunc(mapLayers);
    };

    const updateProject = (
        title: string, description: string, baseMap: string): void => {
        if (projectData) {
            const data = projectData;
            data.title = title;
            data.description = description;
            data.base_map = baseMap;
            void put<ProjectData>(`/api/project/${projectPk}/`, data)
                .then((d) => {
                    setProjectData(d);
                });
        }
    };

    const deleteProject = (): void => {
        const csrf = (document.getElementById(
            'csrf-token') as HTMLElement).getAttribute('content') || '';
        const form = document.createElement('form');
        form.style.visibility = 'hidden';
        form.method = 'POST';
        form.action = `/course/${coursePk}/project/${projectPk}/delete/`;
        if (isNewProject) {
            form.action += '?hide_course_delete_notice=true';
        }

        const csrfField = document.createElement('input');
        csrfField.name = 'csrfmiddlewaretoken';
        csrfField.value = csrf;
        form.appendChild(csrfField);
        document.body.appendChild(form);

        form.submit();
    };

    const addLayer = (): void => {
        const data = {
            title: 'Untitled Layer',
            content_object: `/api/project/${projectPk}/`
        };
        void post<LayerData>('/api/layer/', data)
            .then((data: LayerData) => {
                const layers = new Map(layerData);
                layers.set(data.pk, data);
                setLayerData(layers);

                const layerVis = new Map(layerVisibility);
                layerVis.set(data.pk, true);
                setLayerVisibility(layerVis);

                setActiveLayer(data.pk);
            });
    };

    const deleteLayer = (pk: number): void => {
        void del(`/api/layer/${pk}/`)
            .then(() => {
                const updatedLayerData = new Map(layerData);
                updatedLayerData.delete(pk);
                setLayerData(updatedLayerData);

                const layerVis = new Map(layerVisibility);
                layerVis.delete(pk);
                setLayerVisibility(layerVis);

                if (updatedLayerData.size === 0) {
                    // addLayer has a stale closure, so the fetch
                    // is called here instead
                    const newLayer = {
                        title: 'Untitled Layer',
                        content_object: `/api/project/${projectPk}/`
                    };
                    void post<LayerData>('/api/layer/', newLayer)
                        .then((data) => {
                            setLayerData(new Map([[data.pk, data]]));
                            setActiveLayer(data.pk);
                        });
                } else {
                    // Set the first layer to be the active layer
                    setActiveLayer([...updatedLayerData.values()][0].pk);
                }
            });
    };

    const updateLayer = (pk: number, title: string): void => {
        void put<LayerData>(
            `/api/layer/${pk}/`, {title: title, content_object: `/api/project/${projectPk}/`})
            .then((data) => {
                const layers = new Map(layerData);
                layers.set(data.pk, data);
                setLayerData(layers);
            });
    };

    const toggleLayerVisibility = (pk: number): void => {
        const layerVis = new Map(layerVisibility);
        layerVis.set(pk, !layerVisibility.get(pk));
        setLayerVisibility(layerVis);
        updateMapboxLayers(layerData, setMapboxLayers, layerVis);
    };

    const goToNewEvent = useCallback(() => {
        if (activePosition) {
            setViewportState({
                latitude: activePosition[0],
                longitude: activePosition[1],
                zoom: 15,
                bearing: 0,
                pitch: 0,
                transitionDuration: 1000,
                transitionInterpolator: new FlyToInterpolator()
            });
        }
    }, [activePosition]);

    const addEvent = (
        label: string, description: string, lat: number, lng: number,
        mediaObj: MediaObject | null): void => {
        if (!activeLayer) {
            throw new Error('Add Event failed: no active layer is defined');
        }
        const data = {
            label: label,
            layer: activeLayer,
            description: description,
            datetime: null,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            },
            media: mediaObj ? [mediaObj] : null
        };
        void post<EventData>('/api/event/', data)
            .then((data) => {
                if (activeLayer) {
                    const updatedLayers = new Map(layerData);
                    const layer = layerData.get(activeLayer);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events].concat(data)
                        };
                        updatedLayers.set(activeLayer, updatedLayer);

                        setLayerData(updatedLayers);
                        updateMapboxLayers(updatedLayers);
                        setActiveEvent(data);
                        goToNewEvent();
                    }
                }
            });
    };

    const updateEvent = (
        label: string, description: string, lat: number, lng: number,
        pk: number, layerPk: number, mediaObj: MediaObject | null): void => {
        // TODO: implement datetime update
        const obj = {
            label: label,
            description: description,
            layer: layerPk,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            },
            media: mediaObj ? [mediaObj] : null
        };
        void put<EventData>(`/api/event/${pk}/`, obj)
            .then((data) => {
                const updatedLayers = new Map(layerData);
                const layer = layerData.get(layerPk);

                if (layer) {
                    const updatedLayer = {
                        ...layer,
                        events: [...layer.events].map((event) => {
                            return event.pk == data.pk ? data : event;
                        })
                    };
                    updatedLayers.set(layerPk, updatedLayer);

                    setLayerData(updatedLayers);
                    updateMapboxLayers(updatedLayers);
                    setActiveEventDetail(data);
                    setActiveEvent(data);
                }
            });
    };

    const deleteEvent = (pk: number, layerPk: number): void => {
        void del(`/api/event/${pk}/`)
            .then(() => {
                const updatedLayers = new Map(layerData);
                const layer = layerData.get(layerPk);

                if (layer) {
                    const updatedLayer = {
                        ...layer,
                        events: [...layer.events].filter((event) => {
                            return event.pk != pk;
                        })
                    };
                    updatedLayers.set(layerPk, updatedLayer);

                    setLayerData(updatedLayers);
                    setActiveEvent(null);
                    updateMapboxLayers(updatedLayers);
                }
            });
    };

    const createActivity = (instructions: string): void => {
        if (activity) {
            // TODO: write some kind of error warning
            return;
        }
        const data = {
            project: projectPk,
            instructions: instructions
        };
        void post<ActivityData>('/api/activity/', data)
            .then((data) => {
                setActivity(data);
                window.location.reload();
            });
    };

    const updateActivity = (instructions: string, pk: number): void => {
        const data = {
            project: projectPk,
            instructions: instructions
        };
        void put<ActivityData>(`/api/activity/${pk}/`, data)
            .then((data) => {
                setActivity(data);
            });
    };

    const deleteActivity = (id: number): void => {
        void del(`/api/activity/${id}/`);
    };

    function handleDeckGlClick<D>(info: PickInfo<D>, event: DeckGLClickEvent): void {
        // Cast to provide type def for coordinate
        const infoPrime = info as PickInfo<D> & {coordinate: [number, number]};

        // Create on single click, make sure that new event
        // is not created when user intends to pick an existing event
        if (event.tapCount === 1) {
            // Clear the active event
            setActiveEvent(null);
            setActiveEventDetail(null);
            setActiveEventEdit(null);
            setShowAddEventForm(true);
            setActivePosition([infoPrime.coordinate[1], infoPrime.coordinate[0]]);
            let updatedLayers = mapboxLayers.filter((el) => {
                return el.id !== 'active-position';
            });
            // The click data needs to be packed this way so that the type
            // of mapboxLayers remains homogenous
            const mockData = {} as EventData;
            mockData.lngLat = [infoPrime.coordinate[0], infoPrime.coordinate[1]];
            updatedLayers = updatedLayers.concat(new IconLayer<EventData>({
                id: 'active-position',
                data: [mockData],
                pickable: true,
                iconAtlas: ICON_ATLAS,
                iconMapping: ICON_MAPPING,
                getIcon: () => 'marker',
                sizeScale: ICON_SCALE,
                getPosition: (d) => d.lngLat,
                getSize: ICON_SIZE,
                getColor: ICON_COLOR_ACTIVE,
            }));
            setMapboxLayers(updatedLayers);
        }
    }

    useEffect(() => {
        const getData = async(): Promise<void> => {
            // Fetch the Project data
            const projData = await get<ProjectData>(`/api/project/${projectPk}/`);
            setProjectData(projData);

            const layerVis = new Map<number, boolean>();

            // Fetch the layers
            const layers: LayerData[] = [];
            for (const layerUrl of projData.layers) {
                layers.push(await get<LayerData>(layerUrl));
            }

            // Create an empty layer if none exist, otherwise
            // unpack the event data
            if (layers.length === 0) {
                addLayer();
            } else {
                const layerMap = layers.reduce((acc, val) => {
                    // Set the layer visibility while we're here
                    layerVis.set(val.pk, true);

                    acc.set(val.pk, val);
                    return acc;
                }, new Map<number, LayerData>());
                setLayerData(layerMap);

                updateMapboxLayers(layerMap, setMapboxLayers, layerVis);
                setActiveLayer(layers[0].pk);
                setLayerVisibility(layerVis);
                const viewport = getBoundedViewport([...layerMap.values()], deckglMap, mapPane);
                setViewportState({
                    latitude: viewport.latitude,
                    longitude: viewport.longitude,
                    zoom: viewport.zoom,
                    bearing: 0,
                    pitch: 0
                });
            }

            // Instantiate raster layers
            const rLayers: TileLayer<string>[] = [];
            for (const layer of projData.raster_layers) {
                rLayers.push(new TileLayer({
                    data: layer.url,
                    renderSubLayers: (obj: TileSublayerProps) => {
                        const {
                            bbox: {west, south, east, north}
                        } = obj.tile;
                        return new BitmapLayer<string>({
                            id: obj.id,
                            image: obj.data,
                            bounds: [west, south, east, north],
                            desaturate: 0,
                            transparentColor: [0, 0, 0, 0],
                            tintColor: [255, 255, 255]
                        });
                    }
                }));
            }
            setRasterLayers(rLayers);

            // Get Activity info
            if (projData.activity) {
                setActivity(await get<ActivityData>(`/api/activity/${projData.activity}`));
            }
        };

        getData().finally(() => {setIsDataLoading(false);});
    }, []);

    return (
        <>
            {(isMapLoading || isDataLoading) && <LoadingModal />}
            {projectData && (
                <DeckGL
                    layers={[
                        ...rasterLayers as any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, max-len
                        ...mapboxLayers
                    ]}
                    initialViewState={viewportState}
                    width={'100%'}
                    height={'100%'}
                    controller={{doubleClickZoom: false} as {doubleClickZoom: boolean} & Controller} // eslint-disable-line max-len
                    onClick={handleDeckGlClick}
                    pickingRadius={15}
                    ref={deckglMap}
                    ContextProvider={MapContext.Provider}>
                    <StaticMap
                        reuseMaps
                        width={'100%'}
                        height={'100%'}
                        preventStyleDiffing={true}
                        mapStyle={projectData.base_map}
                        mapboxApiAccessToken={TOKEN}
                        onLoad={(): void => {setIsMapLoading(false); }}/>
                    {activeEvent && (
                        <Popup
                            latitude={activeEvent.location.lng_lat[1]}
                            longitude={activeEvent.location.lng_lat[0]}
                            offsetTop={-30}
                            closeOnClick={false}
                            onClose={(): void => {setActiveEvent(null);}}>
                            {activeEvent.media && activeEvent.media[0] && (
                                <div className={'mapboxgl-popup-image'}
                                    style={{backgroundImage:
                                        'url(' +  activeEvent.media[0].url + ')'}}>
                                </div>
                            )}
                            <h2>{activeEvent.label}</h2>
                            {!activeEventDetail && (
                                <button
                                    type="button"
                                    onClick={
                                        (): void => {
                                            setActiveEventDetail(activeEvent);}}
                                    className={'lt-button btn-sm mapboxgl-popup-more'}>
                                    <span className='lt-button__text'>More</span>
                                </button>
                            )}
                        </Popup>
                    )}
                    <div id='map-navigation-control'>
                        <NavigationControl />
                    </div>
                </DeckGL>
            )}
            {projectData && (
                <ProjectMapPane
                    ref={mapPane}
                    title={projectData.title || 'Untitled'}
                    description={projectData.description || ''}
                    baseMap={projectData.base_map || ''}
                    setBaseMap={setBaseMap}
                    isNewProject={isNewProject}
                    setIsNewProject={setIsNewProject}
                    updateProject={updateProject}
                    deleteProject={deleteProject}
                    layers={layerData}
                    activity={activity}
                    createActivity={createActivity}
                    updateActivity={updateActivity}
                    deleteActivity={deleteActivity}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    addLayer={addLayer}
                    deleteLayer={deleteLayer}
                    updateLayer={updateLayer}
                    layerVisibility={layerVisibility}
                    toggleLayerVisibility={toggleLayerVisibility}
                    showAddEventForm={showAddEventForm}
                    setShowAddEventForm={setShowAddEventForm}
                    activePosition={activePosition}
                    clearActivePosition={clearActivePosition}
                    activeEvent={activeEvent}
                    setActiveEvent={setActiveEvent}
                    activeEventDetail={activeEventDetail}
                    setActiveEventDetail={setActiveEventDetail}
                    activeEventEdit={activeEventEdit}
                    setActiveEventEdit={setActiveEventEdit}
                    addEvent={addEvent}
                    deleteEvent={deleteEvent}
                    updateEvent={updateEvent}/>
            )}
        </>
    );
};
