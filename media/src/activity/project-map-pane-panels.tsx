import React, { useState, useEffect } from 'react';
import {
    LayerSet, LayerData, EventData
} from '../project-activity-components/layers/layer-set';
import {
    ActivityData, ResponseData, ResponseStatus,
} from './activity-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faEllipsisV, faEye, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';
import ReactQuill from 'react-quill';


interface EventEditPanelProps {
    activeLayer: number | null;
    activeEventEdit: EventData;
    setActiveEventEdit(d: EventData | null): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number, layerPk: number): void;
}

export const EventEditPanel: React.FC<EventEditPanelProps> = (
    {
        activeEventEdit, setActiveEventEdit, updateEvent
    }: EventEditPanelProps) => {

    const [
        eventName, setEventName] = useState<string>(activeEventEdit.label);
    const [
        description, setDescription
    ] = useState<string>(activeEventEdit.description);
    const [
        datetime, setDatetime
    ] = useState<string>(activeEventEdit.datetime || '');

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmbit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateEvent(
            eventName, description, activeEventEdit.location.lng_lat[1],
            activeEventEdit.location.lng_lat[0],
            activeEventEdit.pk, activeEventEdit.layer);
        setActiveEventEdit(null);
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventEdit(null);
    };

    return (
        <div className='EditEvent'>
            <h4>Edit Event</h4>
            <form onSubmit={handleFormSubmbit} >
                <div className={'form-row'}>
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            value={eventName}
                            autoFocus={true}
                            onChange={handleName}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__date'}>
                            Date
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'datetime-local'}
                            id={'form-field__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                    </div>
                    <div className={'form-group col-9'}>
                        <button
                            type={'button'}
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
    setShowAddEventForm(val: boolean): void;
    activePosition: Position | null;
    addEvent(label: string,
             description: string, lat: number, lng: number, mediaUrl: string | null): void;
    clearActivePosition(): void;
    setActiveTab(val: number): void;
}

export const EventAddPanel: React.FC<EventAddPanelProps> = (
    { setShowAddEventForm, activePosition, addEvent,
        clearActivePosition, setActiveTab}: EventAddPanelProps) => {

    const [eventName, setEventName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmbit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (activePosition) {
            addEvent(
                eventName === '' ? 'Untitled Marker' : eventName,
                description, activePosition[0], activePosition[1], null);
            setShowAddEventForm(false);
            setActiveTab(2);
            clearActivePosition();
        }
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowAddEventForm(false);
        clearActivePosition();
    };

    return (
        <div className='AddEvent'>
            <h4>Add Event</h4>
            <form onSubmit={handleFormSubmbit} >
                <div className={'form-row'}>
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            value={eventName}
                            autoFocus={true}
                            placeholder={'Untitled Marker'}
                            onChange={handleName}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                        <label htmlFor={'form-field__date'}>
                            Date
                        </label>
                    </div>
                    <div className={'form-group col-9'}>
                        <input
                            type={'datetime-local'}
                            id={'form-field__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
                    </div>
                </div>
                <div className="form-row">
                    <div className={'form-group col-3'}>
                    </div>
                    <div className={'form-group col-9'}>
                        <button
                            type={'button'}
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
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData | null): void;
    setActiveEventEdit(d: EventData | null): void;
    deleteEvent(pk: number, layerPk: number): void;
    isProjectLayer(pk: number): boolean;
}

export const EventDetailPanel: React.FC<EventDetailPanelProps> = (
    {
        activeLayer, activeEventDetail, setActiveEventDetail,
        setActiveEventEdit, deleteEvent, isProjectLayer
    }: EventDetailPanelProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventDetail(null);
    };

    const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowMenu((prev) => {return !prev;});
    };

    const handleDelete = (e: React.MouseEvent): void => {
        e.preventDefault();
        if (activeEventDetail && activeLayer) {
            deleteEvent(activeEventDetail.pk, activeLayer);
            setActiveEventDetail(null);
        }
    };

    const handleEdit = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveEventEdit(activeEventDetail);
    };

    return (
        <div>
            <div>
                <button onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft}/> Back
                </button>
                {activeLayer && !isProjectLayer(activeLayer) && (
                    <button onClick={handleMenuToggle}>
                        <FontAwesomeIcon icon={faEllipsisV}/>
                    </button>
                )}
            </div>
            {showMenu && (
                <div>
                    <ul>
                        <li><a onClick={handleEdit}>
                            Edit marker</a>
                        </li>
                        {/* TODO: Implement confirmation */}
                        <li><a onClick={handleDelete}>Delete marker</a></li>
                    </ul>
                </div>
            )}
            <h3>{activeEventDetail && activeEventDetail.label}</h3>
            {activeEventDetail && (
                <div dangerouslySetInnerHTML={
                    {__html: activeEventDetail.description}}/>
            )}
        </div>
    );
};


interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(idx: number): void;
    addLayer(): void;
    description: string;
    layers: Map<number, LayerData>;
    projectLayers:  Map<number, LayerData>;
    activity: ActivityData | null;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData): void;
    responseData: ResponseData[];
    updateResponse(reflection?: string, status?: ResponseStatus): void;
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    isFaculty: boolean;
    responseLayers: Map<number, LayerData[]>;
    paneHeaderHeight: number;
}

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, description, layers, activity,
        deleteLayer, updateLayer, layerVisibility, toggleLayerVisibility,
        toggleResponseVisibility, activeLayer, setActiveLayer, activeEvent,
        setActiveEvent, setActiveEventDetail, activeEventEdit, projectLayers,
        responseData, updateResponse, createFeedback, updateFeedback,
        isFaculty, responseLayers, paneHeaderHeight
    }: DefaultPanelProps) => {


    const [reflection, setReflection] = useState<string>('');

    useEffect(() => {
        // Only set a reflection if the user is not faculty/author
        if (!isFaculty && responseData.length == 1 && responseData[0].reflection) {
            setReflection(responseData[0].reflection);
        }
    }, [responseData]);

    const handleSetActiveTab = (
        e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleSubmitResponse = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateResponse(reflection, ResponseStatus.SUBMITTED);
    };

    const handleReflectionSaveDraft = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        updateResponse(reflection);
    };

    const OVERVIEW = 0;
    const BASE = 1;
    const RESPONSE = 2;
    const responseTabTitle = isFaculty ? `Responses (${responseData.length})` : 'Response';

    return (
        <>
            <ul className='nav nav-tabs pane-content-tabs' style={{ top: paneHeaderHeight }}>
                {['Overview', 'Base', responseTabTitle].map((el, idx) => {
                    return (
                        <li className='nav-item button' key={idx}>
                            <a className={activeTab == idx ?
                                'nav-link active' : 'nav-link'}
                            href='#'
                            data-active-tab={idx}
                            onClick={handleSetActiveTab}>{el}</a>
                        </li>
                    );
                })}
            </ul>
            <div className='pane-content-body'>
                {/* TODO: Render the tabs for activities here.
                    Think about how to turn these into components that can be passed into
                    this larger panel */}
                {activeTab === OVERVIEW && activity && (
                    <div className='fade-load'>
                        <div>
                            <h2>Activity Description</h2>
                            <div dangerouslySetInnerHTML={{__html: activity.description}}/>
                        </div>
                        <div>
                            <h2>Activity Instructions</h2>
                            <div dangerouslySetInnerHTML={{__html: activity.instructions}}/>
                        </div>
                    </div>
                )}
                {activeTab === BASE && (
                    <div className='fade-load'>
                        <LayerSet
                            layers={projectLayers}
                            toggleLayerVisibility={toggleLayerVisibility}
                            layerVisibility={layerVisibility}
                            activeLayer={activeLayer}
                            setActiveLayer={setActiveLayer}
                            setActiveEvent={setActiveEvent}
                            activeEvent={activeEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit} />
                    </div>
                )}
                {activeTab == RESPONSE && (
                    <div className='fade-load'>
                        {isFaculty ? (
                            <FacultySubPanel
                                responseData={responseData}
                                createFeedback={createFeedback}
                                updateFeedback={updateFeedback}
                                responseLayers={responseLayers}
                                layerVisibility={layerVisibility}
                                toggleLayerVisibility={toggleLayerVisibility}
                                toggleResponseVisibility={toggleResponseVisibility}
                                activeLayer={activeLayer}
                                setActiveLayer={setActiveLayer}
                                activeEvent={activeEvent}
                                setActiveEvent={setActiveEvent}
                                setActiveEventDetail={setActiveEventDetail}
                                activeEventEdit={activeEventEdit}/>
                        ) : (<>
                            <LayerSet
                                layers={layers}
                                addLayer={addLayer}
                                deleteLayer={deleteLayer}
                                updateLayer={updateLayer}
                                layerVisibility={layerVisibility}
                                toggleLayerVisibility={toggleLayerVisibility}
                                activeLayer={activeLayer}
                                setActiveLayer={setActiveLayer}
                                setActiveEvent={setActiveEvent}
                                activeEvent={activeEvent}
                                setActiveEventDetail={setActiveEventDetail}
                                activeEventEdit={activeEventEdit} />
                            <div>
                                <h2>Reflection</h2>
                                <form onSubmit={handleSubmitResponse}>
                                    <div className="form-row">
                                        <div className={'form-group col-12'}>
                                            <ReactQuill
                                                value={reflection}
                                                onChange={setReflection}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className={'form-group col-12'}>
                                            <button
                                                type={'submit'}
                                                className={'btn btn-primary'}>
                                                Submit response
                                            </button>
                                            <button onClick={handleReflectionSaveDraft}>
                                                Save draft
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </>)}
                    </div>
                )}
            </div>
        </>
    );
};

interface FacultySubPanelProps {
    responseData: ResponseData[];
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    responseLayers: Map<number, LayerData[]>;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
}

const FacultySubPanel: React.FC<FacultySubPanelProps> = ({
    responseData, createFeedback, updateFeedback, responseLayers,
    layerVisibility, toggleLayerVisibility, toggleResponseVisibility,
    activeLayer, setActiveLayer, activeEvent, setActiveEvent,
    setActiveEventDetail, activeEventEdit
}: FacultySubPanelProps) => {

    const [activeResponse, setActiveResponse] = useState<ResponseData | null>(null);
    const [activeResonseLayers, setActiveResponseLayers] =
        useState<Map<number, LayerData>>(new Map());
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        // Populate feedback
        if (activeResponse && activeResponse.feedback) {
            setFeedback(activeResponse.feedback.body ? activeResponse.feedback.body : '');
        }

        // Create a map of just the layers beloning to the active response
        if (activeResponse) {
            const layers = responseLayers.get(activeResponse.pk);
            if (layers) {
                setActiveResponseLayers(
                    layers.reduce((acc, val) => {
                        acc.set(val.pk, val);
                        return acc;
                    }, new Map<number, LayerData>())
                );
            }
        }
    }, [activeResponse]);

    // TODO fix spelling!
    const handleFeedbackSubmition = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeResponse && activeResponse.feedback) {
            if (activeResponse.feedback) {
                updateFeedback(
                    activeResponse.feedback.pk,
                    activeResponse.pk,
                    feedback
                );
            } else {
                createFeedback(
                    activeResponse.pk,
                    feedback
                );
            }
        }
    };

    const handleFeedbackCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setActiveResponse(null);
    };

    return (
        <div>
            {activeResponse && activeResonseLayers.size > 0 ? (<>
                <div>
                    <LayerSet
                        layers={activeResonseLayers}
                        activeLayer={activeLayer}
                        setActiveLayer={setActiveLayer}
                        setActiveEvent={setActiveEvent}
                        activeEvent={activeEvent}
                        setActiveEventDetail={setActiveEventDetail}
                        activeEventEdit={activeEventEdit} />
                </div>
                <div>
                    <h2>Reflection</h2>
                    <div dangerouslySetInnerHTML={{__html: activeResponse.reflection}}/>
                </div>
                <div>
                    <h2>Feedback</h2>
                    <form onSubmit={handleFeedbackSubmition}>
                        <div className="form-row">
                            <div className={'form-group col-12'}>
                                <ReactQuill
                                    value={feedback}
                                    onChange={setFeedback}/>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-12'}>
                                <button onClick={handleFeedbackCancel}>
                                    Cancel
                                </button>
                                <button
                                    type={'submit'}
                                    className={'btn btn-primary'}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </>) : (<>
                <div>There are {responseData.length} responses to this activity</div>
                <div>
                    {responseData.map((el) => {
                        const subAt = (new Date(el.submitted_at)).toLocaleString();
                        return (
                            <div className="row" key={el.pk}>
                                <div className="col-1">
                                    <button onClick={
                                        (): void => {toggleResponseVisibility(el.pk);}}>
                                        <FontAwesomeIcon icon={faEye}/>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <div>
                                        {el.owners.join(', ')}
                                    </div>
                                    <div>
                                        Submitted: {subAt}
                                    </div>
                                </div>
                                <div className="col-1">
                                    <button onClick={(): void => {setActiveResponse(el);}}>
                                        <FontAwesomeIcon icon={faLayerGroup}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>)}
        </div>
    );
};
