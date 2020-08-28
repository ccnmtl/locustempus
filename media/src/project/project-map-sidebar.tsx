import React, { useState } from 'react';
import { Layer, LayerProps } from './layer';
import { LayerEventData, LayerEventDatum } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';


export interface AddEventPanelProps {
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): any;
    activePosition: Position | null;
    addEvent(label: string, lat: number, lng: number): any;
    clearActivePosition(): any;
    setActiveTab(val: number): any;
}

const AddEventPanel = ({
    showAddEventForm, setShowAddEventForm,
    activePosition, addEvent, clearActivePosition, setActiveTab}: AddEventPanelProps) => {

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
                activePosition[0], activePosition[1]);
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
        <>
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
                        <button onClick={handleCancel} className={'btn btn-danger'}>
                            Cancel
                        </button>
                        <button type={'submit'} className={'btn btn-primary'}>
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    activeLayer: number | null;
    setActiveLayer(pk: number): any;
    addLayer(): any;
    deleteLayer(pk: number): any;
    updateLayer(pk: number, title: string): any;
    setLayerVisibility(pk: number): any;
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): any;
    activePosition: Position | null;
    addEvent(label: string, lat: number, lng: number): any;
    clearActivePosition(): any;
    activeEvent: number | null;
    setActiveEvent(pk: number): any;
}

export const ProjectMapSidebar = (
    {title, description, layers, events, activeLayer, setActiveLayer, addLayer,
        deleteLayer, updateLayer, setLayerVisibility, showAddEventForm,
        setShowAddEventForm, activePosition, addEvent, clearActivePosition,
        activeEvent, setActiveEvent}: ProjectMapSidebarProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);

    const handleSetActiveTab = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addLayer();
    };

    return (
        <div id='project-map-sidebar'>
            <h2>{title}</h2>
            <div>
                {showAddEventForm && (
                    <AddEventPanel
                        showAddEventForm={showAddEventForm}
                        setShowAddEventForm={setShowAddEventForm}
                        activePosition={activePosition}
                        addEvent={addEvent}
                        clearActivePosition={clearActivePosition}
                        setActiveTab={setActiveTab}/>
                )}
                {!showAddEventForm && (
                    <ul className="nav nav-tabs">
                        {['Overview', 'Base'].map((el, idx) => {
                            return (
                                <li className="nav-item" key={idx}>
                                    <a className={activeTab == idx ? 'nav-link active' : 'nav-link'}
                                        href='#'
                                        data-active-tab={idx}
                                        onClick={handleSetActiveTab}>{el}</a>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {activeTab === 0 && !showAddEventForm && (
                <>
                    <p>{description}</p>
                </>
            )}
            {activeTab === 1 && !showAddEventForm && (
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
                                    setActiveEvent={setActiveEvent}/>
                            );
                        })}
                </>
            )}
        </div>
    );
};
