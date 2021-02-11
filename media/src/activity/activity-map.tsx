import React, { useState, useEffect, useCallback } from 'react';
import {
    _MapContext as MapContext, StaticMap, NavigationControl, Popup
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Deck.gl
import DeckGL, { Controller, FlyToInterpolator }  from 'deck.gl';
import { IconLayer } from '@deck.gl/layers';
import { Position } from '@deck.gl/core/utils/positions';
import { PickInfo } from '@deck.gl/core/lib/deck';

import { ActivityMapPane } from './activity-map-pane';
import { LoadingModal } from '../project-activity-components/loading-modal';

import {get, put, post, del } from '../utils';

const CURRENT_USER = LocusTempus.currentUser.id;

import {
    ICON_ATLAS, ICON_MAPPING, ICON_SCALE, ICON_SIZE, ICON_COLOR,
    ICON_COLOR_ACTIVE, ProjectData, DeckGLClickEvent
} from '../project-activity-components/common';

export interface ActivityData {
    title: string;
    pk: number;
    description: string;
    instructions: string;
}

export enum ResponseStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    REVIEWED = 'REVIEWED'
}

interface FeedbackData {
    pk: number;
    body: string;
}

export interface ResponseData {
    pk: number;
    activity: number;
    layers: string[];
    owners: string[];
    submitted_at: Date;
    reflection: string;
    status: ResponseStatus;
    feedback: FeedbackData | null;
}

interface ViewportState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
    transitionDuration?: number;
    transitionInterpolator?: FlyToInterpolator;
}

export const ActivityMap: React.FC = () => {
    const [viewportState, setViewportState] = useState<ViewportState>({
        latitude: 40.8075395,
        longitude: -73.9647614,
        zoom: 12,
        bearing: 0,
        pitch: 40.5
    });

    const mapContainer: HTMLElement | null =
        document.querySelector('#activity-map-container');
    const TOKEN = mapContainer ? mapContainer.dataset.maptoken : '';
    const projectPk = mapContainer && mapContainer.dataset.projectpk;
    const activityPk = mapContainer && mapContainer.dataset.activitypk;
    let isFaculty = false;
    if (mapContainer && mapContainer.dataset.isfaculty === 'True') {
        isFaculty = true;
    }

    const [projectTitle, setProjectTitle] = useState<string | null>(null);
    const [projectDescription, setProjectDescription] =
        useState<string | null>(null);
    const [projectBaseMap, setProjectBaseMap] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<ResponseData[]>([]);

    /* Layers */
    // projectLayerData holds Layers belonging to the base project
    const [projectLayerData, setProjectLayerData] = useState<Map<number, LayerData>>(new Map());
    const [projectMapboxLayers, setProjectMapboxLayers] =
        useState<IconLayer<EventData>[]>([]);

    // layerData holds Layers created by the student when responding
    // TODO: rename this to better reflect what it does
    const [layerData, setLayerData] = useState<Map<number, LayerData>>(new Map());
    const [mapboxLayers, setMapboxLayers] =
        useState<IconLayer<EventData>[]>([]);

    // TODO: ditto here, rename to disambiguate this from the above layers
    // responseLayers are used in the faculty view, it holds the layers belonging to
    // student responses
    const [responseLayers, setResponseLayers] =
        useState<Map<number, LayerData[]>>(new Map());
    const [responseMapboxLayers, setResponseMapboxLayers] =
        useState<IconLayer<EventData>[]>([]);

    // Map to identify which layers should be visible
    const [layerVisibility, setLayerVisibility] =
        useState<Map<number, boolean>>(new Map());
    const [activeLayer, setActiveLayer] = useState<number | null>(null);

    // Active event
    const [ activeEvent, setActiveEvent] =
        useState<EventData | null>(null);
    const [ activeEventDetail, setActiveEventDetail ] =
        useState<EventData | null>(null);
    const [activeEventEdit, setActiveEventEdit] =
        useState<EventData | null>(null);

    const [activity, setActivity] = useState<ActivityData | null>(null);

    const [layerTitleCount, setLayerTitleCount] = useState<number>(1);

    const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);
    const [activePosition, setActivePosition] = useState<Position | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const clearActivePosition = (): void => {
        setActivePosition(null);
        setProjectMapboxLayers((prev) => {
            return prev.filter((el) => {
                return el.id !== 'active-position';
            });
        });
    };

    const pickEventClickHandler = (
        info: PickInfo<EventData>): boolean => {
        // Clear the 'Add Event Form' and 'Add Event Pin'
        setShowAddEventForm(false);
        clearActivePosition();

        // Set the active event
        setActiveEvent(info.object);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    // TODO: move this to a common func
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
                        getPosition: (d): Position => d.location.lng_lat,
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

    const toggleResponseVisibility = (responsePk = -1): void => {
        // if responsePk == -1, show all responses
        const layerVis = new Map(layerVisibility);
        if (responsePk == -1) {
            layerVis.forEach((val, key, mmap) => {
                mmap.set(key, true);
            });
        } else {
            if (layerVis.has(responsePk)) {
                layerVis.set(responsePk, !layerVis.get(responsePk));
            }
        }

        // TODO: use the common func for this
        const responseMapLayers = [...responseLayers.entries()].reduce(
            (acc: IconLayer<EventData>[], entry) => {
                const responsePk = entry[0];
                const layers = entry[1];
                const mapLayers = layers.reduce(
                    (layerAcc: IconLayer<EventData>[], layerVal) => {
                        if (layerVis.get(responsePk)) {
                            const layer = new IconLayer<EventData>({
                                id: `response-layer-${layerVal.pk}`,
                                data: layerVal.events,
                                pickable: true,
                                iconAtlas: ICON_ATLAS,
                                iconMapping: ICON_MAPPING,
                                getIcon: (): string => 'marker',
                                sizeScale: ICON_SCALE,
                                getPosition: (d): Position => d.location.lng_lat,
                                onClick: pickEventClickHandler,
                                getSize: ICON_SIZE,
                                getColor: ICON_COLOR,
                            });
                            layerAcc.push(layer);
                        }
                        return layerAcc;
                    }, []);
                return acc.concat(mapLayers);
            }, []);

        setResponseMapboxLayers(responseMapLayers);
        setLayerVisibility(layerVis);
    };

    const addLayer = (respPk: number | null = null): void => {
        if (isFaculty && projectPk) {
            const newLayer = {
                title: `Layer ${layerTitleCount}`,
                content_object: `/api/project/${projectPk}/`
            };
            void post<LayerData>('/api/layer/', newLayer)
                .then((data) => {
                    const layers = new Map(projectLayerData);
                    layers.set(data.pk, data);
                    setProjectLayerData(layers);

                    setActiveLayer(data.pk);
                    setLayerTitleCount((prev) => {return prev + 1;});
                });
        } else if (!isFaculty && (responseData.length == 1 || respPk)) {
            const responsePk = respPk || responseData[0].pk;
            const newLayer = {
                title: `Layer ${layerTitleCount}`,
                content_object: `/api/response/${responsePk}/`
            };
            void post<LayerData>('/api/layer/', newLayer)
                .then((data) => {
                    const layers = new Map(layerData);
                    layers.set(data.pk, data);
                    setLayerData(layers);

                    setActiveLayer(data.pk);
                    setLayerTitleCount((prev) => {return prev + 1;});
                });
        } else {
            throw new Error(
                'Layer creation failed because no Locus Tempus ' +
                'project or response object has been set.'
            );
        }
    };

    const deleteLayer = (pk: number): void => {
        void del(`/api/layer/${pk}/`)
            .then(() => {
                const updatedLayerData = new Map(layerData);
                updatedLayerData.delete(pk);
                setLayerData(updatedLayerData);

                if (updatedLayerData.size === 0) {
                    // addLayer has a stale closure, so the fetch
                    // is called here instead
                    // TODO: refactor addLayer so optional params can be passed in
                    // to handle stale closure
                    if (isFaculty && projectPk) {
                        const newLayer = {
                            title: `Layer ${layerTitleCount}`,
                            content_object: `/api/project/${projectPk}/`
                        };
                        void post<LayerData>('/api/layer/', newLayer)
                            .then((data) => {
                                setProjectLayerData(new Map([[data.pk, data]]));
                                setActiveLayer(data.pk);
                                setLayerTitleCount(
                                    (prev) => {return prev + 1;});
                            });
                    } else if (!isFaculty && responseData.length == 1) {
                        const responsePk = responseData[0].pk;
                        const newLayer = {
                            title: `Layer ${layerTitleCount}`,
                            content_object: `/api/response/${responsePk}/`
                        };
                        void post<LayerData>('/api/layer/', newLayer)
                            .then((data) => {
                                setLayerData(new Map([[data.pk, data]]));
                                setActiveLayer(data.pk);
                                setLayerTitleCount(
                                    (prev) => {return prev + 1;});
                            });
                    } else {
                        throw new Error(
                            'Layer creation failed because no Locus Tempus Response ' +
                            'object has been set.');
                    }
                }
            });
    };

    const updateLayer = (pk: number, title: string): void => {
        if (isFaculty && projectPk) {
            const obj = {
                title: title,
                content_object: `/api/project/${projectPk}/`
            };
            void put<LayerData>(`/api/layer/${pk}/`, obj)
                .then((data) => {
                    const layers = new Map(projectLayerData);
                    layers.set(data.pk, data);
                    setProjectLayerData(layers);
                });
        } else if (!isFaculty && responseData.length == 1) {
            const obj = {
                title: title,
                content_object: `/api/response/${responseData[0].pk}/`
            };
            void put<LayerData>(`/api/layer/${pk}/`, obj)
                .then((data) => {
                    const layers = new Map(layerData);
                    layers.set(data.pk, data);
                    setLayerData(layers);
                });
        } else {
            throw new Error('Layer update failed because no Locus Tempus project or ' +
                'response object has been set');
        }
    };

    const isProjectLayer = (pk: number): boolean => {
        return projectLayerData.has(pk);
    };

    const toggleLayerVisibility = (pk: number): void => {
        // Find which map holds the passed in layer pk
        const layerVis = new Map(layerVisibility);
        layerVis.set(pk, !layerVisibility.get(pk));
        setLayerVisibility(layerVis);

        if (layerData.has(pk)) {
            updateMapboxLayers(layerData, setMapboxLayers, layerVis);
        } else if (projectLayerData.has(pk)) {
            updateMapboxLayers(projectLayerData, setProjectMapboxLayers, layerVis);
        } else {
            throw new Error('The layer can not be found.');
        }
    };

    const goToNewEvent = useCallback(() => {
        if (activePosition) {
            setViewportState({
                latitude: activePosition[0],
                longitude: activePosition[1],
                zoom: 15,
                bearing: 0,
                pitch: 40.5,
                transitionDuration: 1000,
                transitionInterpolator: new FlyToInterpolator()
            });
        }
    }, [activePosition]);

    const addEvent = (
        label: string, description: string, lat: number,
        lng: number, mediaObj: MediaObject | null): void => {
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
                    const updatedLayers = new Map(isFaculty ? projectLayerData : layerData);
                    const layer = layerData.get(activeLayer);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events, data]
                        };
                        updatedLayers.set(activeLayer, updatedLayer);

                        const setterFunc = isFaculty ? setProjectMapboxLayers : setMapboxLayers;
                        updateMapboxLayers(updatedLayers, setterFunc, layerVisibility);
                        setActiveEventDetail(data);
                        setActiveEvent(data);
                        goToNewEvent();
                    }
                }
            });
    };

    const updateEvent = (
        label: string, description: string, lat: number, lng: number,
        pk: number, layerPk: number, mediaObj: MediaObject | null): void => {
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
            .then((data: EventData) => {
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

                    setActiveEvent(null);
                    updateMapboxLayers(updatedLayers);
                }
            });
    };

    const updateResponse = (reflection?: string, status?: ResponseStatus): void => {
        if (!isFaculty && responseData.length == 1) {
            const responseDatum = responseData[0];
            if (!reflection && !status) {
                return;
            }
            if (responseDatum) {
                if (reflection) {
                    responseDatum.reflection = reflection;
                }

                if (status) {
                    responseDatum.status = status;
                }
                void put<ResponseData>(`/api/response/${responseDatum.pk}/`, responseDatum)
                    .then((data) => {
                        setResponseData([data]);
                    });
            }
        }
    };

    const createFeedback = (responsePk: number, feedback: string) => {
        const obj = {
            response: responsePk,
            feedback: feedback
        };
        void post<FeedbackData>('/api/feedback/', obj)
            .then((data) => {
                setResponseData(
                    responseData.map((response) => {
                        if (response.pk == responsePk) {
                            response.feedback = data;
                        }
                        return response;
                    })
                );
            });
    };

    const updateFeedback = (pk: number, responsePk: number, feedback: string) => {
        const obj = {
            feedback: feedback
        };
        void put<FeedbackData>(`/api/feedback/${pk}/`, obj)
            .then((data) => {
                setResponseData(
                    responseData.map((response) => {
                        if (response.pk == responsePk) {
                            response.feedback = data;
                        }
                        return response;
                    })
                );
            });
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
            // This pin gets added to the projectMapboxLayers list because its
            // used on both the faculty and student view.
            let updatedLayers = projectMapboxLayers.filter((el) => {
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
            setProjectMapboxLayers(updatedLayers);
        }
    }

    useEffect(() => {
        // TODO: Refactor this to rededuce complexity
        const getData = async(): Promise<void> => {
            // Fetch the Project data
            let projectData: ProjectData;
            if (projectPk) {
                projectData = await get<ProjectData>(`/api/project/${projectPk}/`);
            } else {
                throw new Error('Project PK can not be found');
            }

            setProjectTitle(projectData.title);
            setProjectDescription(projectData.description);
            setProjectBaseMap(projectData.base_map);

            // Get Activity info
            if (projectData.activity) {
                const activityResponse = await fetch(`/api/activity/${projectData.activity}`);
                if (!activityResponse.ok) {
                    throw new Error('Activity data not loaded.');
                }
                setActivity(await activityResponse.json());
            }

            const layerVis = new Map<number, boolean>();

            if (activityPk && CURRENT_USER) {
                // Get related responses
                // The fetch returns a queryset, hence the list type
                const respData: ResponseData[] = await get(`/api/response/?activity=${activityPk}`);
                setResponseData(respData);
                if (isFaculty) {

                    // Get layers from responses and put them on the map
                    const respLayers = new Map<number, LayerData[]>();
                    const respMapLayers: IconLayer<EventData>[] = [];

                    for (const resp of respData) {
                        const layers: LayerData[] = [];
                        for (const layerUrl of resp.layers) {
                            layers.push(await get<LayerData>(layerUrl));
                        }

                        // Pack sets of layers, mapping response.pk to sets of layers
                        respLayers.set(resp.pk, layers);

                        // Then create a Mapbox layer for each response layer
                        // and set its visibility
                        for (const layer of layers) {
                            respMapLayers.push(
                                new IconLayer<EventData>({
                                    id: `response-layer-${layer.pk}`,
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
                                })
                            );
                            layerVis.set(layer.pk, true);
                        }
                    }

                    setResponseLayers(respLayers);
                    setResponseMapboxLayers(respMapLayers);

                } else {
                    if (respData.length > 0) {
                        const layers: LayerData[] = [];
                        for (const layerUrl of respData[0].layers) {
                            layers.push(await get<LayerData>(layerUrl));
                        }

                        // Create an empty layer if none exist, otherwise
                        // unpack the event data
                        if (layers.length === 0) {
                            addLayer(respData[0].pk);
                            setLayerTitleCount((prev) => {return prev + 1;});
                        } else {
                            const lyrs = layers.reduce((acc, val) => {
                                acc.set(val.pk, val);
                                // Set the layer visibility
                                layerVis.set(val.pk, true);
                                return acc;
                            }, new Map());
                            setLayerData(lyrs);
                            updateMapboxLayers(lyrs, setMapboxLayers, layerVis);
                            setActiveLayer(layers[0].pk);
                        }
                    } else {
                        const obj = {
                            activity: activityPk,
                            status: 'DRAFT'
                        };
                        void post<ResponseData>('/api/response/', obj)
                            .then((data) => {
                                setResponseData([data]);
                                addLayer(data.pk);
                                setLayerTitleCount((prev) => {return prev + 1;});
                            });
                    }
                }
            }

            // Fetch the Project layers
            const layers: LayerData[] = [];
            for (const layerUrl of projectData.layers) {
                layers.push(await get<LayerData>(layerUrl));
            }

            if (layers.length > 0) {
                const projLayers = layers.reduce((acc, val) => {
                    // Set the layer visibility while we're here
                    layerVis.set(val.pk, true);
                    acc.set(val.pk, val);
                    return acc;
                }, new Map());
                setProjectLayerData(projLayers);
                updateMapboxLayers(projLayers, setProjectMapboxLayers, layerVis);
                setLayerVisibility(layerVis);
            }
        };

        void getData();
    }, []);

    return (
        <>
            {isLoading && <LoadingModal />}
            {projectBaseMap && (
                <DeckGL
                    layers={isFaculty ? responseMapboxLayers.concat(projectMapboxLayers) : mapboxLayers.concat(projectMapboxLayers)} // eslint-disable-line max-len
                    initialViewState={viewportState}
                    width={'100%'}
                    height={'100%'}
                    controller={{doubleClickZoom: false} as {doubleClickZoom: boolean} & Controller} // eslint-disable-line max-len
                    onClick={handleDeckGlClick}
                    pickingRadius={15}
                    ContextProvider={MapContext.Provider}>
                    <StaticMap
                        reuseMaps
                        width={'100%'}
                        height={'100%'}
                        preventStyleDiffing={true}
                        mapStyle={'mapbox://styles/mapbox/' + projectBaseMap}
                        mapboxApiAccessToken={TOKEN}
                        onLoad={(): void => { setIsLoading(false); }}/>
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
            {projectTitle && (
                <ActivityMapPane
                    title={projectTitle || 'Untitled'}
                    description={projectDescription || ''}
                    isFaculty={isFaculty}
                    layers={layerData}
                    activity={activity}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    addLayer={addLayer}
                    deleteLayer={deleteLayer}
                    updateLayer={updateLayer}
                    layerVisibility={layerVisibility}
                    toggleLayerVisibility={toggleLayerVisibility}
                    toggleResponseVisibility={toggleResponseVisibility}
                    projectLayers={projectLayerData}
                    isProjectLayer={isProjectLayer}
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
                    updateEvent={updateEvent}
                    responseData={responseData}
                    updateResponse={updateResponse}
                    createFeedback={createFeedback}
                    updateFeedback={updateFeedback}
                    responseLayers={responseLayers}/>
            )}
        </>
    );
};
