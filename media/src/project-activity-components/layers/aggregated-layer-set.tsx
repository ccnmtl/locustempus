import React  from 'react';
import { LayerSet } from './layer-set';
import {LayerData, EventData } from '../common';

interface AggregatedLayerSetProps {
    layers: Map<number, LayerData>;
    layerVisibility?: Map<number, boolean>;
    toggleLayerVisibility?(pk: number): void;
    activeLayer?: number | null;
    setActiveLayer?(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
}

export const AggregatedLayerSet: React.FC<AggregatedLayerSetProps> = (
    {
        layers, layerVisibility, activeLayer, setActiveLayer,
        toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit
    }: AggregatedLayerSetProps) => {

    const layerList = [...layers.values()].sort((a, b) => {return b.pk - a.pk;});
    const groupByOwner = layerList.reduce((acc, val) => {
        const owner = val.owner;
        if (acc.has(owner)) {
            // add to existing layers
            const lyrs = acc.get(owner);
            if (lyrs) {
                lyrs.set(val.pk, val);
                acc.set(owner, lyrs);
            }
        } else {
            // add a new layer
            const lyr = new Map<number, LayerData>();
            lyr.set(val.pk, val);
            acc.set(owner, lyr);
        }
        return acc;
    }, new Map<string, Map<number, LayerData>>());
    return (
        <>
            {[...groupByOwner.entries()].map(([owner, layers], idx) => {
                return (<React.Fragment key={idx}>
                    <hr/>
                    <div>
                        <h2 data-cy={'collaborator-response-name'}>
                            Response by {owner}
                        </h2>
                    </div>
                    <LayerSet
                        layers={layers}
                        addLayer={undefined}
                        updateLayer={undefined}
                        deleteLayer={undefined}
                        toggleLayerVisibility={toggleLayerVisibility}
                        layerVisibility={layerVisibility}
                        activeLayer={activeLayer}
                        setActiveLayer={setActiveLayer}
                        setActiveEvent={setActiveEvent}
                        activeEvent={activeEvent}
                        setActiveEventDetail={setActiveEventDetail}
                        activeEventEdit={activeEventEdit} />
                </React.Fragment>);
            })}
        </>
    );
};
