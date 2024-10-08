import React, { useState }  from 'react';
import { LayerSet } from './layer-set';
import {LayerData, EventData, ResponseData } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSlidersH, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';


interface AggregatedLayerSetProps {
    layers: Map<number, LayerData>;
    layerVisibility?: Map<number, boolean>;
    toggleLayerVisibility?(this:void, pk: number): void;
    activeLayer?: number | null;
    setActiveLayer?(this:void, pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(this:void, d: EventData): void;
    setActiveEventDetail(this:void, d: EventData): void;
    activeEventEdit: EventData | null;
    filterLayersByDate(this:void, range1: string, range2: string): void;
    resetContributorLayers(this:void): Promise<void>
    responseData: ResponseData[] | null;
    isFaculty: boolean;
    activeResponse: ResponseData | null;
    setActiveResponse(this:void, response: ResponseData | null | undefined): void;
}

export const AggregatedLayerSet: React.FC<AggregatedLayerSetProps> = (
    {
        layers, layerVisibility, activeLayer, setActiveLayer,
        toggleLayerVisibility, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit, filterLayersByDate, resetContributorLayers,
        responseData, isFaculty, setActiveResponse
    }: AggregatedLayerSetProps) => {

    const [range1, setRange1] = useState<string>('');
    const [range2, setRange2] = useState<string>('');
    const [dateText, setDateText] = useState<string>('All dates');

    const handleRange1 = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRange1(e.target.value);

        if (range2.length < 1) {

            setDateText(e.target.value + ' to present');

        } else if (range2.length > 1 && range2 === e.target.value) {

            setDateText('On ' + e.target.value);

        } else if (range2.length > 1) {

            setDateText(e.target.value + ' to ' + range2);

        }
    };

    const handleRange2 = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRange2(e.target.value);

        if (range1.length < 1) {

            setDateText('Up to ' + e.target.value);

        } else if (range1.length > 1 && range1 === e.target.value) {

            setDateText('On ' + e.target.value);

        } else if (range1.length > 1) {

            setDateText(range1 + ' to ' + e.target.value);

        }
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
        setDateText('All dates');
        void resetContributorLayers();
    };

    const getResponse = (owner: string) => {
        if(responseData){
            for(let i = 0; i < responseData?.length; i++){
                const ownersArr = responseData[i].owners;
                if(ownersArr.includes(owner)){
                    return responseData[i];
                }
            }
        } else {
            return null;
        }
    };

    const handleResponseClick = (owner: string): void => {
        if(responseData) {
            const respondata = getResponse(owner);
            setActiveResponse(respondata);
        }

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
            {!isFaculty && (
                <><hr className={'mt-5'} /><h2>Contributors’ responses</h2></>
            )}
            <div className={'form-group pane-form-group'}
                data-cy={'filter-section'}>
                <form onSubmit={handleFormSubmit}>
                    <label htmlFor={'form-field__date'}>
                        <FontAwesomeIcon icon={faSlidersH}/> Filter by date
                    </label>
                    <div className={'row mx-0'}>
                        <input
                            className={'form-control col-5 ml-3'}
                            type={'date'}
                            max={range2}
                            id={'form-field__date'}
                            data-cy={'filter_range_1'}
                            value={range1}
                            onChange={handleRange1}/>
                        <div className=
                            {'col-1 align-self-center p-0 text-center'}>
                            to</div>
                        <input
                            className={'form-control col-5'}
                            type={'date'}
                            min={range1}
                            id={'form-field__date'}
                            data-cy={'filter_range_2'}
                            value={range2}
                            onChange={handleRange2}/>
                    </div>
                    <div role={'alert'}
                        className={'filter-criteria-display text-right'}>
                        Filtering {dateText}...</div>
                    <div className={'d-flex justify-content-end px-4'}>
                        <button
                            onClick={handleClear}
                            data-cy={'clear-btn'}
                            className={'lt-button lt-button--outlined mr-2'}>
                            <span className={'lt-button__label'}>Clear</span>
                        </button>
                        <button type={'submit'}
                            data-cy={'search-btn'}
                            className={'lt-button lt-button--solid'}>
                            <span className={'lt-button__label'}>Search</span>
                        </button>
                    </div>
                </form>
            </div>
            {[...groupByOwner.entries()].map(([owner, layers], idx) => {
                let submitted = '';
                responseData?.forEach((el) => {
                    const owners = el.owners;
                    if(owners.includes(owner)) {
                        submitted = el.submitted_at_formatted;
                    }
                });

                return (<React.Fragment key={idx}>
                    <div className={'aggregate-box'}>
                        {!isFaculty && (
                            <h3 data-cy={'collaborator-response-name'}>
                                Response by {owner}
                            </h3>
                        )}

                        <div className={'d-flex flex-row'} data-cy={'response-summary'}>
                            <a href="#" onClick={(): void => {handleResponseClick(owner);}}>
                                <h3 id={`response-${idx}`} data-cy={'contributor'}>
                                    {owner}
                                </h3>
                            </a>
                            <button
                                onClick={(): void => {handleResponseClick(owner);}}
                                className={'lt-icon-button'}
                                data-cy="open-response">
                                <span className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden='true'>
                                    <FontAwesomeIcon icon={faLayerGroup}/>
                                </span>
                            </button>
                        </div>
                        <div className={'d-flex flex-column'}>
                            <p
                                className={'lt-date-display'}>
                                Last modified on {submitted}
                            </p>
                        </div>
                        <LayerSet
                            layers={layers}
                            addLayer={undefined}
                            updateLayer={undefined}
                            deleteLayer={undefined}
                            responseData={responseData}
                            toggleLayerVisibility={toggleLayerVisibility}
                            layerVisibility={layerVisibility}
                            activeLayer={activeLayer}
                            setActiveLayer={setActiveLayer}
                            setActiveEvent={setActiveEvent}
                            activeEvent={activeEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit} />
                    </div>
                </React.Fragment>);
            })}
        </>
    );
};
