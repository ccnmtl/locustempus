/* A place to set shared settings */
import { FlyToInterpolator }  from 'deck.gl';
// import { Position } from '@deck.gl/core/utils/positions';
export type Position = [number, number] | [number, number, number];
export const STATIC_URL = LocusTempus.staticUrl;

export const ICON_ATLAS = STATIC_URL + 'img/icon-map-marker.png';
export const ICON_MAPPING = {
    marker: {x: 0, y: 0, width: 384, height: 512, anchorY: 512, mask: true}
};

export type RGBAColor = [number, number, number, number?];

export const ICON_SCALE = 10;
export const ICON_SIZE = 3;
export const ICON_SIZE_ACTIVE = 4;
export const ICON_COLOR: { [key: string]: RGBAColor} = {
    'amber': [255, 202, 40],
    'blue': [66, 165, 245],
    'green': [102, 187, 106],
    'purple': [171, 71, 188],
    'cyan': [38, 198, 218],
    'pink': [236, 64, 122],
    'lime': [212, 225, 87],
    'orange': [255, 167, 38]
};
export const ICON_COLOR_DEFAULT: RGBAColor = [204, 51, 51];
export const ICON_COLOR_ACTIVE: RGBAColor = [204, 51, 51];
// export const ICON_COLOR_NEW_EVENT: RGBAColor = [0, 51, 255];

export const BASE_MAPS = new Map([
    ['mapbox://styles/mapbox/streets-v11', 'Street'],
    ['mapbox://styles/mapbox/outdoors-v11', 'Outdoors'],
    ['mapbox://styles/mapbox/light-v10', 'Light'],
    ['mapbox://styles/mapbox/dark-v10', 'Dark'],
    ['mapbox://styles/mapbox/satellite-v9', 'Satellite'],
    ['mapbox://styles/mapbox/satellite-streets-v11', 'Satellite-Street'],
]);

export const BASE_MAP_IMAGES = new Map([
    ['mapbox://styles/mapbox/streets-v11', STATIC_URL + 'img/map_thumbnails/streets.jpg'],
    ['mapbox://styles/mapbox/outdoors-v11', STATIC_URL + 'img/map_thumbnails/outdoors.jpg'],
    ['mapbox://styles/mapbox/light-v10', STATIC_URL + 'img/map_thumbnails/light.jpg'],
    ['mapbox://styles/mapbox/dark-v10', STATIC_URL + 'img/map_thumbnails/dark.jpg'],
    ['mapbox://styles/mapbox/satellite-v9', STATIC_URL + 'img/map_thumbnails/satellite.jpg'],
    ['mapbox://styles/mapbox/satellite-streets-v11', STATIC_URL + 'img/map_thumbnails/satellite-streets.jpg'],
]);

// Shared Types
export interface CourseData {
    pk: number;
    title: string;
}

export interface RasterLayerData {
    pk: number;
    title: string;
    url: string;
}

export interface TileSublayerProps {
    data: {
        width: number;
        height: number;
    },
    id: string;
    tile: {
        bbox: {
            north: number,
            south: number,
            east: number,
            west: number
        }
    },
}

export interface ProjectData {
    pk: number;
    title: string;
    description: string;
    base_map: string;
    layers: string[];
    aggregated_layers: string[];
    raster_layers: RasterLayerData[];
    coursePk: number;
    activity?: number;
    course: CourseData;
}

export interface ActivityData {
    pk: number;
    instructions: string;
}

export interface MediaObject {
    url: string;
    source?: string;
    caption?: string;
    alt?: string;
}

export interface EventData {
    lngLat: Position;
    label: string;
    layer: number;
    pk: number;
    description: string;
    datetime: string;
    owner: string;
    short_description: string;
    location: {
        point: string;
        polygon: string;
        lng_lat: Position;
    };
    media: MediaObject[];
}

export interface LayerData {
    pk: number;
    title: string;
    color: string;
    owner: string;
    events: EventData[];
}

export interface DeckGLClickEvent extends MouseEvent {
    tapCount?: number
}

export interface ViewportState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
    transitionDuration?: number;
    transitionInterpolator?: FlyToInterpolator;
}

export const DEFAULT_VIEWPORT_STATE = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0
};

export interface Context {
    id: string;
    text: string;
}

export interface Result {
    result: {
        center: [number, number];
        context: [Context];
        geometry: {coordinates: [number, number], type: string;};
        id: string;
        language: string;
        matching_place_name: string;
        matching_text: string;
        place_name: string;
        place_type: [string];
        properties: {foursquare: string; landmark: boolean; wikidate: string;
            address: string; category: string;};
        relevance: number;
        text: string;
        type: string;
    }
}

export enum ResponseStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    REVIEWED = 'REVIEWED'
}

export interface FeedbackData {
    pk: number;
    body: string;
    submitted_at_formatted: string;
    modified_at_formatted: string;
    feedback_from: string;
}

export interface ResponseData {
    pk: number;
    activity: number;
    layers: string[];
    owners: string[];
    submitted_at: Date;
    modified_at: Date;
    submitted_at_formatted: string;
    modified_at_formatted: string;
    reflection: string;
    status: ResponseStatus;
    feedback: FeedbackData | null;
}