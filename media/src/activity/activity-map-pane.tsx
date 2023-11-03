import React, { useState, ReactElement, useEffect, useRef } from 'react';
import {ActivityData} from './activity-map';
import { LayerData, EventData, MediaObject, ResponseData, ResponseStatus
} from '../project-activity-components/common';
import {OverflowMenu} from '../project-activity-components/overflow-menu';
import { Position } from 'deck.gl';
import { DefaultPanel } from './activity-map-pane-panels';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, ProjectCreateEditPanel
} from '../project-activity-components/panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCaretLeft, faCaretRight, faTrashAlt, faPencilAlt
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
    fellowContributorLayers:  Map<number, LayerData>;
    activity: ActivityData | null;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    addLayer(): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string, color: string): void;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
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
    updateEvent(
        label: string, datetime: string | null, description: string, lat: number, lng: number,
        pk: number, layerPk: number, mediaObj: MediaObject | null): void;
    responseData: ResponseData[];
    updateResponse(reflection?: string, status?: ResponseStatus): void;
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    responseLayers: Map<number, LayerData[]>;
    activeTab: number;
    setActiveTab(tab: number): void;
    setAlert(alert: string | null): void;
    filterLayersByDate(range1: string, range2: string): void;
    resetContributorLayers(): Promise<void>
}

export const ActivityMapPane = React.forwardRef<HTMLDivElement, ActivityMapPaneProps>((
    {
        title, description, isFaculty, baseMap, setBaseMap, updateProject,
        deleteProject, layers, activity, updateActivity, deleteActivity,
        activeLayer, setActiveLayer, addLayer, deleteLayer,
        updateLayer,layerVisibility, toggleLayerVisibility,
        toggleResponseVisibility, showAddEventForm, displayAddEventForm,
        activePosition, addEvent, activeEvent, setActiveEvent,
        activeEventDetail, setActiveEventDetail, activeEventEdit,
        setActiveEventEdit, deleteEvent, updateEvent, projectLayers,
        fellowContributorLayers, responseData, updateResponse,
        createFeedback, updateFeedback, responseLayers, activeTab,
        setActiveTab, setAlert, filterLayersByDate, resetContributorLayers
    }: ActivityMapPaneProps, forwardedRef) => {

    const projectPaneHeader = useRef<HTMLDivElement>(null);
    const [projectPaneHeaderHeight, setProjectPaneHeaderHeight] = useState<number>(0);
    const [showPane, setShowPane] = useState<boolean>(true);
    const [showProjectEditPanel, setShowProjectEditPanel] =
        useState<boolean>(false);
    const [editMenuVis, setEditMenuVis] = useState<boolean>(false);
    const [activeLayerTitle, setActiveLayerTitle] = useState<string>('');
    const [activeResponse, setActiveResponse] = useState<ResponseData | null>(null);

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
            if (projectLayers && projectLayers.has(activeLayer)) {
                const l = projectLayers.get(activeLayer);
                if (l) {
                    setActiveLayerTitle(l.title);
                }
            } else if (layers.has(activeLayer)) {
                const l = layers.get(activeLayer);
                if (l) {
                    setActiveLayerTitle(l.title);
                }
            } else {
                outer:
                for (const respLayers of [...responseLayers.values()]) {
                    for (const layer of respLayers) {
                        if (layer.pk == activeLayer) {
                            setActiveLayerTitle(layer.title);
                            break outer;
                        }
                    }
                }
            }
        }
    }, [activeLayer]);

    const handleEdit = (): void => {
        setShowProjectEditPanel(true);
    };

    const showDefaultMenu = (): void => {
        setActiveTab(0);
        setShowProjectEditPanel(false);
    };

    const handleTogglePane = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowPane(!showPane);
    };

    const layersHaveEvent = (eventPk: number, layers: LayerData[]): boolean => {
        for (const layer of layers) {
            for (const event of layer.events) {
                if (event.pk == eventPk) {
                    return true;
                }
            }
        }
        return false;
    };

    useEffect(() => {
        // If user is faculty/author, can edit if event is a project event
        // If a student/contributor, can edit only if the event is in layerData
        // Checking is potentially expensive, and only needs to happen when the active
        // event changes, hence useEffect
        let canEdit = false;
        if (activeEvent) {
            if (isFaculty) {
                canEdit = layersHaveEvent(activeEvent.pk, [...projectLayers.values()]);
            } else {
                canEdit = layersHaveEvent(activeEvent.pk, [...layers.values()]);
            }
        }
        setEditMenuVis(canEdit);
    }, [activeEvent]);


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
            displayAddEventForm={displayAddEventForm}
            activePosition={activePosition}
            addEvent={addEvent}
            setActiveTab={setActiveTab}
            activeLayer={activeLayer}
            layers={layers}
            returnTab={isFaculty ? 1 : 2}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        1: <EventDetailPanel
            activeLayer={activeLayer}
            activeLayerTitle={activeLayerTitle}
            activeEventDetail={activeEventDetail}
            setActiveEventDetail={setActiveEventDetail}
            activeEventEdit={activeEventEdit}
            setActiveEventEdit={setActiveEventEdit}
            deleteEvent={deleteEvent}
            showEditMenu={editMenuVis}
            paneHeaderHeight={projectPaneHeaderHeight}/>,
        2: <> {activeEventEdit && (
            <EventEditPanel
                layers={layers}
                activeLayer={activeLayer}
                returnTab={isFaculty ? 1 : 2}
                setActiveTab={setActiveTab}
                setActiveEventDetail={setActiveEventDetail}
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
            fellowContributorLayers={fellowContributorLayers}
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
            activeResponse={activeResponse}
            setActiveResponse={setActiveResponse}
            responseData={responseData}
            updateResponse={updateResponse}
            createFeedback={createFeedback}
            updateFeedback={updateFeedback}
            isFaculty={isFaculty}
            responseLayers={responseLayers}
            paneHeaderHeight={projectPaneHeaderHeight}
            resetContributorLayers={resetContributorLayers}
            filterLayersByDate={filterLayersByDate}
            setAlert={setAlert}/>
    };

    return (
        <div id='project-map-pane'
            ref={forwardedRef}
            className={'widget-pane widget-pane-' + (showPane ? 'expanded' : 'collapsed') }>
            <div className='widget-pane-content project-pane' id='pane-scroll-y'>
                <header ref={projectPaneHeader} className='project-pane__header'
                    data-cy="activity-header">
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
                                classCustom: 'caution',
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete project',
                                confirmationTitle: 'Delete project?',
                                confirmationText:
                                    'Are you sure that you want to delete this project? ' +
                                    'All data associated with this project will be lost.',
                                confirmationButtonText: 'Delete',
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
});

ActivityMapPane.displayName = 'ActivityMapPane';
