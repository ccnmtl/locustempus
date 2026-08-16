import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    _MapContext as MapContext, StaticMap, NavigationControl, Popup, MapRef
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
    ICON_ATLAS, ICON_MAPPING, ICON_SCALE, ICON_SIZE, ICON_SIZE_ACTIVE,
    ICON_COLOR, ICON_COLOR_DEFAULT, ICON_COLOR_ACTIVE, DEFAULT_VIEWPORT_STATE,
    ViewportState, ProjectData, ActivityData,
    LayerData, EventData, MediaObject, DeckGLClickEvent, TileSublayerProps, Result
} from '../project-activity-components/common';

import {get, put, post, del, getBoundedViewport, dateToDatetime, datetimeToDate } from '../utils';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import Geocoder from 'react-map-gl-geocoder';

export const ProjectMap: React.FC = () => {
    const [viewportState, setViewportState] = useState<ViewportState>(DEFAULT_VIEWPORT_STATE);
    const mapContainer: HTMLElement | null =
        document.querySelector('#project-map-container');
    const TOKEN = mapContainer ? mapContainer.dataset.maptoken : '';
    let geocoder = null;
    if (mapContainer && mapContainer.dataset.geocoder === 'True') {
        geocoder = true;
    } else {
        geocoder = false;
    }
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
    const [activeTab, setActiveTab] = useState<number>(0);

    const navControlStyle= {
        right: 10,
        bottom: 25
    };

    // The point on the map where a new event will be placed
    const [addEventMockData, setAddEventMockData] = useState<EventData | null>();

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

    const [rasterLayers, setRasterLayers] = useState<TileLayer<string>[]>([]);

    const [layerVisibility, setLayerVisibility] = useState<Map<number, boolean>>(new Map());

    const [showAddEventForm, setShowAddEventForm] = useState<boolean>(false);
    const [activePosition, setActivePosition] = useState<Position | null>(null);

    const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const mapRef = useRef<MapRef>(null);
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoderRef = useRef<any>(null);
    const stateRef = useRef<boolean>();
    stateRef.current = showAddEventForm;
    const [showSearchPopup, setShowSearchPopup] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<Result | null>(null);

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
                setLayerData((prev) => {
                    prev.set(data.pk, data);
                    return prev;
                });

                setLayerVisibility((prev) => {
                    prev.set(data.pk, true);
                    return prev;
                });

                setActiveLayer(data.pk);
            });
    };

    const deleteLayer = (pk: number): void => {
        void del(`/api/layer/${pk}/`)
            .then(() => {
                const updatedLayerData = new Map(layerData);
                updatedLayerData.delete(pk);
                setLayerData(updatedLayerData);

                setLayerVisibility((prev) => {
                    prev.delete(pk);
                    return prev;
                });

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
                            const vis = new Map<number, boolean>();
                            vis.set(data.pk, true);
                            setLayerVisibility(vis);
                        });
                } else {
                    // Set the first layer to be the active layer
                    setActiveLayer([...updatedLayerData.values()][0].pk);
                }
            });
    };

    const updateLayer = (pk: number, title: string, color: string): void => {
        void put<LayerData>(
            `/api/layer/${pk}/`, {
                title: title,
                color: color,
                content_object: `/api/project/${projectPk}/`})
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
        label: string, datetime: string | null, description: string, lat: number, lng: number,
        mediaObj: MediaObject | null): void => {
        if (activeLayer === null) {
            throw new Error('Add Event failed: no active layer is defined');
        }

        let newDate;
        if (!datetime){
            newDate = null;
        } else {
            newDate = dateToDatetime(datetime);
        }

        const data = {
            label: label,
            layer: activeLayer,
            description: description,
            datetime: newDate,
            location: {
                point: {lat: lat, lng: lng},
                polygon: null
            },
            media: mediaObj ? [mediaObj] : null
        };
        void post<EventData>('/api/event/', data)
            .then((d) => {
                if (activeLayer !== null) {
                    const updatedLayers = new Map(layerData);
                    const layer = layerData.get(activeLayer);

                    if (layer) {
                        const updatedLayer = {
                            ...layer,
                            events: [...layer.events].concat(d)
                        };
                        updatedLayers.set(activeLayer, updatedLayer);

                        setLayerData(updatedLayers);
                        setActiveEvent(d);
                        goToEvent(d);
                    }
                } else {
                    throw new Error(
                        'Project addEvent failed: No active layer present.');
                }
            });
    };

    const updateEvent = (
        label: string,  datetime: string | null, description: string, lat: number, lng: number,
        pk: number, layerPk: number, mediaObj: MediaObject | null): void => {

        const obj = {
            label: label,
            description: description,
            layer: layerPk,
            datetime: datetime,
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
        //Close Popup if there is a click after search
        setShowSearchPopup(false);
        // Cast to provide type def for coordinate
        const infoPrime = info as PickInfo<D> & {coordinate: [number, number]};

        // Create on single click, make sure that new event
        // is not created when user intends to pick an existing event
        if (event.tapCount === 1) {
            // Prevent user from creating a new event or selecting a different
            // event while editing an existing event
            if (activeEventEdit) { return; }
            // Clear the active event
            setActiveEventDetail(null);
            setActiveEventEdit(null);
            setActivePosition([infoPrime.coordinate[1], infoPrime.coordinate[0]]);
            // eslint-disable-next-line max-len
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            geocoderRef?.current?.geocoder?.setInput(
                `${infoPrime.coordinate[1]}, ${infoPrime.coordinate[0]}`);

            // The click data needs to be packed this way so that the type
            // of mapLayers remains homogenous
            const mockData = {} as EventData;
            mockData.lngLat = [infoPrime.coordinate[0], infoPrime.coordinate[1]];
            displayAddEventForm(true, mockData);
        }
    }

    const handleSearchPin = (coords: [number, number]) => {
        if (activeEventEdit) { return; }
        setShowSearchPopup(false);
        setActiveEvent(null);
        setActiveEventDetail(null);
        setActiveEventEdit(null);

        setActivePosition([coords[1], coords[0]]);
        // The click data needs to be packed this way so that the type
        // of mapLayers remains homogenous
        const mockData = {} as EventData;
        mockData.lngLat = [coords[0], coords[1]];
        displayAddEventForm(true, mockData);
    };

    const handleSearch = useCallback((result: Result) => {
        setSearchResult(result);
        if (stateRef.current === false) {
            setShowSearchPopup(true);
        }
    }, []);

    const pickEventClickHandler = (info: PickInfo<EventData>): boolean => {
        if (showAddEventForm || activeEventEdit) {
            return false;
        }

        // Set the active event
        setActiveEvent(info.object);
        setActiveTab(1);

        // Returning true prevents event from bubling to map canvas
        return true;
    };

    // Set up the layers for rendering
    const mapLayers = [...layerData.values()].reduce(
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
                getColor: () => {
                    return layer.color ? ICON_COLOR[layer.color] : ICON_COLOR_DEFAULT;  },
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
                getSize: ICON_SIZE_ACTIVE,
                getColor: ICON_COLOR_ACTIVE,
            }));
    }

    const handleViewportChange = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (newViewport: React.SetStateAction<ViewportState>) => setViewportState(newViewport),
        []
    );
    const handleGeocoderViewportChange = useCallback(
        (newViewport) => {
            const geocoderDefaultOverrides = { transitionDuration: 1000 };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return handleViewportChange({
                ...newViewport,
                ...geocoderDefaultOverrides
            });
        },
        [handleViewportChange]
    );

    const activeElementDate = activeEvent ? datetimeToDate(activeEvent.datetime) : null;

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

        void getData().finally(() => {setIsDataLoading(false);});
    }, []);

    return (
        <>
            {(isMapLoading || isDataLoading) && <LoadingModal />}
            {projectData && (
                <div style={{ height: 'calc(100vh - 4.125rem)' }}>
                    <div
                        ref={geocoderContainerRef}
                        style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}
                    />
                    <DeckGL
                        layers={[
                            ...rasterLayers as any, // eslint-disable-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, max-len
                            ...mapLayers
                        ]}
                        viewState={viewportState}
                        onViewStateChange={e => setViewportState(e.viewState)} // eslint-disable-line @typescript-eslint/no-unsafe-argument, max-len
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
                            ref={mapRef}
                            onLoad={(): void => {setIsMapLoading(false); }}>
                            {geocoder &&
                                <Geocoder
                                    position="top-right"
                                    mapRef={mapRef}
                                    ref={geocoderRef}
                                    containerRef={geocoderContainerRef}
                                    mapboxApiAccessToken={TOKEN}
                                    limit={8}
                                    trackProximity={true}
                                    reverseGeocode={true}
                                    minLength={4}
                                    marker={false}
                                    enableEventLogging={false}
                                    onResult={handleSearch}
                                    onViewportChange={handleGeocoderViewportChange}>
                                </Geocoder>
                            }
                        </StaticMap>

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
                                <div className={'mapboxgl-popup-text'}>
                                    <h2>{activeEvent.label}</h2>
                                    <div className={'event-attr'}>By {activeEvent.owner}</div>
                                    {activeEvent.datetime && (
                                        <div className={'event-attr mt-2'}>
                                            Associated date:&nbsp;
                                            {activeElementDate}
                                        </div>
                                    )}
                                    <div className={'event-summary lt-quill-rendered'}
                                        dangerouslySetInnerHTML={{__html: activeEvent.short_description}}/> {/* eslint-disable-line max-len */}
                                    <button
                                        type="button"
                                        onClick={(): void => {
                                            setActiveEventDetail(activeEvent);}}
                                        className={'lt-button btn-sm'}
                                        data-cy={'event-detail-more'}>
                                        <span>More</span>
                                    </button>
                                </div>
                            </Popup>
                        )}
                        {showSearchPopup && searchResult && (
                            <Popup
                                latitude={searchResult.result.center[1]}
                                longitude={searchResult.result.center[0]}
                                offsetTop={-30}
                                closeOnClick={false}
                                onClose={(): void => {setShowSearchPopup(false);}}>
                                <div className={'mapboxgl-popup-text'}>
                                    <h2>{searchResult.result.text}</h2>
                                    <a
                                        href='#'
                                        onClick={() => handleSearchPin(searchResult.result.center)}>
                                            [add event marker]
                                    </a>
                                </div>
                            </Popup>
                        )}
                        <div id='map-navigation-control'>
                            <NavigationControl style={navControlStyle} />
                        </div>
                    </DeckGL>
                </div>
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
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
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
                    updateEvent={updateEvent}/>
            )}
        </>
    );
};
