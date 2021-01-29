import React  from 'react';
import { Layer } from './layer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';

interface MediaObject {
    url: string;
}

export interface EventData {
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
    media: MediaObject[];
}

export interface LayerData {
    pk: number;
    title: string;
    events: EventData[];
}

// Add LayerVisibility map
interface LayerSetProps {
    layers: Map<number, LayerData>;
    layerVisibility: Map<number, boolean>;
    addLayer?(): void;
    deleteLayer?(pk: number): void;
    updateLayer?(pk: number, title: string): void;
    toggleLayerVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
}

export const LayerSet: React.FC<LayerSetProps> = (
    {
        layers, layerVisibility, addLayer, deleteLayer, updateLayer, activeLayer,
        setActiveLayer, toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit
    }: LayerSetProps) => {

    const layerList = [...layers.values()];

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (addLayer) {
            addLayer();
        }
    };

    return (
        <div className='fade-load'>
            {addLayer && (
                <div className={'d-flex justify-content-end'}>
                    <form onSubmit={handleCreateLayer}>
                        <button type='submit' className={'lt-button'}>
                            <span className={'lt-icons lt-button__icon'}>
                                <FontAwesomeIcon icon={faLayerGroup}/>
                            </span>
                            <span className={'lt-button__text'}>Add layer</span>
                        </button>
                    </form>
                </div>
            )}
            {layerList && layerList.map(
                (layer, idx) => {
                    return (
                        <Layer
                            layer={layer}
                            deleteLayer={deleteLayer}
                            updateLayer={updateLayer}
                            key={idx}
                            activeLayer={activeLayer}
                            setActiveLayer={setActiveLayer}
                            layerVisibility={layerVisibility.get(layer.pk) || false}
                            toggleLayerVisibility={toggleLayerVisibility}
                            activeEvent={activeEvent}
                            setActiveEvent={setActiveEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit}/>
                    );
                })}
        </div>
    );
};
