import React, { useState, useEffect, useRef, ReactElement } from 'react';
import {
    ActivityData, EventData, LayerData, MediaObject
} from '../project-activity-components/common';
import {OverflowMenu} from '../project-activity-components/overflow-menu';
import { Position } from 'deck.gl';
import { DefaultPanel } from './project-map-pane-panels';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, ProjectCreateEditPanel
} from '../project-activity-components/panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt, faPencilAlt, faCaretLeft, faCaretRight
} from '@fortawesome/free-solid-svg-icons';


export interface ProjectMapPaneProps {
    title: string;
    description: string;
    baseMap: string;
    setBaseMap(baseMap: string): void;
    isNewProject: boolean;
    setIsNewProject(flag: boolean): void;
    updateProject(title: string, description: string, baseMap: string): void;
    deleteProject(): void;
    layers: Map<number, LayerData>;
    layerVisibility: Map<number, boolean>;
    activity: ActivityData | null;
    createActivity(instructions: string): void;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    addLayer(): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string, color: string): void;
    toggleLayerVisibility(pk: number): void;
    showAddEventForm: boolean;
    displayAddEventForm(show: boolean, mockData?: EventData): void;
    activePosition: Position | null;
    addEvent(label: string, datetime: string | null,
             description: string, lat: number, lng: number, mediaObj: MediaObject | null): void;
    deleteEvent(pk: number, layerPk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData): void;
    updateEvent(label: string, datetime: string | null, description: string, lat: number,
        lng: number, pk: number, layerPk: number, mediaObj: MediaObject | null): void;
    activeTab: number;
    setActiveTab(tab: number): void;
}

export const ProjectMapPane = React.forwardRef<HTMLDivElement, ProjectMapPaneProps>((
    {
        title, description, baseMap, setBaseMap, isNewProject, setIsNewProject,
        updateProject, deleteProject, layers, layerVisibility, activity,
        createActivity, updateActivity, deleteActivity, activeLayer,
        setActiveLayer, addLayer, deleteLayer, updateLayer,
        toggleLayerVisibility, showAddEventForm, displayAddEventForm,
        activePosition, addEvent, activeEvent, setActiveEvent,
        activeEventDetail, setActiveEventDetail, activeEventEdit,
        setActiveEventEdit, deleteEvent, updateEvent, activeTab, setActiveTab
    }: ProjectMapPaneProps, forwardedRef) => {

    const projectPaneHeader = useRef<HTMLDivElement>(null);

    const [showProjectEditPanel, setShowProjectEditPanel] =
        useState<boolean>(false);
    const [projectPaneHeaderHeight, setProjectPaneHeaderHeight] = useState<number>(0);
    const [showPane, setShowPane] = useState<boolean>(true);
    const [activeLayerTitle, setActiveLayerTitle] = useState<string>('');

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
        window.addEventListener('resize', resize);
        return (): void => window.removeEventListener('resize', resize);
    });

    useEffect(() => {
        if (activeLayer) {
            if (layers.has(activeLayer)) {
                const l = layers.get(activeLayer);
                if (l) {
                    setActiveLayerTitle(l.title);
                }
            }
        }
    }, [activeLayer]);

    const showDefaultMenu = (): void => {
        setActiveTab(0);
        setShowProjectEditPanel(false);
    };

    const handleEdit = (): void => {
        setShowProjectEditPanel(true);
    };

    const handleTogglePane = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowPane(!showPane);
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
            displayAddEventForm={displayAddEventForm}
            activePosition={activePosition}
            addEvent={addEvent}
            setActiveTab={setActiveTab}
            activeLayer={activeLayer}
            layers={layers}
            returnTab={1}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        1: <EventDetailPanel
            activeLayer={activeLayer}
            activeLayerTitle={activeLayerTitle}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            deleteEvent={deleteEvent}
            showEditMenu={true}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        2: <> {activeEventEdit && (
            <EventEditPanel
                layers={layers}
                activeLayer={activeLayer}
                returnTab={1}
                setActiveTab={setActiveTab}
                setActiveEventDetail={setActiveEventDetail}
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
            showDefaultMenu={showDefaultMenu}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        4: <DefaultPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLayer={addLayer}
            description={description}
            layers={layers}
            layerVisibility={layerVisibility}
            activity={activity}
            createActivity={createActivity}
            updateActivity={updateActivity}
            deleteActivity={deleteActivity}
            deleteLayer={deleteLayer}
            updateLayer={updateLayer}
            toggleLayerVisibility={toggleLayerVisibility}
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
        // Collapsible pane div begin here
        <div id='project-map-pane'
            ref={forwardedRef}
            className={'widget-pane widget-pane-' + (showPane ? 'expanded' : 'collapsed') }>
            <div className='widget-pane-content project-pane' id='pane-scroll-y'>
                <header ref={projectPaneHeader} className='project-pane__header'
                    data-cy="project-header">
                    <h1 data-cy="project-title">{title}</h1>
                    <OverflowMenu items={[
                        {
                            handler: handleEdit,
                            icon: <FontAwesomeIcon icon={faPencilAlt}/>,
                            label: 'Edit project',
                        },
                        {
                            handler: deleteProject,
                            classCustom: 'caution',
                            icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                            label: 'Delete project',
                            confirmationTitle: 'Delete project?',
                            confirmationText:
                                'Are you sure that you want to delete this project? ' +
                                'All student responses will be lost.',
                            confirmationButtonText: 'Delete',
                        }
                    ]}/>
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
});

ProjectMapPane.displayName = 'ProjectMapPane';
