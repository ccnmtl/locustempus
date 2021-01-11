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

import { ProjectMapPane } from './project-map-pane';
import { LayerProps } from '../project-activity-components/layers/layer';
import {
    LayerEventData, LayerEventDatum
} from '../project-activity-components/layers/layer-set';
import { LoadingModal } from '../project-activity-components/loading-modal';

const STATIC_URL = LocusTempus.staticUrl;
const CURRENT_USER = LocusTempus.currentUser.id;

// TODO: fix types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authedFetch = (url: string, method: string, data: any): Promise<any> => {
    const csrf = (document.getElementById(
        'csrf-token') as HTMLElement).getAttribute('content') || '';
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

export interface ResponseData {
    pk: number;
    activity: number;
    layers: string[];
    owners: string[];
    modified_at: Date;
    reflection: string;
    status: ResponseStatus;
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

export const BASE_MAPS = new Map([
    ['streets-v11', 'Street'],
    ['outdoors-v11', 'Outdoors'],
    ['light-v10', 'Light'],
    ['dark-v10', 'Dark'],
    ['satellite-v9', 'Satellite'],
    ['satellite-streets-v11', 'Satellite-Street'],
]);

export const BASE_MAP_IMAGES = new Map([
    ['streets-v11', STATIC_URL + 'img/map_thumbnails/streets.jpg'],
    ['outdoors-v11', STATIC_URL + 'img/map_thumbnails/outdoors.jpg'],
    ['light-v10', STATIC_URL + 'img/map_thumbnails/light.jpg'],
    ['dark-v10', STATIC_URL + 'img/map_thumbnails/dark.jpg'],
    ['satellite-v9', STATIC_URL + 'img/map_thumbnails/satellite.jpg'],
    ['satellite-streets-v11', STATIC_URL + 'img/map_thumbnails/satellite-streets.jpg'],
]);

export const ActivityMap: React.FC = () => {
    const [viewportState, setViewportState] = useState<ViewportState>({
        latitude: 40.8075395,
        longitude: -73.9647614,
        zoom: 10,
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
    const [projectLayerData, setProjectLayerData] = useState<LayerProps[]>([]);
    const [responseData, setResponseData] = useState<ResponseData[]>([]);
    const [layerData, setLayerData] = useState<LayerProps[]>([]);
    const [activeLayer, setActiveLayer] = useState<number | null>(null);
    const [ activeEvent, setActiveEvent] =
        useState<LayerEventDatum | null>(null);
    const [ activeEventDetail, setActiveEventDetail ] =
        useState<LayerEventDatum | null>(null);
    const [activeEventEdit, setActiveEventEdit] =
        useState<LayerEventDatum | null>(null);
    const [activity, setActivity] = useState<ActivityData | null>(null);

    // Data structure to hold events, keyed by layer PK
    const [eventData, setEventData] =
        useState<Map<number, LayerEventData>>(new Map());
    const [projectEventData, setProjectEventData] =
        useState<Map<number, LayerEventData>>(new Map());
    const [mapboxLayers, setMapboxLayers] =
        useState<IconLayer<LayerEventDatum>[]>([]);
    const [projectMapboxLayers, setProjectMapboxLayers] =
        useState<IconLayer<LayerEventDatum>[]>([]);

    const [layerTitleCount, setLayerTitleCount] = useState<number>(1);

    const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);
    const [activePosition, setActivePosition] = useState<Position | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const ICON_ATLAS = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png';
    const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
    };

    const clearActivePosition = (): void => {
        setActivePosition(null);
        setMapboxLayers((prev) => {
            return prev.filter((el) => {
                return el.id !== 'active-position';
            });
        });
    };

    const pickEventClickHandler = (
        info: PickInfo<LayerEventDatum>): boolean => {
        // Clear the 'Add Event Form' and 'Add Event Pin'
        setShowAddEventForm(false);
        clearActivePosition();

        // Set the active event
        setActiveEvent(info.object as LayerEventDatum);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    const updateEventData = (events: Map<number, LayerEventData>): void => {
        const mapLayers = [...events.keys()].reduce(
            (acc: IconLayer<LayerEventDatum>[], val: number) => {
                const data = events.get(val);
                if (data && data.visibility) {
                    const layer = new IconLayer({
                        id: 'icon-layer-' + val,
                        data: data.events,
                        pickable: true,
                        iconAtlas: ICON_ATLAS,
                        iconMapping: ICON_MAPPING,
                        getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
                        sizeScale: 15,
                        getPosition: (d): Position => d.location.lng_lat,
                        onClick: pickEventClickHandler,
                        getSize: 5,
                        getColor: [255, 0, 0],
                    });
                    return [...acc, layer];
                } else {
                    return acc;
                }
            },
            []);

        setEventData(events);
        setMapboxLayers(mapLayers);
    };

    const updateProjectEventData = (events: Map<number, LayerEventData>): void => {
        const mapLayers = [...events.keys()].reduce(
            (acc: IconLayer<LayerEventDatum>[], val: number) => {
                const data = events.get(val);
                if (data && data.visibility) {
                    const layer = new IconLayer({
                        id: 'icon-layer-' + val,
                        data: data.events,
                        pickable: true,
                        iconAtlas: ICON_ATLAS,
                        iconMapping: ICON_MAPPING,
                        getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
                        sizeScale: 15,
                        getPosition: (d): Position => d.location.lng_lat,
                        onClick: pickEventClickHandler,
                        getSize: 5,
                        getColor: [0, 0, 0],
                    });
                    return [...acc, layer];
                } else {
                    return acc;
                }
            },
            []);

        setProjectEventData(events);
        setProjectMapboxLayers(mapLayers);
    };

    const addLayer = (respPk: number | null = null): void => {
        if (!isFaculty && (responseData.length == 1 || respPk)) {
            const responseDatum = responseData[0];
            const responsePk = respPk || responseDatum.pk;
            authedFetch('/api/layer/', 'POST', JSON.stringify(
                {title: `Layer ${layerTitleCount}`,
                    content_object: `/api/response/${responsePk}/`})) // eslint-disable-line @typescript-eslint/camelcase, max-len
                .then((response) => {
                    if (response.status === 201) {
                        return response.json();
                    } else {
                        throw 'Layer creation failed.';
                    }
                })
                .then((data) => {
                    setLayerData([...layerData, data]);
                    setActiveLayer(data.pk);
                    setLayerTitleCount((prev) => {return prev + 1;});
                });
        } else {
            throw new Error(
                'Layer creation failed because no Locus Tempus response object has been set.');
        }
    };

    const deleteLayer = (pk: number): void => {
        authedFetch(`/api/layer/${pk}/`, 'DELETE', JSON.stringify({pk: pk}))
            .then((response) => {
                if (response.status !== 204) {
                    throw 'Layer deletion failed.';
                } else {
                    const updatedLayerData = layerData.filter((el) => {
                        return el.pk !== pk;
                    });
                    setLayerData(updatedLayerData);

                    // remove from eventData and mapboxLayers
                    const updatedEventData = new Map(eventData);
                    updatedEventData.delete(pk);
                    updateEventData(updatedEventData);

                    if (updatedLayerData.length === 0) {
                        // addLayer has a stale closure, so the fetch
                        // is called here instead
                        // TODO: refactor addLayer so optional params can be passed in
                        // to handle stale closure
                        if (!isFaculty && responseData.length == 1) {
                            const responseDatum = responseData[0]
                            authedFetch('/api/layer/', 'POST', JSON.stringify(
                                {title: `Layer ${layerTitleCount}`,
                                    content_object: `/api/response/${responseDatum.pk}/`})) // eslint-disable-line @typescript-eslint/camelcase, max-len
                                .then((response) => {
                                    if (response.status === 201) {
                                        return response.json();
                                    } else {
                                        throw 'Layer creation failed.';
                                    }
                                })
                                .then((data) => {
                                    setLayerData([data]);
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
                }
            });
    };

    const updateLayer = (pk: number, title: string): void => {
        if (!isFaculty && responseData.length == 1) {
            const responseDatum = responseData[0];
            authedFetch(`/api/layer/${pk}/`, 'PUT', JSON.stringify(
                {title: title, content_object: `/api/response/${responseDatum.pk}/`})) // eslint-disable-line @typescript-eslint/camelcase, max-len
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        throw 'Layer update failed.';
                    }
                })
                .then((data) => {
                    const layer = layerData.filter((el) => {
                        return el.pk !== pk;
                    });
                    setLayerData([...layer, data]);
                });
        } else {
            throw new Error('Layer update failed because no Locus Tempus Response ' +
                'object has been set');
        }
    };

    const isProjectLayer = (pk: number): boolean => {
        return projectEventData.has(pk);
    };

    const setLayerVisibility = (pk: number): void => {
        const isProj = isProjectLayer(pk);
        const data = isProj ? projectEventData : eventData;
        const updateFunc = isProj ? updateProjectEventData : updateEventData;

        const updatedEvents = new Map(data);
        const layerEvents = updatedEvents.get(pk);

        if (layerEvents) {
            updatedEvents.set(pk, {
                visibility: !layerEvents.visibility,
                events: layerEvents.events
            });

            updateFunc(updatedEvents);
        }
    };

    const goToNewEvent = useCallback(() => {
        if (activePosition) {
            setViewportState({
                latitude: activePosition[0],
                longitude: activePosition[1],
                zoom: 12,
                bearing: 0,
                pitch: 40.5,
                transitionDuration: 1000,
                transitionInterpolator: new FlyToInterpolator()
            });
        }
    }, [activePosition]);

    const addEvent = (
        label: string, description: string, lat: number, lng: number): void => {
        const data = {
            label: label,
            layer: activeLayer,
            description: '',
            datetime: null,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            }
        };
        authedFetch('/api/event/', 'POST', JSON.stringify(data))
            .then((response) => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw 'Event creation failed.';
                }
            })
            .then((data: LayerEventDatum) => {
                if (activeLayer) {
                    const updatedEvents = new Map(eventData);
                    const layerEvents: LayerEventData =
                        updatedEvents.get(activeLayer) || {visibility: true, events: []}; // eslint-disable-line max-len

                    updatedEvents.set(activeLayer, {
                        visibility: layerEvents.visibility,
                        events: layerEvents.events.concat(data)
                    });

                    updateEventData(updatedEvents);
                    setActiveEvent(data);
                    goToNewEvent();
                }
            });
    };

    const updateEvent = (
        label: string, description: string, lat: number, lng: number,
        pk: number, layerPk: number): void => {
        const obj = {
            label: label,
            description: description,
            layer: layerPk,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            }
        };
        authedFetch(`/api/event/${pk}/`, 'PUT', JSON.stringify(obj))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw 'Event update failed.';
                }
            })
            .then((data: LayerEventDatum) => {
                // Revomve the event from eventData and mapboxLayers
                const updatedEventData = new Map(eventData);
                const layerEventObj = updatedEventData.get(layerPk);
                if (layerEventObj && layerEventObj.events) {
                    updatedEventData.set(layerPk, {
                        visibility: layerEventObj.visibility,
                        events: layerEventObj.events.map((el) => {
                            return el.pk !== data.pk ? el : data;
                        })
                    });
                }
                updateEventData(updatedEventData);
                // Update the data for the active event
                setActiveEventDetail(data);
                setActiveEvent(data);
            });
    };

    const deleteEvent = (pk: number, layerPk: number): void => {
        authedFetch(`/api/event/${pk}/`, 'DELETE', JSON.stringify({pk: pk}))
            .then((response) => {
                if (response.status !== 204) {
                    throw 'Event deletion failed.';
                } else {
                    // Remove the event from eventData and mapboxLayers
                    const updatedEventData = new Map(eventData);
                    const layerEventObj = updatedEventData.get(layerPk);
                    if (layerEventObj && layerEventObj.events) {
                        updatedEventData.set(layerPk, {
                            visibility: layerEventObj.visibility,
                            events: layerEventObj.events.filter((el) => {
                                return el.pk !== pk; })
                        });
                    }
                    setActiveEvent(null);
                    updateEventData(updatedEventData);
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
                authedFetch(`/api/response/${responseDatum.pk}/`, 'PUT', JSON.stringify(responseDatum))
                    .then((response) => {
                        if (response.status === 200) {
                            return response.json();
                        } else {
                            throw 'Response update failed.';
                        }
                    })
                    .then((data: ResponseData) => {
                        setResponseData([data]);
                    });
            }
        }
    };

    // TODO: figure out how to type this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeckGlClick = (info: any, event: any): void => {
        // Create on single click, make sure that new event
        // is not created when user intends to pick an existing event
        if (event.tapCount === 1) {
            // Clear the active event
            setActiveEvent(null);
            setActiveEventDetail(null);
            setActiveEventEdit(null);
            setShowAddEventForm(true);
            setActivePosition([info.lngLat[1], info.lngLat[0]]);
            let updatedLayers = mapboxLayers.filter((el) => {
                return el.id !== 'active-position';
            });
            updatedLayers = updatedLayers.concat(new IconLayer({
                id: 'active-position',
                data: [
                    {position: [info.lngLat[0], info.lngLat[1]] as Position}],
                pickable: true,
                iconAtlas: ICON_ATLAS,
                iconMapping: ICON_MAPPING,
                getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
                sizeScale: 15,
                getPosition: (d): Position => d.position,
                getSize: 5,
                getColor: [0, 0, 255],
            }));
            setMapboxLayers(updatedLayers);
        }
    };

    useEffect(() => {
        const getData = async(): Promise<void> => {
            // Fetch the Project data
            const projectResponse = await fetch(`/api/project/${projectPk}/`);
            if (!projectResponse.ok) {
                throw new Error('Project data not loaded');
            }
            const projectData = await projectResponse.json();
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

            if (activityPk && CURRENT_USER) {
                if (isFaculty) {
                    // Get related responses
                    const resp = await fetch(
                        `/api/response/?activity=${activityPk}`);
                    if (!resp.ok) {
                        throw new Error('Project response request failed.');
                    }
                    // NB: The fetch returns a queryset, hence the list type
                    const respData: ResponseData[] = await resp.json();
                    setResponseData(respData);

                } else {
                    // If a contributor, get or create a response
                    const resp = await fetch(
                        `/api/response/?activity=${activityPk}`);
                    if (!resp.ok) {
                        throw new Error('Project response request failed.');
                    }
                    // NB: The fetch returns a queryset, hence the list type
                    const respData: ResponseData[] = await resp.json();
                    if (respData.length > 0) {
                        setResponseData(respData);
                        const layersRsps = await Promise.all(
                            respData[0].layers.map((layer: string) => {
                                return fetch(layer);
                            })
                        );
                        // TODO: fix type
                        const layers = await Promise.all(
                            layersRsps.map((response: any) => { return response.json(); }) // eslint-disable-line @typescript-eslint/no-explicit-any, max-len
                        );

                        // Create an empty layer if none exist, otherwise
                        // unpack the event data
                        if (layers.length === 0) {
                            addLayer(respData[0].pk);
                            setLayerTitleCount((prev) => {return prev + 1;});
                        } else {
                            setLayerData(layers);
                            setActiveLayer(layers[0].pk);

                            const events = layers.reduce((acc, val) => {
                                acc.set(val.pk, {visibility: true, events: val.event_set});
                                return acc;
                            }, new Map());
                            updateEventData(events);
                        }
                    } else {
                        authedFetch('/api/response/', 'POST', JSON.stringify(
                            {activity: activityPk, status: 'DRAFT'}))
                            .then((response) => {
                                if (response.status === 201) {
                                    return response.json();
                                } else {
                                    throw 'Event update failed.';
                                }
                            })
                            .then((data: ResponseData) => {
                                setResponseData([data]);
                                addLayer(data.pk);
                                setLayerTitleCount((prev) => {return prev + 1;});
                            });
                    }
                }
            }

            // Fetch the Project layers
            const projectLayersRsps = await Promise.all(
                projectData.layers.map((layer: string) => {
                    return fetch(layer);
                })
            );

            // TODO: fix type
            const layers = await Promise.all(
                projectLayersRsps.map((response: any) => { return response.json(); }) // eslint-disable-line @typescript-eslint/no-explicit-any, max-len
            );

            if (layers.length > 0) {
                setProjectLayerData(layers);

                const events = layers.reduce((acc, val) => {
                    acc.set(val.pk, {visibility: true, events: val.event_set});
                    return acc;
                }, new Map());
                updateProjectEventData(events);
            }
        };

        getData();
    }, []);

    return (
        <>
            {isLoading && <LoadingModal />}
            {projectBaseMap && (
                <DeckGL
                    layers={mapboxLayers.concat(projectMapboxLayers)}
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
                            closeOnClick={false}
                            onClose={(): void => {setActiveEvent(null);}}>
                            <div>{activeEvent.label}</div>
                            <div dangerouslySetInnerHTML={
                                {__html: activeEvent.description}}/>
                            {!activeEventDetail && (
                                <button onClick={
                                    (): void => {
                                        setActiveEventDetail(activeEvent);}}>
                                    More
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
                <ProjectMapPane
                    title={projectTitle || 'Untitled'}
                    description={projectDescription || ''}
                    isFaculty={isFaculty}
                    layers={layerData}
                    events={eventData}
                    activity={activity}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    addLayer={addLayer}
                    deleteLayer={deleteLayer}
                    updateLayer={updateLayer}
                    setLayerVisibility={setLayerVisibility}
                    projectLayers={projectLayerData}
                    projectEvents={projectEventData}
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
                    updateResponse={updateResponse}/>
            )}
        </>
    );
};
