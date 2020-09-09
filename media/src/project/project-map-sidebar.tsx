import React, { useState, ReactElement } from 'react';
import { LayerProps } from './layer';
import { LayerEventData, LayerEventDatum } from './project-map';
import { Position } from '@deck.gl/core/utils/positions';
import {
    EventAddPanel, EventEditPanel, EventDetailPanel, DefaultPanel,
    ProjectEditPanel
} from './project-map-sidebar-panels';


export interface ProjectMapSidebarProps {
    title: string;
    description: string;
    baseMap: string;
    setBaseMap(baseMap: string): void;
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
        title, description, baseMap, setBaseMap, layers, events, activeLayer,
        setActiveLayer, addLayer, deleteLayer, updateLayer, setLayerVisibility,
        showAddEventForm, setShowAddEventForm, activePosition, addEvent,
        clearActivePosition, activeEvent, setActiveEvent, activeEventDetail,
        setActiveEventDetail, activeEventEdit, setActiveEventEdit, deleteEvent,
        updateEvent
    }: ProjectMapSidebarProps) => {

    const [activeTab, setActiveTab] = useState<number>(0);

    const DEFAULT_PANEL = 4;
    const PROJECT_EDIT_PANEL = 3;
    const EVENT_EDIT_PANEL = 2;
    const EVENT_DETAIL_PANEL = 1;
    const EVENT_ADD_PANEL = 0;

    let panelState = DEFAULT_PANEL;
    if (true) {
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
        3: <ProjectEditPanel
            projectTitle={title}
            projectDescription={description}
            projectBaseMap={baseMap}
            setBaseMap={setBaseMap}/>,
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
            <h2>{title}</h2>
            {PANEL[panelState]}
        </div>
    );
};
