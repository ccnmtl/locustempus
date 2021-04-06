import React from 'react';
import { LayerData, EventData, ActivityData } from '../project-activity-components/common';
import { Activity } from '../project-activity-components/panels/activity';
import { LayerSet } from '../project-activity-components/layers/layer-set';

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
                {['Overview', 'Base Layers'].map((el, idx) => {
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
                        <section className={'lt-pane-section'}>
                            {description ? (
                                <div dangerouslySetInnerHTML={{__html: description}}/>
                            ) : (
                                <div className={'text-muted'}>
                                    There is no description for this project.
                                </div>
                            )}
                        </section>

                        <section className={'lt-pane-section'}>
                            <Activity
                                activity={activity}
                                isFaculty={true}
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

