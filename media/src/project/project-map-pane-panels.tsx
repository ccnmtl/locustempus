import React from 'react';
import { LayerData, EventData, ActivityData } from '../project-activity-components/common';
import { Activity } from '../project-activity-components/panels/activity';
import { LayerSet } from '../project-activity-components/layers/layer-set';

interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(this:void, idx: number): void;
    addLayer(this:void): void;
    description: string;
    layers: Map<number, LayerData>;
    layerVisibility: Map<number, boolean>;
    activity: ActivityData | null;
    updateActivity(this:void, instructions: string, pk: number): void;
    deleteActivity(this:void, pk: number): void;
    createActivity(this:void, instructions: string): void;
    deleteLayer(this:void, pk: number): void;
    updateLayer(this:void, pk: number, title: string, color: string): void;
    toggleLayerVisibility(this:void, pk: number): void;
    activeLayer: number | null;
    setActiveLayer(this:void, pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(this:void, d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(this:void, d: EventData): void;
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
                        <li className={activeTab == idx ?
                            'nav-item active button' : 'nav-item button'}
                        key={idx}>
                            <a className={activeTab == idx ?
                                'nav-link active' : 'nav-link'}
                            href='#'
                            data-active-tab={idx}
                            data-cy={el}
                            onClick={handleSetActiveTab}>{el}</a>
                        </li>
                    );
                })}
            </ul>
            <div className='pane-content-body'>
                {activeTab === OVERVIEW && (
                    <div className='fade-load'>
                        <section data-cy={'project-description'}
                            className={'lt-pane-section lt-pane-section__description'}>
                            {description ? (
                                <div className={'lt-quill-rendered'}
                                    dangerouslySetInnerHTML={{__html: description}}/>
                            ) : (
                                <div className={'lt-banner'} role={'banner'}>
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
                        responseData={null}
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

