import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { LayerProps } from './layer';
import { LayerEventData, LayerEventDatum, ActivityData } from './project-map';
import { Position } from '@deck.gl/core/utils/positions';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, DefaultPanel,
    ProjectCreateEditPanel
} from './project-map-pane-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

export interface ProjectMapPaneProps {
    title: string;
    description: string;
    baseMap: string;
    setBaseMap(baseMap: string): void;
    newProjectFlag: boolean;
    updateProject(title: string, description: string, baseMap: string): void;
    deleteProject(): void;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    activity: ActivityData | null;
    createActivity(instructions: string): void;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    addLayer(): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    setLayerVisibility(pk: number): void;
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): void;
    activePosition: Position | null;
    addEvent(label: string,
             description: string, lat: number, lng: number): void;
    deleteEvent(pk: number, layerPk: number): void;
    clearActivePosition(): void;
    activeEvent: LayerEventDatum | null;
    setActiveEvent(d: LayerEventDatum): void;
    activeEventDetail: LayerEventDatum | null;
    setActiveEventDetail(d: LayerEventDatum): void;
    activeEventEdit: LayerEventDatum | null;
    setActiveEventEdit(d: LayerEventDatum): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number, layerPk: number): void;
}

export const ProjectMapPane: React.FC<ProjectMapPaneProps> = (
    {
        title, description, baseMap, setBaseMap, newProjectFlag, updateProject,
        deleteProject, layers, events, activity, createActivity,
        updateActivity, deleteActivity, activeLayer, setActiveLayer, addLayer,
        deleteLayer, updateLayer, setLayerVisibility, showAddEventForm,
        setShowAddEventForm, activePosition, addEvent, clearActivePosition,
        activeEvent, setActiveEvent, activeEventDetail, setActiveEventDetail,
        activeEventEdit, setActiveEventEdit, deleteEvent, updateEvent
    }: ProjectMapPaneProps) => {

    const projectPaneHeader = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<number>(0);
    const [showProjectMenu, setShowProjectMenu] = useState<boolean>(false);
    const [showProjectEditPanel, setShowProjectEditPanel] =
        useState<boolean>(false);
    const [isNewProject, setIsNewProject] = useState<boolean>(newProjectFlag);
    const [projectPaneHeaderHeight, setProjectPaneHeaderHeight] = useState<number>(0);

    // Clear the query string param
    // This is done in this component so it could make use of the isNewProject
    // state var. Otherwise replaceState would continue to be called with each
    // render
    if (isNewProject) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    useEffect(() => {
        if (projectPaneHeader.current) {
            setProjectPaneHeaderHeight(projectPaneHeader.current.clientHeight);
        }
        const resize = (): void  => {
            if (projectPaneHeader.current) {
                setProjectPaneHeaderHeight(projectPaneHeader.current.clientHeight);
            }
        };
        /* eslint-disable-next-line scanjs-rules/call_addEventListener */
        window.addEventListener('resize', resize);
        return (): void => window.removeEventListener('resize', resize);
    });

    const toggleProjectMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowProjectMenu((prev) => {return !prev;});
    };

    const showDefaultMenu = (): void => {
        setActiveTab(0);
        setShowProjectMenu(false);
        setShowProjectEditPanel(false);
    };

    const handleEdit = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setShowProjectEditPanel(true);
        setShowProjectMenu(false);
    };

    const handleDelete = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        deleteProject();
    };

    const DEFAULT_PANEL = 4;
    const PROJECT_EDIT_PANEL = 3;
    const EVENT_EDIT_PANEL = 2;
    const EVENT_DETAIL_PANEL = 1;
    const EVENT_ADD_PANEL = 0;

    let panelState = DEFAULT_PANEL;
    if (showProjectEditPanel || isNewProject) {
        panelState = PROJECT_EDIT_PANEL;
    } else if (activeEventEdit) {
        panelState = EVENT_EDIT_PANEL;
    } else if (activeEventDetail) {
        panelState = EVENT_DETAIL_PANEL;
    } else if (showAddEventForm) {
        panelState = EVENT_ADD_PANEL;
    }


    const PANEL: {[key: number]: ReactElement} = {
        0: <EventAddPanel
            showAddEventForm={showAddEventForm}
            setShowAddEventForm={setShowAddEventForm}
            activePosition={activePosition}
            addEvent={addEvent}
            clearActivePosition={clearActivePosition}
            setActiveTab={setActiveTab}/>,
        1: <EventDetailPanel
            activeLayer={activeLayer}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            deleteEvent={deleteEvent}/>,
        2: <> {activeEventEdit && (
            <EventEditPanel
                activeLayer={activeLayer}
                activeEventEdit={activeEventEdit}
                setActiveEventEdit={setActiveEventEdit}
                updateEvent={updateEvent}
                paneHeaderHeight={projectPaneHeaderHeight}/>
        )} </>,
        3: <ProjectCreateEditPanel
            isNewProject={isNewProject}
            setIsNewProject={setIsNewProject}
            projectTitle={title}
            projectDescription={description}
            projectBaseMap={baseMap}
            setBaseMap={setBaseMap}
            updateProject={updateProject}
            deleteProject={deleteProject}
            showDefaultMenu={showDefaultMenu}/>,
        4: <DefaultPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLayer={addLayer}
            description={description}
            layers={layers}
            events={events}
            activity={activity}
            createActivity={createActivity}
            updateActivity={updateActivity}
            deleteActivity={deleteActivity}
            deleteLayer={deleteLayer}
            updateLayer={updateLayer}
            setLayerVisibility={setLayerVisibility}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            activeEvent={activeEvent}
            setActiveEvent={setActiveEvent}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            paneHeaderHeight={projectPaneHeaderHeight}/>
    };

    return (
        <div id='project-map-pane' className='widget-pane'>
            <div className='widget-pane-content project-pane' id='pane-scroll-y'>
                <header ref={projectPaneHeader} className='project-pane__header'>
                    <h1>{title}</h1>
                    <div className={'lt-menu-overflow trailing'}>
                        <button onClick={toggleProjectMenu}
                            className={'lt-icon-button lt-icon-button--transparent'}
                            aria-label={showProjectMenu ?
                                'Hide more actions' : 'Show more actions'}>
                            <span
                                className={'lt-icons lt-icon-button__icon'}
                                aria-hidden='true'>
                                <FontAwesomeIcon icon={faEllipsisV}/>
                            </span>
                        </button>
                        {showProjectMenu && (
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
                                                Edit project
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
                                                Delete project
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </header>
                <div className='pane-content'>
                    {PANEL[panelState]}
                </div>
            </div>
        </div>
    );
};
