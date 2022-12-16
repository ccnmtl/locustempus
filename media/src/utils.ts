import DeckGL  from 'deck.gl';
import { RefObject } from 'react';
import { WebMercatorViewport } from 'react-map-gl';
import { LayerData } from './project-activity-components/common';
import moment from 'moment';

type HTTPMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

async function authedFetch(url: string, method: HTTPMethod, data?: unknown): Promise<Response> {
    const csrf = (document.getElementById(
        'csrf-token') as HTMLElement).getAttribute('content') || '';
    const response  = await fetch(url,{
        method: method,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf
        }, body: JSON.stringify(data), credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response;
}

export async function get<T>(url: string): Promise<T> {
    const resp = await authedFetch(url, 'GET');
    if (resp.status !== 200) {
        throw new Error(`GET request failed: ${resp.statusText}`);
    }
    // There's no efficient way to type check the JSON response for
    // generic types at runtime.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function put<T>(url: string, data: unknown): Promise<T> {
    const resp = await authedFetch(url, 'PUT', data);
    if (resp.status !== 200) {
        throw new Error(`PUT request failed: ${resp.statusText}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function post<T>(url: string, data: unknown): Promise<T> {
    const resp = await authedFetch(url, 'POST', data);
    if (resp.status !== 201) {
        throw new Error(`POST request failed: ${resp.statusText}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedBody: T = await resp.json();
    return parsedBody;
}

export async function del(url: string): Promise<void> {
    const resp = await authedFetch(url, 'DELETE');
    if (resp.status !== 204) {
        throw new Error(`DELETE request failed: ${resp.statusText}`);
    }
}

export const getBoundedViewport = (
    layers: LayerData[],
    deckGlRef: RefObject<DeckGL>,
    mapPaneRef: RefObject<HTMLDivElement>): WebMercatorViewport => {
    // Returns a viewport object configured to include all event markers

    const coords: [number, number][] = [];
    for (const layer of layers) {
        for (const evt of layer.events) {
            const [lng, lat] = evt.location.lng_lat;
            coords.push([lng, lat]);
        }
    }

    let minLat = Infinity;
    let minLng = Infinity;
    let maxLat = -Infinity;
    let maxLng = -Infinity;

    for (const c of coords) {
        const [lng, lat] = c;
        minLat = lat < minLat ? lat : minLat;
        minLng = lng < minLng ? lng : minLng;
        maxLat = lat > maxLat ? lat : maxLat;
        maxLng = lng > maxLng ? lng : maxLng;
    }

    if (deckGlRef.current !== null) {
        const viewportOpt = {
            width: deckGlRef.current.deck.width,
            height: deckGlRef.current.deck.height
        };

        const padding = 50;
        // The left padding is contingent on if the map pane is visible or isn't.
        // First, assume that the map pane is visible. It doesn't get rendered until
        // after this component is rendered.
        let leftPaddingOffset = 512; // Trust me, the pane is 512px wide
        if (mapPaneRef.current !== null) {
            const boundingRect = mapPaneRef.current.getBoundingClientRect();
            // If the map pane is off the screen, then remove the offset
            leftPaddingOffset = boundingRect.x < 0 ? 0 : boundingRect.width;
        }
        const boundsOpt = {
            padding: {
                top: padding,
                bottom: padding,
                left: padding + leftPaddingOffset,
                right: padding
            },
            maxZoom: 15
        };
        let viewport = new WebMercatorViewport(viewportOpt);
        if (minLng !== Infinity && minLng !== Infinity &&
                maxLat !== -Infinity && maxLng !== -Infinity) {
            viewport = viewport.fitBounds([
                [minLng, minLat], [maxLng, maxLat],
            ], boundsOpt);
        }
        return viewport;
    } else {
        throw new Error(
            'The Deck GL component has not yet been rendered. ' +
                'This function is being called too soon.');
    }
};

export const dateToDatetime = (date: string) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
};