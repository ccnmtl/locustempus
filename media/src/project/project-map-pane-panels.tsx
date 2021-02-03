import React, { useState, useEffect } from 'react';
import { MediaEditor } from '../project-activity-components/layers/media-editor';
import { ActivityData } from './project-map';
import { BASE_MAPS, BASE_MAP_IMAGES } from '../project-activity-components/common';
import { LayerData, EventData, LayerSet } from '../project-activity-components/layers/layer-set';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faEllipsisV, faPencilAlt, faTrashAlt,
    faCaretRight, faCaretDown
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
    paneHeaderHeight: number;
}

export const ProjectCreateEditPanel: React.FC<ProjectCreateEditPanelProps> = (
    {
        isNewProject, setIsNewProject, projectTitle, projectDescription,
        projectBaseMap, setBaseMap, updateProject, showDefaultMenu,
        deleteProject, paneHeaderHeight
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
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
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
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            About this project
                        </label>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'pane-form-divider'} />
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
    activeEventEdit: EventData;
    setActiveEventEdit(d: EventData | null): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number,
                layerPk: number, mediaUrl: string | null): void;
    paneHeaderHeight: number;
}

export const EventEditPanel: React.FC<EventEditPanelProps> = (
    {
        activeEventEdit, setActiveEventEdit, updateEvent, paneHeaderHeight
    }: EventEditPanelProps) => {

    const [
        eventName, setEventName] = useState<string>(activeEventEdit.label);
    const [
        description, setDescription
    ] = useState<string>(activeEventEdit.description);
    const [
        datetime, setDatetime
    ] = useState<string>(activeEventEdit.datetime || '');

    const [fileS3Url, setFileS3Url] = useState<string | null>(null);

    useEffect(() => {
        if (activeEventEdit.media.length > 0) {
            setFileS3Url(activeEventEdit.media[0].url);
        }
    }, [activeEventEdit]);

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateEvent(
            eventName, description, activeEventEdit.location.lng_lat[1],
            activeEventEdit.location.lng_lat[0],
            activeEventEdit.pk, activeEventEdit.layer, fileS3Url);
        setActiveEventEdit(null);
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventEdit(null);
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <h2>Edit Event Marker</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={eventName}
                            autoFocus={true}
                            onChange={handleName} />
                    </div>
                    <div className={'pane-form-divider'} />

                    {/* Edit image form */}
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__image'}>Image</label>
                        <MediaEditor fileS3Url={fileS3Url} setFileS3Url={setFileS3Url} />
                    </div>

                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__date'}>
                            Date
                        </label>
                        <input
                            className={'form-control'}
                            type={'datetime-local'}
                            id={'form-field__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
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
        </>
    );
};


interface EventAddPanelProps {
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): void;
    activePosition: Position | null;
    addEvent(
        label: string, description: string, lat: number, lng: number,
        mediaUrl: string | null): void;
    clearActivePosition(): void;
    setActiveTab(val: number): void;
    paneHeaderHeight: number;
}

export const EventAddPanel: React.FC<EventAddPanelProps> = (
    { setShowAddEventForm, activePosition, addEvent,
        clearActivePosition, setActiveTab, paneHeaderHeight
    }: EventAddPanelProps) => {

    const [eventName, setEventName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [fileS3Url, setFileS3Url] = useState<string | null>(null);

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (activePosition) {
            addEvent(
                eventName === '' ? 'Untitled Marker' : eventName,
                description, activePosition[0], activePosition[1], fileS3Url);
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
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <h2>Add an Event</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={eventName}
                            placeholder={'Untitled Event'}
                            autoFocus={true}
                            onChange={handleName} />
                    </div>
                    <div className={'pane-form-divider'} />
                    {/* Add image form */}
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__image'}>Image</label>
                        <MediaEditor fileS3Url={fileS3Url} setFileS3Url={setFileS3Url} />
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
                            id={'form-field__description'}
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__date'}>
                            Date
                        </label>
                        <input
                            className={'form-control'}
                            type={'datetime-local'}
                            id={'form-field__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
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
        </>
    );
};

interface EventDetailPanelProps {
    activeLayer: number | null;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData | null): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData | null): void;
    deleteEvent(pk: number, layerPk: number): void;
    paneHeaderHeight: number;
}

export const EventDetailPanel: React.FC<EventDetailPanelProps> = (
    {
        activeLayer, activeEventDetail, setActiveEventDetail,
        setActiveEventEdit, deleteEvent, paneHeaderHeight
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
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <button onClick={handleBack} className={'lt-button-back'}>
                    <span className={'lt-icons lt-button-back__icon'}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </span>
                    <span className={'lt-button-back__text'}>Back</span>
                </button>
            </div>
            <div className={'pane-content-body'}>
                <div className='lt-pane-section__header'>
                    <h2>{activeEventDetail && activeEventDetail.label}</h2>
                    <div className={'lt-menu-overflow trailing'}>
                        <button onClick={handleMenuToggle}
                            className={'lt-icon-button lt-icon-button--transparent'}
                            aria-label={showMenu ?
                                'Hide more actions' : 'Show more actions'}>
                            <span
                                className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon icon={faEllipsisV}/>
                            </span>
                        </button>
                        {showMenu && (
                            <div className={'lt-menu lt-menu-overflow--expand'}>
                                <ul className={'lt-list'} role='menu'>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        <a href='#' onClick={handleEdit}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faPencilAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Edit event marker
                                            </span>
                                        </a>
                                    </li>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        {/* TODO: Implement confirmation */}
                                        <a href='#' onClick={handleDelete}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faTrashAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Delete event marker
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {activeEventDetail && activeEventDetail.media.length > 0 && (
                    <figure className={'lt-pane-section__image'}>
                        <img src={activeEventDetail.media[0].url} />
                        <figcaption>Caption for the image</figcaption>
                    </figure>

                )}
                {activeEventDetail && (
                    <div className={'lt-pane-section__event-desc'} dangerouslySetInnerHTML={
                        {__html: activeEventDetail.description}}/>
                )}
            </div>
        </>
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

    const [instructions, setInstructions] = useState<string>('');
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);

    const handleCreateActivity = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        createActivity(instructions);
    };

    const toggleMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowMenu((prev) => !prev);
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        activity && updateActivity(instructions, activity.pk);
        setShowEditForm(false);
    };

    const handleDelete  = (e: React.MouseEvent): void => {
        e.preventDefault();
        activity && deleteActivity(activity.pk);
        setShowMenu(false);
    };

    useEffect(() => {
        activity && setInstructions(activity.instructions);
    }, [activity]);

    if (activity) {
        return (
            <>
                <div className='lt-pane-section__header'>
                    <h2>Activity</h2>
                    <div className={'lt-menu-overflow trailing'}>
                        <button onClick={toggleMenu}
                            className={'lt-icon-button lt-icon-button--transparent'}
                            aria-label={showMenu ?
                                'Hide more actions' : 'Show more actions'}>
                            <span
                                className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon icon={faEllipsisV}/>
                            </span>
                        </button>
                        {showMenu && (
                            <div className={'lt-menu lt-menu-overflow--expand'}>
                                <ul className={'lt-list'} role='menu'>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        <a href='#' onClick={(): void => {
                                            setShowMenu(false); setShowEditForm(true);}}
                                        className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faPencilAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Edit activity
                                            </span>
                                        </a>
                                    </li>
                                    <li className={'lt-list-item'} role='menuitem'>
                                        <a href='#' onClick={handleDelete}
                                            className={'lt-list-item__link'}>
                                            <span
                                                className={'lt-icons lt-list-item__icon'}
                                                aria-hidden='true'>
                                                <FontAwesomeIcon icon={faTrashAlt}/>
                                            </span>
                                            <span
                                                className={'lt-list-item__primary-text'}>
                                                Delete activity
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {showEditForm ? (
                    <form onSubmit={handleEdit}>
                        <div className="form-group">
                            <label htmlFor={'activity-form__instructions'}>
                            </label>
                            <ReactQuill
                                value={instructions}
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
                <h2>Activity</h2>
                {showCreateForm ? (
                    <form onSubmit={handleCreateActivity}>
                        <div className={'form-group pane-form-group'}>
                            <label htmlFor={'activity-form__instructions'}>
                                Instructions
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
                    <>
                        <p>There is no activity assigned on this project.</p>
                        <button
                            type={'submit'}
                            className={'btn btn-primary'}
                            onClick={(): void => setShowCreateForm(true)}>
                            Create Activity
                        </button>
                    </>
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
    layers: Map<number, LayerData>;
    layerVisibility: Map<number, boolean>;
    activity: ActivityData | null;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    createActivity(instructions: string): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    toggleLayerVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData): void;
    paneHeaderHeight: number;
}

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, description, layers, activity,
        createActivity, updateActivity, deleteActivity, deleteLayer,
        updateLayer, layerVisibility, toggleLayerVisibility, activeLayer,
        setActiveLayer, activeEvent, setActiveEvent, setActiveEventDetail,
        activeEventEdit, paneHeaderHeight
    }: DefaultPanelProps) => {

    const handleSetActiveTab = (
        e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const OVERVIEW = 0;
    const BASE = 1;

    return (
        <>
            <ul className='nav nav-tabs pane-content-tabs' style={{ top: paneHeaderHeight }}>
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
                        <section className={'lt-pane-section lt-pane-section__description'}>
                            {description ? (
                                <div dangerouslySetInnerHTML={{__html: description}}/>
                            ) : (
                                <div>
                                    There is no description for this project.
                                </div>
                            )}
                        </section>

                        <section>
                            <Activity activity={activity}
                                createActivity={createActivity}
                                updateActivity={updateActivity}
                                deleteActivity={deleteActivity}/>
                        </section>
                    </div>
                )}
                {activeTab === BASE && (
                    <LayerSet
                        layers={layers}
                        layerVisibility={layerVisibility}
                        addLayer={addLayer}
                        deleteLayer={deleteLayer}
                        updateLayer={updateLayer}
                        toggleLayerVisibility={toggleLayerVisibility}
                        activeLayer={activeLayer}
                        setActiveLayer={setActiveLayer}
                        activeEvent={activeEvent}
                        setActiveEvent={setActiveEvent}
                        setActiveEventDetail={setActiveEventDetail}
                        activeEventEdit={activeEventEdit}/>
                )}
            </div>
        </>
    );
};

