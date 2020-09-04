import React, { useState } from 'react';
import { Layer, LayerProps } from './layer';
import { LayerEventData, LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faArrowLeft, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';


interface EventEditPanelProps {
    activeLayer: number | null;
    activeEventEdit: LayerEventDatum;
    setActiveEventEdit(d: LayerEventDatum | null): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number, layerPk: number): void;
}

export const EventEditPanel = ({
    activeLayer, activeEventEdit,
    setActiveEventEdit, updateEvent}: EventEditPanelProps) => {

    const [
        eventName, setEventName] = useState<string>(activeEventEdit.label);
    const [
        description, setDescription
    ] = useState<string>(activeEventEdit.description);
    const [
        datetime, setDatetime
    ] = useState<string>(activeEventEdit.datetime || '');

    const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventName(e.target.value);
    };

    const handleDescription= (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDatetime(e.target.value);
    };

    const handleFormSubmbit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateEvent(
            eventName, description, activeEventEdit.location.lng_lat[1],
            activeEventEdit.location.lng_lat[0],
            activeEventEdit.pk, activeEventEdit.layer);
        setActiveEventEdit(null);
    };

    const handleCancel = (e: React.MouseEvent) => {
        setActiveEventEdit(null);
    };
    return (
        <div>
            <h4>Edit Event</h4>
            <form onSubmit={handleFormSubmbit} >
                <div className={'form-row'}>
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__name'}>Name</label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'text'}
                            id={'event-form__name'}
                            value={eventName}
                            placeholder={'Untitled Marker'}
                            onChange={handleName}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__description'}>
                            Description
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <textarea
                            id={'event-form__description'}
                            value={description}
                            rows={3}
                            onChange={handleDescription}>
                        </textarea>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__date'}>
                            Date
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'datetime-local'}
                            id={'event-form__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                    </div>
                    <div className={'form-group col-9'}>
                        <button
                            onClick={handleCancel} className={'btn btn-danger'}>
                            Cancel
                        </button>
                        <button type={'submit'} className={'btn btn-primary'}>
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};


interface EventAddPanelProps {
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): any;
    activePosition: Position | null;
    addEvent(label: string, description: string, lat: number, lng: number): any;
    clearActivePosition(): any;
    setActiveTab(val: number): any;
}

export const EventAddPanel = ({
    showAddEventForm, setShowAddEventForm,
    activePosition, addEvent,
    clearActivePosition, setActiveTab}: EventAddPanelProps) => {

    const [eventName, setEventName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');

    const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventName(e.target.value);
    };

    const handleDescription= (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDatetime(e.target.value);
    };

    const handleFormSubmbit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (activePosition) {
            addEvent(
                eventName === '' ? 'Untitled Marker' : eventName,
                description, activePosition[0], activePosition[1]);
            setShowAddEventForm(false);
            setActiveTab(1);
            clearActivePosition();
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        setShowAddEventForm(false);
        clearActivePosition();
    };
    return (
        <div>
            <h4>Add Event</h4>
            <form onSubmit={handleFormSubmbit} >
                <div className={'form-row'}>
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__name'}>Name</label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'text'}
                            id={'event-form__name'}
                            value={eventName}
                            placeholder={'Untitled Marker'}
                            onChange={handleName}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__description'}>
                            Description
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <textarea
                            id={'event-form__description'}
                            value={description}
                            rows={3}
                            onChange={handleDescription}>
                        </textarea>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'event-form__date'}>
                            Date
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'datetime-local'}
                            id={'event-form__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                    </div>
                    <div className={'form-group col-9'}>
                        <button
                            onClick={handleCancel} className={'btn btn-danger'}>
                            Cancel
                        </button>
                        <button type={'submit'} className={'btn btn-primary'}>
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

interface EventDetailPanelProps {
    activeLayer: number | null;
    activeEventDetail: LayerEventDatum | null;
    setActiveEventDetail(d: LayerEventDatum | null): any;
    activeEventEdit: LayerEventDatum | null;
    setActiveEventEdit(d: LayerEventDatum | null): any;
    deleteEvent(pk: number, layerPk: number): any;
}

export const EventDetailPanel = ({
    activeLayer, activeEventDetail, setActiveEventDetail, activeEventEdit,
    setActiveEventEdit, deleteEvent}: EventDetailPanelProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        if (activeEventDetail && activeLayer) {
            deleteEvent(activeEventDetail.pk, activeLayer);
            setActiveEventDetail(null);
        }
    };

    return (
        <div>
            <div>
                <button onClick={() => {setActiveEventDetail(null);}}>
                    <FontAwesomeIcon icon={faArrowLeft}/> Back
                </button>
                <button
                    onClick={() => {setShowMenu((prev) => {return !prev;});}}>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </button>

            </div>
            {showMenu && (
                <div>
                    <ul>
                        <li><a onClick={
                            () => {setActiveEventEdit(activeEventDetail);}}>
                            Edit marker</a>
                        </li>
                        <li><a onClick={handleDelete}>Delete marker</a></li>
                    </ul>
                </div>
            )}
            <h3>{activeEventDetail && activeEventDetail.label}</h3>
            <p>{activeEventDetail && activeEventDetail.description}</p>
        </div>
    );
};

interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(idx: number): void;
    addLayer(): void;
    description: string;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    setLayerVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: LayerEventDatum | null;
    setActiveEvent(d: LayerEventDatum): void;
    activeEventDetail: LayerEventDatum | null;
    setActiveEventDetail(d: LayerEventDatum): void;
    activeEventEdit: LayerEventDatum | null;
    setActiveEventEdit(d: LayerEventDatum): void;
}

export const DefaultPanel = (
    {activeTab, setActiveTab, addLayer, description, layers, events,
        deleteLayer, updateLayer, setLayerVisibility, activeLayer,
        setActiveLayer, activeEvent, setActiveEvent, activeEventDetail,
        setActiveEventDetail, activeEventEdit, setActiveEventEdit}:
            DefaultPanelProps) => {
    const handleSetActiveTab = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addLayer();
    };

    return (
        <>
            <div>
                <ul className="nav nav-tabs">
                    {['Overview', 'Base'].map((el, idx) => {
                        return (
                            <li className="nav-item" key={idx}>
                                <a className={activeTab == idx ?
                                    'nav-link active' : 'nav-link'}
                                href='#'
                                data-active-tab={idx}
                                onClick={handleSetActiveTab}>{el}</a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {activeTab === 0 && (
                <p>{description}</p>
            )}
            {activeTab === 1 && (
                <>
                    <form onSubmit={handleCreateLayer}>
                        <button type='submit'>
                            <FontAwesomeIcon icon={faLayerGroup}/>Add Layer
                        </button>
                    </form>
                    {layers && layers.map(
                        (layer, idx) => {
                            let layerEvents: LayerEventDatum[] = [];
                            let data = events.get(layer.pk);
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
                                    activeEventDetail={activeEventDetail}
                                    setActiveEventDetail={setActiveEventDetail}
                                    activeEventEdit={activeEventEdit}
                                    setActiveEventEdit={setActiveEventEdit}/>
                            );
                        })}
                </>
            )}
        </>
    );
};

