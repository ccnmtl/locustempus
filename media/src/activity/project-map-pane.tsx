import React, { useState, ReactElement } from 'react';
import { LayerProps } from '../project-activity-components/layers/layer';
import { LayerEventData, LayerEventDatum } from '../project-activity-components/layers/layer-set';
import { ActivityData, ResponseData, ResponseStatus } from './activity-map';
import { Position } from '@deck.gl/core/utils/positions';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, DefaultPanel,
} from './project-map-pane-panels';

export interface ProjectMapPaneProps {
    title: string;
    description: string;
    isFaculty: boolean;
    layers: LayerProps[];
    events: Map<number, LayerEventData>;
    projectLayers: LayerProps[];
    projectEvents: Map<number, LayerEventData>;
    activity: ActivityData | null;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    addLayer(): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    setLayerVisibility(pk: number): void;
    isProjectLayer(pk: number): boolean;
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
    responseData: ResponseData[];
    updateResponse(reflection?: string, status?: ResponseStatus): void;
}

export const ProjectMapPane: React.FC<ProjectMapPaneProps> = (
    {
        title, description, isFaculty, layers, events, activity, activeLayer,
        setActiveLayer, addLayer, deleteLayer, updateLayer, setLayerVisibility,
        isProjectLayer, showAddEventForm, setShowAddEventForm, activePosition,
        addEvent, clearActivePosition, activeEvent, setActiveEvent,
        activeEventDetail, setActiveEventDetail, activeEventEdit,
        setActiveEventEdit, deleteEvent, updateEvent, projectLayers,
        projectEvents, responseData, updateResponse
    }: ProjectMapPaneProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);


    const DEFAULT_PANEL = 3;
    const EVENT_EDIT_PANEL = 2;
    const EVENT_DETAIL_PANEL = 1;
    const EVENT_ADD_PANEL = 0;

    let panelState = DEFAULT_PANEL;
    if (activeEventEdit) {
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
            setActiveEventEdit={setActiveEventEdit}
            deleteEvent={deleteEvent}
            isProjectLayer={isProjectLayer}/>,
        2: <> {activeEventEdit && (
            <EventEditPanel
                activeLayer={activeLayer}
                activeEventEdit={activeEventEdit}
                setActiveEventEdit={setActiveEventEdit}
                updateEvent={updateEvent}/>
        )} </>,
        3: <DefaultPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLayer={addLayer}
            description={description}
            layers={layers}
            events={events}
            projectLayers={projectLayers}
            projectEvents={projectEvents}
            activity={activity}
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
            responseData={responseData}
            updateResponse={updateResponse}
            isFaculty={isFaculty}/>
    };

    return (
        <div id='project-map-pane' className='widget-pane'>
            <div className='widget-pane-content project-pane' id='pane-scroll-y'>
                <header className='d-flex flex-row project-pane__header'>
                    <h1>{title}</h1>
                </header>
                <div className='pane-content'>
                    {PANEL[panelState]}
                </div>
            </div>
        </div>
    );
};
