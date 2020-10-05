import React, { useState, useEffect } from 'react';
import { Layer, LayerProps } from './layer';
import {
    LayerEventData, LayerEventDatum, ActivityData,
    BASE_MAPS, BASE_MAP_IMAGES } from './project-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLayerGroup, faArrowLeft, faEllipsisV, faPencilAlt, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { Position } from '@deck.gl/core/utils/positions';
import ReactQuill from 'react-quill';


interface ProjectCreateEditPanelProps {
    isNewProject: boolean;
    setIsNewProject(val: boolean): void;
    projectTitle: string;
    projectDescription: string;
    projectBaseMap: string;
    setBaseMap(baseMap: string): void;
    updateProject(title: string, description: string, baseMap: string): void;
    showDefaultMenu(): void;
    deleteProject(): void;
}

export const ProjectCreateEditPanel: React.FC<ProjectCreateEditPanelProps> = (
    {
        isNewProject, setIsNewProject, projectTitle, projectDescription,
        projectBaseMap, setBaseMap, updateProject, showDefaultMenu,
        deleteProject
    }: ProjectCreateEditPanelProps) => {

    const [title, setTitle] = useState<string>(projectTitle);
    const [description, setDescription] = useState<string>(projectDescription);
    const [showBaseMapMenu, setShowBaseMapMenu] = useState<boolean>(false);

    useEffect(() => {
        setTitle(projectTitle);
        setDescription(projectDescription);
    }, [projectTitle, projectDescription]);

    const handleTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setTitle(e.target.value);
    };

    const handleBaseMap = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setBaseMap(e.target.value);
    };

    const toggleBaseMapMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowBaseMapMenu((prev) => {return !prev;});
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateProject(title, description, projectBaseMap);
        setIsNewProject(false);
        showDefaultMenu();
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        showDefaultMenu();
    };

    const handleNewProjectCancel = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        deleteProject();
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: 98 }}>
                <h2>{isNewProject ? 'Create Project' : 'Edit Project'}</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Title</label>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={title}
                            autoFocus={true}
                            onChange={handleTitle}/>
                    </div>
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            About this project
                        </label>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    { showBaseMapMenu ? (
                        <div className={'form-group pane-form-group base-map-expanded'}>
                            <button onClick={toggleBaseMapMenu}
                                className={'btn btn__accordion'}>
                                <span className='menu-icon'>
                                    <FontAwesomeIcon icon={faCaretDown}/>
                                </span>
                                Base Map: {BASE_MAPS.get(projectBaseMap)}
                            </button>
                            <fieldset>
                                <ul className='d-flex flex-row flex-wrap md-radio basemap__listview' role='radiogroup'> {/* eslint-disable-line max-len */}
                                    {[...BASE_MAPS.keys()].map((val, idx) => {
                                        return (
                                            <li className='basemap__item' key={idx}>
                                                <input
                                                    name="basemapselection"
                                                    id={'base-map-' + idx}
                                                    type={'radio'}
                                                    value={val}
                                                    onChange={handleBaseMap}
                                                    checked={
                                                        val === projectBaseMap}
                                                />
                                                <label htmlFor={'base-map-' + idx}
                                                    className={'basemap__label'}>
                                                    <span className='basemap__name'>{BASE_MAPS.get(val)}</span> {/* eslint-disable-line max-len */}
                                                    <img
                                                        src={BASE_MAP_IMAGES.get(val)}
                                                        alt='Thumbnail for {BASE_MAPS.get(val)}'
                                                        className="img-fluid basemap__thumbnail" /> {/* eslint-disable-line max-len */}
                                                </label>
                                            </li>
                                        );})
                                    }
                                </ul>
                            </fieldset>
                        </div>
                    ) : (
                        <div className={'form-group pane-form-group base-map-collapsed'}>
                            <button onClick={toggleBaseMapMenu}
                                className={'btn btn__accordion'}>
                                <span className='menu-icon'>
                                    <FontAwesomeIcon
                                        icon={faCaretRight}/>
                                </span>
                                Base Map: {BASE_MAPS.get(projectBaseMap)}
                            </button>
                        </div>
                    ) }
                    <div className="form-row">
                        <div className={'form-group col-3'}>
                        </div>
                        <div className={'form-group col-9'}>
                            {isNewProject ? (
                                <>
                                    <button
                                        type={'button'}
                                        onClick={handleNewProjectCancel}
                                        className={'btn btn-danger'}>
                                        Cancel
                                    </button>
                                    <button
                                        type={'submit'}
                                        className={'btn btn-primary'}>
                                        Create project
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type={'button'}
                                        onClick={handleCancel}
                                        className={'btn btn-danger'}>
                                        Cancel
                                    </button>
                                    <button
                                        type={'submit'}
                                        className={'btn btn-primary'}>
                                        Save
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};


interface EventEditPanelProps {
    activeLayer: number | null;
    activeEventEdit: LayerEventDatum;
    setActiveEventEdit(d: LayerEventDatum | null): void;
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
    addEvent(
        label: string, description: string, lat: number, lng: number): void;
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
                description, activePosition[0], activePosition[1]);
            setShowAddEventForm(false);
            setActiveTab(1);
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
    activeEventDetail: LayerEventDatum | null;
    setActiveEventDetail(d: LayerEventDatum | null): void;
    activeEventEdit: LayerEventDatum | null;
    setActiveEventEdit(d: LayerEventDatum | null): void;
    deleteEvent(pk: number, layerPk: number): void;
}

export const EventDetailPanel: React.FC<EventDetailPanelProps> = (
    {
        activeLayer, activeEventDetail, setActiveEventDetail,
        setActiveEventEdit, deleteEvent
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
                <button onClick={handleMenuToggle}>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </button>
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

interface ActivityProps {
    activity: ActivityData | null;
    createActivity(instructions: string): void;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
}

const Activity: React.FC<ActivityProps> = (
    {activity, createActivity, updateActivity, deleteActivity}: ActivityProps) => {

    const [instructions, setInstructions] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);

    const handleCreateActivity = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        instructions && createActivity(instructions);
    };

    const toggleMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowMenu((prev) => !prev);
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        activity && instructions && updateActivity(instructions, activity.pk);
        setShowEditForm(false);
    };

    const handleDelete  = (e: React.MouseEvent): void => {
        e.preventDefault();
        activity && deleteActivity(activity.pk);
        setShowEditForm(false);
        setShowCreateForm(false);
        setShowMenu(false);
    };

    useEffect(() => {
        setInstructions(activity ? activity.instructions : '');
    }, [activity]);

    if (activity) {
        return (
            <>
                <div>
                    <h2>Activity</h2>
                    <div className='overflow-menu'>
                        <button onClick={toggleMenu}
                            className='overflow-toggle'>
                            <FontAwesomeIcon icon={faEllipsisV}/>
                        </button>
                        {showMenu && (
                            <ul className='overflow-menu-show'>
                                <li>
                                    <a onClick={
                                        (): void => {setShowMenu(false); setShowEditForm(true);}}>
                                        <span className='overflow-icon'>
                                            <FontAwesomeIcon icon={faPencilAlt}/>
                                        </span>
                                        Edit activity
                                    </a>
                                </li>
                                <li>
                                    <a onClick={handleDelete}>
                                        <span className='overflow-icon'>
                                            <FontAwesomeIcon icon={faTrashAlt}/>
                                        </span>
                                        Delete activity
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                {showEditForm ? (
                    <form onSubmit={handleEdit}>
                        <div className="form-group">
                            <label htmlFor={'activity-form__instructions'}>
                            </label>
                            <ReactQuill
                                value={instructions || ''}
                                onChange={setInstructions}/>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-3'}>
                            </div>
                            <div className={'form-group col-9'}>
                                <button
                                    type={'button'}
                                    onClick={(): void => setShowEditForm(false)}
                                    className={'btn btn-danger'}>
                                    Cancel
                                </button>
                                <button type={'submit'} className={'btn btn-primary'}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div dangerouslySetInnerHTML={{__html: activity.instructions}}/>
                )}
            </>
        );
    } else {
        return (
            <>
                <h2>Create Activity</h2>
                {showCreateForm ? (
                    <form onSubmit={handleCreateActivity}>
                        <div className="form-group">
                            <label htmlFor={'activity-form__instructions'}>
                            </label>
                            <ReactQuill
                                value={instructions || ''}
                                onChange={setInstructions}/>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-3'}>
                            </div>
                            <div className={'form-group col-9'}>
                                <button
                                    type={'button'}
                                    onClick={(): void => setShowCreateForm(false)}
                                    className={'btn btn-danger'}>
                                    Cancel
                                </button>
                                <button type={'submit'} className={'btn btn-primary'}>
                                    Create
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <button
                        type={'submit'}
                        className={'btn btn-primary'}
                        onClick={(): void => setShowCreateForm(true)}>
                        Create Activity
                    </button>
                )}
            </>
        );
    }
};

interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(idx: number): void;
    addLayer(): void;
    description: string;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    activity: ActivityData | null;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    createActivity(instructions: string): void;
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

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, description, layers, events,
        activity, createActivity, updateActivity, deleteActivity, deleteLayer,
        updateLayer, setLayerVisibility, activeLayer, setActiveLayer,
        activeEvent, setActiveEvent, setActiveEventDetail, activeEventEdit
    }: DefaultPanelProps) => {

    const handleSetActiveTab = (
        e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleCreateLayer = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        addLayer();
    };

    const OVERVIEW = 0;
    const BASE = 1;

    return (
        <>
            <ul className='nav nav-tabs pane-content-tabs' style={{ top: 98 }}>
                {['Overview', 'Base'].map((el, idx) => {
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
                {activeTab === OVERVIEW && (
                    <div className='fade-load'>
                        <div>
                            <h2>About This Project</h2>
                            <div dangerouslySetInnerHTML={{__html: description}}/>
                        </div>
                        <div>
                            <h2>Share This Project</h2>
                        </div>
                        <div>
                            <h2>Clone This Project</h2>
                        </div>
                        <div>
                            <Activity activity={activity}
                                createActivity={createActivity}
                                updateActivity={updateActivity}
                                deleteActivity={deleteActivity}/>
                        </div>
                    </div>
                )}
                {activeTab === BASE && (
                    <>
                        <div className='fade-load'>
                            <form onSubmit={handleCreateLayer}>
                                <button type='submit'>
                                    <FontAwesomeIcon icon={faLayerGroup}/>Add Layer
                                </button>
                            </form>
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
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

