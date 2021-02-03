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
import { LayerData, EventData } from '../project-activity-components/layers/layer-set';
import { LoadingModal } from '../project-activity-components/loading-modal';

const STATIC_URL = LocusTempus.staticUrl;
const CURRENT_USER = LocusTempus.currentUser.id;

import {
    ICON_SCALE, ICON_SIZE, ICON_COLOR, ICON_COLOR_ACTIVE
} from '../project-activity-components/common';

// TODO: fix types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authedFetch = (url: string, method: string, data: any): Promise<any> => {
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

    // TODO: update this to common settings
    const ICON_ATLAS = STATIC_URL + 'img/icon-map-marker.png';
    const ICON_MAPPING = {
        marker: {x: 0, y: 0, width: 384, height: 512, anchorY: 512, mask: true}
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
        info: PickInfo<EventData>): boolean => {
        // Clear the 'Add Event Form' and 'Add Event Pin'
        setShowAddEventForm(false);
        clearActivePosition();

        // Set the active event
        setActiveEvent(info.object as EventData);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    // TODO: move this to a common func
    const updateMapboxLayers = (layers: Map<number, LayerData>, setterFunc = setMapboxLayers, layerVisMap = layerVisibility): void => {
        const mapLayers = [...layers.entries()].reduce(
            (acc: IconLayer<LayerData>[], val: [number, LayerData]) => {
                const layerPk = val[0];
                const layer = val[1]
                if (layer && (layerVisMap.get(layer.pk) || false)) {
                    const MBLayer = new IconLayer({
                        id: 'icon-layer-' + val,
                        data: layer.events,
                        pickable: true,
                        iconAtlas: ICON_ATLAS,
                        iconMapping: ICON_MAPPING,
                        getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
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
        const responseMapLayers = [...responseLayers.entries()].reduce((acc: IconLayer<EventData>[], entry) => {
            const responsePk = entry[0];
            const layers = entry[1];
            const mapLayers = layers.reduce(
                (layerAcc: IconLayer<EventData>[], layerVal) => {
                    if (layerVis.get(responsePk)) {
                        const layer = new IconLayer({
                            id: 'response-layer-' + layerVal.pk,
                            data: layerVal.events,
                            pickable: true,
                            iconAtlas: ICON_ATLAS,
                            iconMapping: ICON_MAPPING,
                            getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
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
                    const layers = new Map(layerData);
                    layers.set(data.pk, data);
                    setLayerData(layers);

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
                    const updatedLayerData = new Map(layerData);
                    updatedLayerData.delete(pk);
                    setLayerData(updatedLayerData);

                    if (updatedLayerData.size === 0) {
                        // addLayer has a stale closure, so the fetch
                        // is called here instead
                        // TODO: refactor addLayer so optional params can be passed in
                        // to handle stale closure
                        if (!isFaculty && responseData.length == 1) {
                            const responseDatum = responseData[0];
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
                                    setLayerData(new Map([data.pk, data]));
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
                    const layers = new Map(layerData);
                    layers.set(data.pk, data);
                    setLayerData(layers);
                });
        } else {
            throw new Error('Layer update failed because no Locus Tempus Response ' +
                'object has been set');
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
            updateMapboxLayers(layerData, setMapboxLayers, layerVis)
        } else if (projectLayerData.has(pk)) {
            updateMapboxLayers(projectLayerData, setProjectMapboxLayers, layerVis)
        } else {
            throw new Error('The layer can not be found.')
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
        lng: number, mediaUrl: string | null): void => {
        const data = {
            label: label,
            layer: activeLayer,
            description: description,
            datetime: null,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            },
            media: mediaUrl ? [{url: mediaUrl}] : null
        };
        authedFetch('/api/event/', 'POST', JSON.stringify(data))
            .then((response) => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw 'Event creation failed.';
                }
            })
            .then((data: EventData) => {
                if (activeLayer) {
                    const updatedLayers = new Map(layerData);
                    const layer = layerData.get(activeLayer);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events].concat(data)
                        };
                        updatedLayers.set(activeLayer, updatedLayer);

                        updateMapboxLayers(updatedLayers);
                        setActiveEventDetail(data);
                        setActiveEvent(data);
                        goToNewEvent();
                    }
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
            .then((data: EventData) => {
                const updatedLayers = new Map(layerData);
                const layer = layerData.get(layerPk);

                if (layer) {
                    const updatedLayer = {
                        ...layer,
                        events: [...layer.events].map((event) => {
                            return event.pk == data.pk ? data : event
                        })
                    };
                    updatedLayers.set(layerPk, updatedLayer) 

                    updateMapboxLayers(updatedLayers);
                    setActiveEventDetail(data);
                    setActiveEvent(data);
                }
            });
    };

    const deleteEvent = (pk: number, layerPk: number): void => {
        authedFetch(`/api/event/${pk}/`, 'DELETE', JSON.stringify({pk: pk}))
            .then((response) => {
                if (response.status !== 204) {
                    throw 'Event deletion failed.';
                } else {
                    const updatedLayers = new Map(layerData);
                    const layer = layerData.get(layerPk);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events].filter((event) => {
                                return event.pk != pk
                            })
                        };
                        updatedLayers.set(layerPk, updatedLayer) 

                        setActiveEvent(null);
                        updateMapboxLayers(updatedLayers);
                    }
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

    const createFeedback = (responsePk: number, feedback: string) => {
        const obj = {
            response: responsePk,
            feedback: feedback
        };
        authedFetch('/api/feedback/', 'POST', JSON.stringify(obj))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw 'Feedback update failed.';
                }
            })
            .then((data: FeedbackData) => {
                // Update the response object
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
        authedFetch(`/api/feedback/${pk}/`, 'PUT', JSON.stringify(obj))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw 'Feedback update failed.';
                }
            })
            .then((data: FeedbackData) => {
                // Update the response object
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
                sizeScale: ICON_SCALE,
                getPosition: (d): Position => d.position,
                getSize: ICON_SIZE,
                getColor: ICON_COLOR_ACTIVE,
            }));
            setMapboxLayers(updatedLayers);
        }
    };

    useEffect(() => {
        // TODO: Refactor this to rededuce complexity
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

            const layerVis = new Map<number, boolean>();

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

                    // Get layers from responses and put them on the map
                    const respLayers = new Map<number, LayerData[]>();
                    const respMapLayers: IconLayer<LayerData>[] = []
                    
                    for (const resp of respData) {
                        // TODO: see if you can make this more efficient
                        const layerRequests = await Promise.all(
                            resp.layers.map((layer: string) => {
                                // TODO: figure out this is working, it shouldn't
                                // update to authedFetch
                                return fetch(layer);
                            })
                        );
                        const layers: LayerData[] = await Promise.all(
                            layerRequests.map((response: any) => {
                                return response.json();
                            })
                        );

                        // Pack sets of layers, mapping response.pk to sets of layers
                        respLayers.set(resp.pk, layers);

                        // Then create a Mapbox layer for each response layer
                        // and set its visibility
                        for (const layer of layers) {
                            respMapLayers.push(
                                new IconLayer({
                                    id: 'response-layer-' + layer.pk,
                                    data: layer.events,
                                    pickable: true,
                                    iconAtlas: ICON_ATLAS,
                                    iconMapping: ICON_MAPPING,
                                    getIcon: (d): string => 'marker', // eslint-disable-line @typescript-eslint/no-unused-vars, max-len
                                    sizeScale: ICON_SCALE,
                                    getPosition: (d): Position => d.location.lng_lat,
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

                        const layers: LayerData[] = await Promise.all(
                            layersRsps.map((response: any) => { return response.json(); }) // eslint-disable-line @typescript-eslint/no-explicit-any, max-len
                        );

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
                            }, new Map())
                            setLayerData(lyrs);
                            updateMapboxLayers(lyrs);
                            setActiveLayer(layers[0].pk);
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

            const layers: LayerData[] = await Promise.all(
                projectLayersRsps.map((response: any) => { return response.json(); }) // eslint-disable-line @typescript-eslint/no-explicit-any, max-len
            );

            if (layers.length > 0) {
                const projLayers = layers.reduce((acc, val) => {
                    // Set the layer visibility while we're here
                    layerVis.set(val.pk, true);
                    
                    acc.set(val.pk, val);
                    return acc;
                }, new Map())
                setProjectLayerData(projLayers);
                updateMapboxLayers(projLayers, setProjectMapboxLayers, layerVis);
                setLayerVisibility(layerVis);
            }
        };

        getData();
    }, []);

    return (
        <>
            {isLoading && <LoadingModal />}
            {projectBaseMap && (
                <DeckGL
                    layers={isFaculty ? responseMapboxLayers.concat(projectMapboxLayers) : mapboxLayers.concat(projectMapboxLayers)}
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
                <ProjectMapPane
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
