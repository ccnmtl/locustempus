import React  from 'react';
import { Layer, LayerProps } from './layer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';

export interface LayerEventDatum {
    lngLat: Position;
    label: string;
    layer: number;
    pk: number;
    description: string;
    datetime: string;
    location: {
        point: string;
        polygon: string;
        lng_lat: Position;
    };
}

export interface LayerEventData {
    visibility: boolean;
    events: LayerEventDatum[];
}

interface LayerSetProps {
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    addLayer?(): void;
    deleteLayer?(pk: number): void;
    updateLayer?(pk: number, title: string): void;
    setLayerVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: LayerEventDatum | null;
    setActiveEvent(d: LayerEventDatum): void;
    setActiveEventDetail(d: LayerEventDatum): void;
    activeEventEdit: LayerEventDatum | null;
}

export const LayerSet: React.FC<LayerSetProps> = (
    {
        layers, events, addLayer, deleteLayer, updateLayer, activeLayer,
        setActiveLayer, setLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit
    }: LayerSetProps) => {

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (addLayer) {
            addLayer();
        }
    };

    return (
        <>
            {addLayer && (
                <form onSubmit={handleCreateLayer}>
                    <button type='submit'>
                        <FontAwesomeIcon icon={faLayerGroup}/>Add Layer
                    </button>
                </form>
            )}
            {layers && layers.map(
                (layer, idx) => {
                    let layerEvents: LayerEventDatum[] = [];
                    const data = events.get(layer.pk);
                    if (data && data.events) {
                        layerEvents = data.events;
                    }

                    let layerVisibility = true;
                    if (data && data.visibility) {
                        layerVisibility = data.visibility;
                    }

                    return (
                        <Layer {...layer}
                            deleteLayer={deleteLayer}
                            updateLayer={updateLayer}
                            key={idx}
                            activeLayer={activeLayer}
                            setActiveLayer={setActiveLayer}
                            layerEvents={layerEvents}
                            layerVisibility={layerVisibility}
                            setLayerVisibility={setLayerVisibility}
                            activeEvent={activeEvent}
                            setActiveEvent={setActiveEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit}/>
                    );
                })}
        </>
    );
};
