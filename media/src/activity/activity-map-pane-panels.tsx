import React, { useState, useEffect } from 'react';
import { LayerSet } from '../project-activity-components/layers/layer-set';
import { Activity } from '../project-activity-components/panels/activity';
import { LayerData, EventData } from '../project-activity-components/common';
import {
    ActivityData, ResponseData, ResponseStatus,
} from './activity-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';


interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(idx: number): void;
    addLayer(): void;
    description: string;
    layers: Map<number, LayerData>;
    projectLayers:  Map<number, LayerData>;
    activity: ActivityData | null;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
    deleteLayer(pk: number): void;
    updateLayer(pk: number, title: string): void;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    activeEventDetail: EventData | null;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
    setActiveEventEdit(d: EventData): void;
    responseData: ResponseData[];
    updateResponse(reflection?: string, status?: ResponseStatus): void;
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    isFaculty: boolean;
    responseLayers: Map<number, LayerData[]>;
    paneHeaderHeight: number;
}

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, layers, activity, updateActivity,
        deleteActivity, deleteLayer, updateLayer, layerVisibility,
        toggleLayerVisibility, toggleResponseVisibility, activeLayer,
        setActiveLayer, activeEvent, setActiveEvent, setActiveEventDetail,
        activeEventEdit, projectLayers, responseData, updateResponse,
        createFeedback, updateFeedback, isFaculty, responseLayers,
        paneHeaderHeight
    }: DefaultPanelProps) => {


    const [reflection, setReflection] = useState<string>('');

    useEffect(() => {
        // Only set a reflection if the user is not faculty/author
        if (!isFaculty && responseData.length == 1 && responseData[0].reflection) {
            setReflection(responseData[0].reflection);
        }
    }, [responseData]);

    const handleSetActiveTab = (
        e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleSubmitResponse = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateResponse(reflection, ResponseStatus.SUBMITTED);
    };

    const handleReflectionSaveDraft = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        updateResponse(reflection);
    };

    const OVERVIEW = 0;
    const BASE = 1;
    const RESPONSE = 2;
    const responseTabTitle = isFaculty ? `Responses (${responseData.length})` : 'Response';

    return (
        <>
            <ul className='nav nav-tabs pane-content-tabs' style={{ top: paneHeaderHeight }}>
                {['Overview', 'Base', responseTabTitle].map((el, idx) => {
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
                {/* TODO: Render the tabs for activities here.
                    Think about how to turn these into components that can be passed into
                    this larger panel */}
                {activeTab === OVERVIEW && activity && (
                    <div className='fade-load'>
                        <div>
                            <h2>Activity Description</h2>
                            <div dangerouslySetInnerHTML={{__html: activity.description}}/>
                        </div>
                        <section>
                            <Activity
                                activity={activity}
                                isFaculty={isFaculty}
                                updateActivity={updateActivity}
                                deleteActivity={deleteActivity}/>
                        </section>
                    </div>
                )}
                {activeTab === BASE && (
                    <div className='fade-load'>
                        <LayerSet
                            layers={projectLayers}
                            addLayer={isFaculty ? addLayer : undefined}
                            deleteLayer={isFaculty ? deleteLayer : undefined}
                            toggleLayerVisibility={toggleLayerVisibility}
                            layerVisibility={layerVisibility}
                            activeLayer={isFaculty ? activeLayer : undefined}
                            setActiveLayer={isFaculty ? setActiveLayer : undefined}
                            setActiveEvent={setActiveEvent}
                            activeEvent={activeEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit} />
                    </div>
                )}
                {activeTab == RESPONSE && (
                    <div className='fade-load'>
                        {isFaculty ? (
                            <FacultySubPanel
                                responseData={responseData}
                                createFeedback={createFeedback}
                                updateFeedback={updateFeedback}
                                responseLayers={responseLayers}
                                layerVisibility={layerVisibility}
                                toggleLayerVisibility={toggleLayerVisibility}
                                toggleResponseVisibility={toggleResponseVisibility}
                                activeLayer={activeLayer}
                                setActiveLayer={setActiveLayer}
                                activeEvent={activeEvent}
                                setActiveEvent={setActiveEvent}
                                setActiveEventDetail={setActiveEventDetail}
                                activeEventEdit={activeEventEdit}/>
                        ) : (<>
                            <LayerSet
                                layers={layers}
                                addLayer={addLayer}
                                deleteLayer={deleteLayer}
                                updateLayer={updateLayer}
                                layerVisibility={layerVisibility}
                                toggleLayerVisibility={toggleLayerVisibility}
                                activeLayer={activeLayer}
                                setActiveLayer={setActiveLayer}
                                setActiveEvent={setActiveEvent}
                                activeEvent={activeEvent}
                                setActiveEventDetail={setActiveEventDetail}
                                activeEventEdit={activeEventEdit} />
                            <div>
                                <h2>Reflection</h2>
                                <form onSubmit={handleSubmitResponse}>
                                    <div className="form-row">
                                        <div className={'form-group col-12'}>
                                            <ReactQuill
                                                value={reflection}
                                                onChange={setReflection}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className={'form-group col-12'}>
                                            <button
                                                type={'submit'}
                                                className={'btn btn-primary'}>
                                                Submit response
                                            </button>
                                            <button onClick={handleReflectionSaveDraft}>
                                                Save draft
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </>)}
                    </div>
                )}
            </div>
        </>
    );
};

interface FacultySubPanelProps {
    responseData: ResponseData[];
    createFeedback(responsePk: number, feedback: string): void;
    updateFeedback(pk: number, responsePk: number, feedback: string): void;
    responseLayers: Map<number, LayerData[]>;
    layerVisibility: Map<number, boolean>;
    toggleLayerVisibility(pk: number): void;
    toggleResponseVisibility(pk: number): void;
    activeLayer: number | null;
    setActiveLayer(pk: number): void;
    activeEvent: EventData | null;
    setActiveEvent(d: EventData): void;
    setActiveEventDetail(d: EventData): void;
    activeEventEdit: EventData | null;
}

const FacultySubPanel: React.FC<FacultySubPanelProps> = ({
    responseData, createFeedback, updateFeedback, responseLayers,
    toggleResponseVisibility, activeEvent, setActiveEvent,
    setActiveEventDetail, activeEventEdit
}: FacultySubPanelProps) => {

    const [activeResponse, setActiveResponse] = useState<ResponseData | null>(null);
    const [activeResonseLayers, setActiveResponseLayers] =
        useState<Map<number, LayerData>>(new Map());
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        // Populate feedback
        if (activeResponse && activeResponse.feedback) {
            setFeedback(activeResponse.feedback.body ? activeResponse.feedback.body : '');
        }

        // Create a map of just the layers beloning to the active response
        if (activeResponse) {
            const layers = responseLayers.get(activeResponse.pk);
            if (layers) {
                setActiveResponseLayers(
                    layers.reduce((acc, val) => {
                        acc.set(val.pk, val);
                        return acc;
                    }, new Map<number, LayerData>())
                );
            }
        }
    }, [activeResponse]);

    // TODO fix spelling!
    const handleFeedbackSubmition = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeResponse && activeResponse.feedback) {
            if (activeResponse.feedback) {
                updateFeedback(
                    activeResponse.feedback.pk,
                    activeResponse.pk,
                    feedback
                );
            } else {
                createFeedback(
                    activeResponse.pk,
                    feedback
                );
            }
        }
    };

    const handleFeedbackCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setActiveResponse(null);
    };

    return (
        <div>
            {activeResponse && activeResonseLayers.size > 0 ? (<>
                <div>
                    <LayerSet
                        layers={activeResonseLayers}
                        setActiveEvent={setActiveEvent}
                        activeEvent={activeEvent}
                        setActiveEventDetail={setActiveEventDetail}
                        activeEventEdit={activeEventEdit} />
                </div>
                <div>
                    <h2>Reflection</h2>
                    <div dangerouslySetInnerHTML={{__html: activeResponse.reflection}}/>
                </div>
                <div>
                    <h2>Feedback</h2>
                    <form onSubmit={handleFeedbackSubmition}>
                        <div className="form-row">
                            <div className={'form-group col-12'}>
                                <ReactQuill
                                    value={feedback}
                                    onChange={setFeedback}/>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-12'}>
                                <button onClick={handleFeedbackCancel}>
                                    Cancel
                                </button>
                                <button
                                    type={'submit'}
                                    className={'btn btn-primary'}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </>) : (<>
                <div>There are {responseData.length} responses to this activity</div>
                <div>
                    {responseData.map((el) => {
                        const subAt = (new Date(el.submitted_at)).toLocaleString();
                        return (
                            <div className="row" key={el.pk}>
                                <div className="col-1">
                                    <button onClick={
                                        (): void => {toggleResponseVisibility(el.pk);}}>
                                        <FontAwesomeIcon icon={faEye}/>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <div>
                                        {el.owners.join(', ')}
                                    </div>
                                    <div>
                                        Submitted: {subAt}
                                    </div>
                                </div>
                                <div className="col-1">
                                    <button onClick={(): void => {setActiveResponse(el);}}>
                                        <FontAwesomeIcon icon={faLayerGroup}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>)}
        </div>
    );
};
