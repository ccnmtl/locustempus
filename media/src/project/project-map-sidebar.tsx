import React, { useState, ReactElement } from 'react';
import { LayerProps } from './layer';
import { LayerEventData, LayerEventDatum } from './project-map';
import { Position } from '@deck.gl/core/utils/positions';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, DefaultPanel,
    ProjectCreateEditPanel
} from './project-map-sidebar-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    baseMap: string;
    setBaseMap(baseMap: string): void;
    newProjectFlag: boolean;
    updateProject(title: string, description: string, baseMap: string): void;
    deleteProject(): void;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
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

export const ProjectMapSidebar: React.FC<ProjectMapSidebarProps> = (
    {
        title, description, baseMap, setBaseMap, newProjectFlag, updateProject,
        deleteProject, layers, events, activeLayer, setActiveLayer, addLayer,
        deleteLayer, updateLayer, setLayerVisibility, showAddEventForm,
        setShowAddEventForm, activePosition, addEvent, clearActivePosition,
        activeEvent, setActiveEvent, activeEventDetail, setActiveEventDetail,
        activeEventEdit, setActiveEventEdit, deleteEvent, updateEvent
    }: ProjectMapSidebarProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);
    const [showProjectMenu, setShowProjectMenu] = useState<boolean>(false);
    const [showProjectEditPanel, setShowProjectEditPanel] =
        useState<boolean>(false);
    const [isNewProject, setIsNewProject] = useState<boolean>(newProjectFlag);

    // Clear the query string param
    // This is done in this component so it could make use of the isNewProject
    // state var. Otherwise replaceState would continue to be called with each
    // render
    if (isNewProject) {
        window.history.replaceState({}, '', window.location.pathname);
    }

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
                updateEvent={updateEvent}/>
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
            setActiveEventEdit={setActiveEventEdit}/>
    };

    return (
        <div id='project-map-sidebar'>
            <div>
                <h2>{title}</h2>
                <button onClick={toggleProjectMenu}>
                    <FontAwesomeIcon icon={faEllipsisV}/>
                </button>
            </div>
            {showProjectMenu && (
                <div>
                    <ul>
                        <li><a onClick={handleEdit}>
                            Edit project</a>
                        </li>
                        <li><a onClick={handleDelete}>Delete project</a></li>
                    </ul>
                </div>
            )}
            {PANEL[panelState]}
        </div>
    );
};
