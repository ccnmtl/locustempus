import React, { useState, useEffect, useRef } from 'react';
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

import { ActivityMapPane } from './activity-map-pane';
import { LoadingModal } from '../project-activity-components/loading-modal';

import {get, put, post, del, getBoundedViewport } from '../utils';

const CURRENT_USER = LocusTempus.currentUser.id;

import {
    ICON_ATLAS, ICON_MAPPING, ICON_SCALE, ICON_SIZE, ICON_SIZE_ACTIVE,
    ICON_COLOR, ICON_COLOR_ACTIVE, ICON_COLOR_NEW_EVENT,
    DEFAULT_VIEWPORT_STATE, ViewportState, ProjectData, DeckGLClickEvent,
    LayerData, EventData, MediaObject, TileSublayerProps
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

export const ActivityMap: React.FC = () => {
    const [viewportState, setViewportState] = useState<ViewportState>(DEFAULT_VIEWPORT_STATE);

    const mapContainer: HTMLElement | null =
        document.querySelector('#activity-map-container');
    const TOKEN = mapContainer ? mapContainer.dataset.maptoken : '';
    const projectPk = mapContainer && mapContainer.dataset.projectpk;
    const activityPk = mapContainer && mapContainer.dataset.activitypk;
    let isFaculty = false;
    if (mapContainer && mapContainer.dataset.isfaculty === 'True') {
        isFaculty = true;
    }

    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [responseData, setResponseData] = useState<ResponseData[]>([]);

    const deckglMap = useRef<DeckGL>(null);
    const mapPane = useRef<HTMLDivElement>(null);

    const navControlStyle= {
        right: 10,
        bottom: 25
    };

    /* Layers */
    // projectLayerData holds Layers belonging to the base project
    const [projectLayerData, setProjectLayerData] = useState<Map<number, LayerData>>(new Map());

    // layerData holds Layers created by the student when responding
    // TODO: rename this to better reflect what it does
    const [layerData, setLayerData] = useState<Map<number, LayerData>>(new Map());

    // TODO: ditto here, rename to disambiguate this from the above layers
    // responseLayers are used in the faculty view, it holds the layers belonging to
    // student responses
    const [responseLayers, setResponseLayers] =
        useState<Map<number, LayerData[]>>(new Map());

    const [rasterLayers, setRasterLayers] = useState<TileLayer<string>[]>([]);

    // Map to identify which layers should be visible
    const [layerVisibility, setLayerVisibility] =
        useState<Map<number, boolean>>(new Map());
    const [activeLayer, setActiveLayer] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<number>(0);

    // The point on the map where a new event will be placed
    const [addEventMockData, setAddEventMockData] = useState<EventData | null>();


    // Active event
    const [ activeEvent, setActiveEvent] =
        useState<EventData | null>(null);
    const [ activeEventDetail, setActiveEventDetail ] =
        useState<EventData | null>(null);
    const [activeEventEdit, setActiveEventEdit] =
        useState<EventData | null>(null);

    const [activity, setActivity] = useState<ActivityData | null>(null);

    const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);
    const [activePosition, setActivePosition] = useState<Position | null>(null);

    const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

    // Project handling functions
    const setBaseMap = (baseMap: string) => {
        if (projectData) {
            setProjectData({...projectData, base_map: baseMap});
        }
    };

    const updateProject = (
        title: string, description: string, baseMap: string): void => {
        if (projectData) {
            const data = projectData;
            data.title = title;
            data.description = description;
            data.base_map = baseMap;
            void put<ProjectData>(`/api/project/${projectData.pk}/`, data)
                .then((d) => {
                    setProjectData(d);
                });
        }
    };

    const deleteProject = (): void => {
        if (projectData) {
            const csrf = (document.getElementById(
                'csrf-token') as HTMLElement).getAttribute('content') || '';
            const form = document.createElement('form');
            form.style.visibility = 'hidden';
            form.method = 'POST';
            form.action = `/course/${projectData.course.pk}/project/${projectData.pk}/delete/`;

            const csrfField = document.createElement('input');
            csrfField.name = 'csrfmiddlewaretoken';
            csrfField.value = csrf;
            form.appendChild(csrfField);
            document.body.appendChild(form);

            form.submit();
        }
    };

    const toggleResponseVisibility = (responsePk: number): void => {
        const layerVis = new Map(layerVisibility);
        const layers = responseLayers.get(responsePk);
        if (layers) {
            layers.forEach((lyr) => {
                if (layerVis.has(lyr.pk)) {
                    layerVis.set(lyr.pk, !layerVis.get(lyr.pk));
                }
            });
        }

        setLayerVisibility(layerVis);
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
        void del(`/api/activity/${id}/`)
            .then(() => {
                window.location.reload();
            });
    };

    const addLayer = (respPk: number | null = null): void => {
        if (isFaculty && projectPk) {
            const newLayer = {
                title: 'Untitled Layer',
                content_object: `/api/project/${projectPk}/`
            };
            void post<LayerData>('/api/layer/', newLayer)
                .then((data) => {
                    const layers = new Map(projectLayerData);
                    layers.set(data.pk, data);
                    setProjectLayerData(layers);

                    const layerVis = new Map(layerVisibility);
                    layerVis.set(data.pk, true);
                    setLayerVisibility(layerVis);

                    setActiveLayer(data.pk);
                });
        } else if (!isFaculty && (responseData.length == 1 || respPk)) {
            const responsePk = respPk || responseData[0].pk;
            const newLayer = {
                title: 'Untitled Layer',
                content_object: `/api/response/${responsePk}/`
            };
            void post<LayerData>('/api/layer/', newLayer)
                .then((data) => {
                    const layers = new Map(layerData);
                    layers.set(data.pk, data);
                    setLayerData(layers);

                    const layerVis = new Map(layerVisibility);
                    layerVis.set(data.pk, true);
                    setLayerVisibility(layerVis);

                    setActiveLayer(data.pk);
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
                // Determine if the related layer is a project layer
                const isProjLayer = isProjectLayer(pk);
                const updatedLayers = new Map(isProjLayer ? projectLayerData : layerData);
                const setLayerDataFunc = isProjLayer ? setProjectLayerData : setLayerData;
                updatedLayers.delete(pk);
                setLayerDataFunc(updatedLayers);

                const layerVis = new Map(layerVisibility);
                layerVis.delete(pk);
                setLayerVisibility(layerVis);

                if (updatedLayers.size === 0) {
                    // addLayer has a stale closure, so the fetch
                    // is called here instead
                    // TODO: refactor addLayer so optional params can be passed in
                    // to handle stale closure
                    if (isFaculty && projectPk) {
                        const newLayer = {
                            title: 'Untitled Layer',
                            content_object: `/api/project/${projectPk}/`
                        };
                        void post<LayerData>('/api/layer/', newLayer)
                            .then((data) => {
                                setProjectLayerData(new Map([[data.pk, data]]));
                                setActiveLayer(data.pk);
                            });
                    } else if (!isFaculty && responseData.length == 1) {
                        const responsePk = responseData[0].pk;
                        const newLayer = {
                            title: 'Untitled Layer',
                            content_object: `/api/response/${responsePk}/`
                        };
                        void post<LayerData>('/api/layer/', newLayer)
                            .then((data) => {
                                setLayerData(new Map([[data.pk, data]]));
                                setActiveLayer(data.pk);
                            });
                    } else {
                        throw new Error(
                            'Layer creation failed because no Locus Tempus Response ' +
                            'object has been set.');
                    }
                } else {
                    // Set the first layer to be the active layer
                    setActiveLayer([...updatedLayers.values()][0].pk);
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
        const layerVis = new Map(layerVisibility);
        layerVis.set(pk, !layerVisibility.get(pk));
        setLayerVisibility(layerVis);

    };

    const goToEvent = (event: EventData) => {
        setViewportState((prev) => {
            return {
                latitude: event.location.lng_lat[1],
                longitude: event.location.lng_lat[0],
                zoom: prev.zoom,
                bearing: 0,
                pitch: 0,
                transitionDuration: 1000,
                transitionInterpolator: new FlyToInterpolator()
            };
        });
    };

    const handleSetActiveEvent = (event: EventData) => {
        setActiveEvent(event);
        goToEvent(event);
    };

    const addEvent = (
        label: string, description: string, lat: number,
        lng: number, mediaObj: MediaObject | null): void => {
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
                    const updatedLayers = new Map(isFaculty ? projectLayerData : layerData);
                    const layer = updatedLayers.get(activeLayer);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events, data]
                        };
                        updatedLayers.set(activeLayer, updatedLayer);

                        const setLayerDataFunc = isFaculty ? setProjectLayerData : setLayerData;
                        setLayerDataFunc(updatedLayers);

                        setActiveEvent(data);
                        goToEvent(data);
                    } else {
                        throw new Error('Add Event failed: the active layer failed to be located');
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
                // Determine if the related layer is a project layer
                const isProjLayer = isProjectLayer(data.layer);
                const layerDataToUpdate = isProjLayer ? projectLayerData : layerData;
                const updatedLayers = new Map(layerDataToUpdate);
                const layer = layerDataToUpdate.get(layerPk);

                if (layer) {
                    const updatedLayer = {
                        ...layer,
                        events: [...layer.events].map((event) => {
                            return event.pk == data.pk ? data : event;
                        })
                    };
                    updatedLayers.set(layerPk, updatedLayer);

                    const setLayerDataFunc = isProjLayer ? setProjectLayerData : setLayerData;
                    setLayerDataFunc(updatedLayers);

                    setActiveEvent(data);
                } else {
                    throw new Error(
                        'Update Event failed: the layer associated with this event does not exist');
                }
            });
    };

    const deleteEvent = (pk: number, layerPk: number): void => {
        void del(`/api/event/${pk}/`)
            .then(() => {
                // Determine if the related layer is a project layer
                const isProjLayer = isProjectLayer(layerPk);
                const layerDataToUpdate = isProjLayer ? projectLayerData : layerData;
                const updatedLayers = new Map(layerDataToUpdate);
                const layer = layerDataToUpdate.get(layerPk);

                if (layer) {
                    const updatedLayer = {
                        ...layer,
                        events: [...layer.events].filter((event) => {
                            return event.pk != pk;
                        })
                    };
                    updatedLayers.set(layerPk, updatedLayer);

                    const setLayerDataFunc = isProjLayer ? setProjectLayerData : setLayerData;
                    setLayerDataFunc(updatedLayers);

                    setActiveEvent(null);
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
            body: feedback
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
            response: responsePk,
            body: feedback
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

    const displayAddEventForm = (displayForm: boolean, mockData?: EventData) => {
        if (displayForm && mockData) {
            setShowAddEventForm(true);
            setAddEventMockData(mockData);
        } else {
            setShowAddEventForm(false);
            setAddEventMockData(null);
        }
    };

    function handleDeckGlClick<D>(info: PickInfo<D>, event: DeckGLClickEvent): void {
        // Cast to provide type def for coordinate
        const infoPrime = info as PickInfo<D> & {coordinate: [number, number]};

        // Create on single click, make sure that new event
        // is not created when user intends to pick an existing event
        if (event.tapCount === 1) {
            // Prevent user from creating a new event or selecting a different
            // event while editing an existing event
            if (activeEventEdit) { return; }
            // Clear the active event
            setActiveEvent(null);
            setActiveEventDetail(null);
            setActiveEventEdit(null);
            setActivePosition([infoPrime.coordinate[1], infoPrime.coordinate[0]]);
            // The click data needs to be packed this way so that the type
            // of mapLayers remains homogenous
            const mockData = {} as EventData;
            mockData.lngLat = [infoPrime.coordinate[0], infoPrime.coordinate[1]];
            displayAddEventForm(true, mockData);
        }
    }

    const pickEventClickHandler = (info: PickInfo<EventData>): boolean => {
        if (showAddEventForm || activeEventEdit) {
            return false;
        }

        // Set the active event
        setActiveEvent(info.object);
        // TODO If a student event, then find the response and open that up
        setActiveTab(projectLayerData.has(info.object.layer) ? 1 : 2);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    // Set up the layers for rendering
    const flattenedResponseLayers = [...responseLayers.values()].reduce((acc, layers) => {
        return acc.concat([...layers]);
    }, []);

    const mapLayers = [
        ...layerData.values(),
        ...projectLayerData.values(),
        ...flattenedResponseLayers
    ].reduce(
        (acc: IconLayer<EventData>[], layer: LayerData) => {
            const MBLayer = new IconLayer<EventData>({
                id: `icon-layer-${layer.pk}`,
                data: [...layer.events],
                pickable: true,
                iconAtlas: ICON_ATLAS,
                iconMapping: ICON_MAPPING,
                getIcon: (): string => 'marker',
                sizeScale: ICON_SCALE,
                getPosition: (d) => d.location.lng_lat,
                onClick: pickEventClickHandler,
                getSize: (d) => {
                    return activeEventDetail && d.pk == activeEventDetail.pk ?
                        ICON_SIZE_ACTIVE : ICON_SIZE; },
                getColor: (d) => {
                    return activeEventDetail && d.pk == activeEventDetail.pk ?
                        ICON_COLOR_ACTIVE : ICON_COLOR; },
                visible: layerVisibility.get(layer.pk) || false
            });
            return acc.concat(MBLayer);
        },
        []);

    if (addEventMockData) {
        mapLayers.push(
            new IconLayer<EventData>({
                id: 'active-position',
                data: [addEventMockData],
                pickable: true,
                iconAtlas: ICON_ATLAS,
                iconMapping: ICON_MAPPING,
                getIcon: () => 'marker',
                sizeScale: ICON_SCALE,
                getPosition: (d) => d.lngLat,
                getSize: ICON_SIZE,
                getColor: ICON_COLOR_NEW_EVENT,
            }));
    }

    useEffect(() => {
        // TODO: Refactor this to rededuce complexity
        const getData = async(): Promise<void> => {
            // List to hold the event, used to set zoom once all layers are loaded
            let layersForZoom: LayerData[] = [];

            // Fetch the Project data
            let projData: ProjectData;
            if (projectPk) {
                projData = await get<ProjectData>(`/api/project/${projectPk}/`);
            } else {
                throw new Error('Project PK can not be found');
            }

            setProjectData(projData);
            // Get Activity info
            if (projData.activity) {
                const activityResponse = await fetch(`/api/activity/${projData.activity}`);
                if (!activityResponse.ok) {
                    throw new Error('Activity data not loaded.');
                }
                setActivity(await activityResponse.json());
            }

            const layerVis = new Map<number, boolean>();

            // Fetch the Project layers
            const layers: LayerData[] = [];
            for (const layerUrl of projData.layers) {
                layers.push(await get<LayerData>(layerUrl));
            }

            if (layers.length > 0) {
                const projLayers = layers.reduce((acc, val) => {
                    // Set the layer visibility while we're here
                    layerVis.set(val.pk, true);
                    acc.set(val.pk, val);
                    return acc;
                }, new Map<number, LayerData>());
                setProjectLayerData(projLayers);
                layersForZoom = layersForZoom.concat([...projLayers.values()]);
                setLayerVisibility(layerVis);

                // Sets the active layer for faculty while we have the layers
                // in hand. An active layer for student responses will be set below
                if (isFaculty) {
                    setActiveLayer(layers[0].pk);
                }
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
                    for (const layers of respLayers.values()) {
                        layersForZoom = layersForZoom.concat(layers);
                    }
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
                        } else {
                            const lyrs = layers.reduce((acc, val) => {
                                acc.set(val.pk, val);
                                // Set the layer visibility
                                layerVis.set(val.pk, true);
                                return acc;
                            }, new Map<number, LayerData>());
                            setLayerData(lyrs);
                            layersForZoom = layersForZoom.concat([...lyrs.values()]);
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
                                setActiveLayer(data.pk);
                            });
                    }
                }
            }
            const viewport = getBoundedViewport(layersForZoom, deckglMap, mapPane);
            setViewportState({
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: viewport.zoom,
                bearing: 0,
                pitch: 0
            });
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
                        ...mapLayers
                    ]}
                    ref={deckglMap}
                    viewState={viewportState}
                    onViewStateChange={e => setViewportState(e.viewState)}
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
                        mapStyle={projectData.base_map}
                        mapboxApiAccessToken={TOKEN}
                        onLoad={(): void => { setIsMapLoading(false); }}/>
                    {activeEvent && layerVisibility.get(activeEvent.layer) &&
                        !activeEventDetail && !showAddEventForm && (
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
                        </Popup>
                    )}
                    <div id='map-navigation-control'>
                        <NavigationControl style={navControlStyle} />
                    </div>
                </DeckGL>
            )}
            {projectData && (
                <ActivityMapPane
                    ref={mapPane}
                    title={projectData.title}
                    description={(() => projectData.description)()}
                    baseMap={projectData.base_map}
                    setBaseMap={setBaseMap}
                    updateProject={updateProject}
                    deleteProject={deleteProject}
                    isFaculty={isFaculty}
                    layers={isFaculty ? projectLayerData : layerData}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activity={activity}
                    updateActivity={updateActivity}
                    deleteActivity={deleteActivity}
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
                    displayAddEventForm={displayAddEventForm}
                    activePosition={activePosition}
                    activeEvent={activeEvent}
                    setActiveEvent={handleSetActiveEvent}
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
