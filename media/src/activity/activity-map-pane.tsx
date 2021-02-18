import React, { useState, ReactElement, useEffect, useRef } from 'react';
import {
    ActivityData, ResponseData, ResponseStatus
} from './activity-map';
import { LayerData, EventData, MediaObject } from '../project-activity-components/common';
import {OverflowMenu} from '../project-activity-components/overflow-menu';
import { Position } from '@deck.gl/core/utils/positions';
import { DefaultPanel } from './activity-map-pane-panels';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, ProjectCreateEditPanel
} from '../project-activity-components/panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCaretLeft, faCaretRight, faEllipsisV, faTrashAlt, faPencilAlt
} from '@fortawesome/free-solid-svg-icons';

export interface ActivityMapPaneProps {
    title: string;
    description: string;
    baseMap: string;
    setBaseMap(baseMap: string): void;
    updateProject(title: string, description: string, baseMap: string): void;
    deleteProject(): void;
    isFaculty: boolean;
    layers: Map<number, LayerData>;
    projectLayers:  Map<number, LayerData>;
    activity: ActivityData | null;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    addLayer(): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
    isProjectLayer(pk: number): boolean;
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): void;
    activePosition: Position | null;
    addEvent(label: string,
             description: string, lat: number, lng: number, mediaObj: MediaObject | null): void;
    deleteEvent(pk: number, layerPk: number): void;
    clearActivePosition(): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData): void;
    updateEvent(
        label: string, description: string, lat: number, lng: number, pk: number,
        layerPk: number, mediaObj: MediaObject | null): void;
    responseData: ResponseData[];
    updateResponse(reflection?: string, status?: ResponseStatus): void;
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    responseLayers: Map<number, LayerData[]>;
}

export const ActivityMapPane: React.FC<ActivityMapPaneProps> = (
    {
        title, description, isFaculty, baseMap, setBaseMap, updateProject,
        deleteProject, layers, activity, updateActivity, deleteActivity,
        activeLayer, setActiveLayer, addLayer, deleteLayer,
        updateLayer,layerVisibility, toggleLayerVisibility,
        toggleResponseVisibility, isProjectLayer, showAddEventForm,
        setShowAddEventForm, activePosition, addEvent, clearActivePosition,
        activeEvent, setActiveEvent, activeEventDetail, setActiveEventDetail,
        activeEventEdit, setActiveEventEdit, deleteEvent, updateEvent,
        projectLayers, responseData, updateResponse, createFeedback,
        updateFeedback, responseLayers
    }: ActivityMapPaneProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);

    const projectPaneHeader = useRef<HTMLDivElement>(null);
    const [projectPaneHeaderHeight, setProjectPaneHeaderHeight] = useState<number>(0);
    const [showPane, setShowPane] = useState<boolean>(true);
    const [showProjectEditPanel, setShowProjectEditPanel] =
        useState<boolean>(false);

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

    const handleEdit = (): void => {
        setShowProjectEditPanel(true);
    };

    const showDefaultMenu = (): void => {
        setActiveTab(0);
    };

    const handleTogglePane = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowPane(!showPane);
    };

    let editMenuVis = false;
    if ((isFaculty && activeLayer && isProjectLayer(activeLayer)) ||
        (!isFaculty && activeLayer && !isProjectLayer(activeLayer))) {
        editMenuVis = true;
    }


    const DEFAULT_PANEL = 4;
    const PROJECT_EDIT_PANEL = 3;
    const EVENT_EDIT_PANEL = 2;
    const EVENT_DETAIL_PANEL = 1;
    const EVENT_ADD_PANEL = 0;

    let panelState = DEFAULT_PANEL;
    if (showProjectEditPanel) {
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
            setActiveTab={setActiveTab}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        1: <EventDetailPanel
            activeLayer={activeLayer}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            deleteEvent={deleteEvent}
            showEditMenu={editMenuVis}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        2: <> {activeEventEdit && (
            <EventEditPanel
                activeLayer={activeLayer}
                activeEventEdit={activeEventEdit}
                setActiveEventEdit={setActiveEventEdit}
                updateEvent={updateEvent}
                paneHeaderHeight={projectPaneHeaderHeight}/>
        )} </>,
        3: <ProjectCreateEditPanel
            isNewProject={false}
            projectTitle={title}
            projectDescription={description}
            projectBaseMap={baseMap}
            setBaseMap={setBaseMap}
            updateProject={updateProject}
            deleteProject={deleteProject}
            showDefaultMenu={showDefaultMenu}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        4: <DefaultPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLayer={addLayer}
            description={description}
            layers={layers}
            projectLayers={projectLayers}
            activity={activity}
            updateActivity={updateActivity}
            deleteActivity={deleteActivity}
            deleteLayer={deleteLayer}
            updateLayer={updateLayer}
            toggleLayerVisibility={toggleLayerVisibility}
            toggleResponseVisibility={toggleResponseVisibility}
            layerVisibility={layerVisibility}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            activeEvent={activeEvent}
            setActiveEvent={setActiveEvent}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            responseData={responseData}
            updateResponse={updateResponse}
            createFeedback={createFeedback}
            updateFeedback={updateFeedback}
            isFaculty={isFaculty}
            responseLayers={responseLayers}
            paneHeaderHeight={projectPaneHeaderHeight}/>
    };

    return (
        <div id='project-map-pane'
            className={'widget-pane widget-pane-' + (showPane ? 'expanded' : 'collapsed') }>
            <div className='widget-pane-content project-pane' id='pane-scroll-y'>
                <header ref={projectPaneHeader} className='project-pane__header'>
                    <h1>{title}</h1>
                    {isFaculty && (
                        <OverflowMenu items={[
                            {
                                handler: handleEdit,
                                icon: <FontAwesomeIcon icon={faPencilAlt}/>,
                                label: 'Edit project'
                            },
                            {
                                handler: deleteProject,
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete project'
                            }
                        ]}/>
                    )}
                </header>
                <div className='pane-content'>
                    {PANEL[panelState]}
                </div>
            </div>
            <div className={'widget-pane-toggle'}>
                <button
                    type="button"
                    className={'lt-button-pane-toggle'}
                    aria-label="Collapse layers panel"
                    onClick={handleTogglePane}>
                    <span
                        className={'lt-button-pane-toggle__icon'}
                        aria-hidden='true'>
                        {showPane ? (
                            <FontAwesomeIcon icon={faCaretLeft} size='lg'/>
                        ) : (
                            <FontAwesomeIcon icon={faCaretRight} size='lg'/>
                        )}
                    </span>
                    <span className={'txt-pane-toggle'}>
                        {showPane ? 'Close pane' : 'Expand pane'}
                    </span>
                </button>
            </div>
        </div>
    );
};
