import React, { useState }  from 'react';
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
    filterLayersByDate(range1: string, range2: string): void;
    resetContributorLayers(): Promise<void>
}

export const AggregatedLayerSet: React.FC<AggregatedLayerSetProps> = (
    {
        layers, layerVisibility, activeLayer, setActiveLayer,
        toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit, filterLayersByDate, resetContributorLayers
    }: AggregatedLayerSetProps) => {

    const [range1, setRange1] = useState<string>('');
    const [range2, setRange2] = useState<string>('');

    const handleRange1 = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRange1(e.target.value);
    };
    const handleRange2 = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRange2(e.target.value);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // only filter if there is an input.
        if (!(range1.length < 1 && range2.length < 1)) {
            filterLayersByDate(range1, range2);
        }
    };
    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setRange1('');
        setRange2('');
        void resetContributorLayers();
    };

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
            {/* <form onSubmit={handleFormSubmit}>
                <div className='container lt-list-group' data-cy={'filter-section'}>
                    <div className={'form-group pane-form-group pane-form-group row pb-1'}>
                        <label className={'col-3'} htmlFor={'form-field__date'}>
                        Filter Events
                        </label>
                        <input
                            className={'form-control col-4'}
                            type={'date'}
                            id={'form-field__date'}
                            data-cy={'filter_range_1'}
                            value={range1}
                            onChange={handleRange1}/>
                        <p className="col-1 mt-1 pl-2">To</p>
                        <input
                            className={'form-control col-4'}
                            type={'date'}
                            id={'form-field__date'}
                            data-cy={'filter_range_2'}
                            value={range2}
                            onChange={handleRange2}/>
                    </div>
                    <div className='row justify-content-md-end'>
                        <button type={'button'}
                            onClick={handleClear}
                            data-cy={'clear-btn'}
                            className={'btn btn-sm btn-secondary .col-md-3 mr-1 mb-1'}>
                            <span className={'lt-button__label'}>Clear</span>
                        </button>
                        <button type={'submit'}
                            data-cy={'search-btn'}
                            className={'btn btn-sm btn-primary .col-md-3 mr-1 mb-1'}>
                            <span className={'lt-button__label'}>Search</span>
                        </button>
                    </div>
                </div>
            </form> */}
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
