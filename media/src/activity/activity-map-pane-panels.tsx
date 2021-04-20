import React, { useState, useEffect } from 'react';
import { LayerSet } from '../project-activity-components/layers/layer-set';
import { Activity } from '../project-activity-components/panels/activity';
import { LayerData, EventData } from '../project-activity-components/common';
import {
    ActivityData, ResponseData, ResponseStatus,
} from './activity-map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEyeSlash, faLayerGroup, faArrowLeft
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
    setAlert(alert: string | null): void;
}

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, layers, description, activity,
        updateActivity, deleteActivity, deleteLayer, updateLayer,
        layerVisibility, toggleLayerVisibility, toggleResponseVisibility,
        activeLayer, setActiveLayer, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit, projectLayers, responseData,
        updateResponse, createFeedback, updateFeedback, isFaculty,
        responseLayers, paneHeaderHeight, setAlert
    }: DefaultPanelProps) => {


    const [reflection, setReflection] = useState<string>('');
    const [reflectionSubmittedAt, setReflectionSubmittedAt] = useState<string>('');
    const [reflectionModfiedAt, setReflectionModifiedAt] = useState<string>('');
    // TODO: display response status
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reflectionStatus, setReflectionStatus] = useState<string>('DRAFT');
    const [feedback, setFeedback] = useState<string>('');
    const [feedbackSubmittedDate, setFeedbackSubmittedDate] = useState<string>('');
    const [feedbackModifiedDate, setFeedbackModifiedDate] = useState<string>('');
    const [feedbackSubmittedBy, setFeedbackSubmittedBy] = useState<string>('');

    useEffect(() => {
        // Only set a reflection if the user is not faculty/author
        if (!isFaculty && responseData.length == 1 && responseData[0].reflection) {
            setReflection(responseData[0].reflection);
            setReflectionSubmittedAt(responseData[0].submitted_at_formatted || '');
            setReflectionModifiedAt(responseData[0].modified_at_formatted || '');
            setReflectionStatus(responseData[0].status);

            if (responseData[0].feedback) {
                setFeedback(responseData[0].feedback.body || '');
                setFeedbackSubmittedDate(
                    responseData[0].feedback.submitted_at_formatted || '');
                setFeedbackModifiedDate(
                    responseData[0].feedback.modified_at_formatted || '');
                setFeedbackSubmittedBy(
                    responseData[0].feedback.feedback_from || '');
            }
        }
    }, [responseData]);

    const handleSetActiveTab = (
        e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        setActiveTab(Number(e.currentTarget.dataset.activeTab));
    };

    const handleSubmitResponse = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setAlert('Your reflection has been submitted.');
        updateResponse(reflection, ResponseStatus.SUBMITTED);
    };

    const handleReflectionSaveDraft = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setAlert('Your draft reflection has been saved.');
        updateResponse(reflection);
    };

    const OVERVIEW = 0;
    const BASE = 1;
    const RESPONSE = 2;
    const responseTabTitle = isFaculty ? `Responses (${responseData.length})` : 'Response';

    return (
        <>
            <ul className='nav nav-tabs pane-content-tabs' style={{ top: paneHeaderHeight }}>
                {['Overview', 'Base Layers', responseTabTitle].map((el, idx) => {
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
            <div className={'pane-content-body'}>
                {/* TODO: Render the tabs for activities here.
                    Think about how to turn these into components that can be passed into
                    this larger panel */}
                {activeTab === OVERVIEW && activity && (
                    <div className='fade-load'>
                        {description && (
                            <section className={'lt-pane-section'}>
                                <div dangerouslySetInnerHTML={{__html: description}}/>
                            </section>
                        )}
                        <section className={'lt-pane-section'}>
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
                            updateLayer={isFaculty ? updateLayer : undefined}
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
                                activeEventEdit={activeEventEdit}
                                setAlert={setAlert}/>
                        ) : (<>
                            <p className={'lt-date-display'}>
                                {reflection ? (
                                    <>{reflectionSubmittedAt == reflectionModfiedAt ? (
                                        <>Submitted on {reflectionSubmittedAt}</>
                                    ) : (
                                        <>
                                            Submitted on {reflectionSubmittedAt}<br />
                                            Last modified on {reflectionModfiedAt}
                                        </>
                                    )}</>
                                ) : (
                                    <>You have not submitted your response</>
                                )}
                            </p>
                            <section className={'lt-pane-section'}>
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
                            </section>
                            <section className={'lt-pane-section'}>
                                <h3>Reflection</h3>
                                <small className={'form-text text-muted mb-2 mt-0'}>
                                    A short instruction on what reflection is about
                                    and some guidance on the length of text.
                                </small>
                                <form onSubmit={handleSubmitResponse}>
                                    <ReactQuill
                                        value={reflection}
                                        onChange={setReflection}/>
                                    <div className={'text-center mt-3'}>
                                        {reflectionStatus === 'DRAFT' && (
                                            <button
                                                className={'btn btn-secondary mr-3'}
                                                onClick={handleReflectionSaveDraft}>
                                                Save as draft
                                            </button>
                                        )}
                                        <button
                                            type={'submit'}
                                            className={'btn btn-primary'}>
                                            {reflectionStatus === 'DRAFT' ? (
                                                <>Submit reflection</>
                                            ) : (
                                                <>Update reflection</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </section>
                            <section className={'lt-pane-section mt-1 border-top'}>
                                <h3>Feedback for you</h3>
                                {feedback ? (
                                    <>
                                        <p className={'lt-date-display'}>
                                            From {feedbackSubmittedBy}<br />
                                            {feedbackSubmittedDate == feedbackModifiedDate ? (
                                                <>Submitted on {feedbackSubmittedDate}</>
                                            ) : (<>
                                                Submitted on {feedbackSubmittedDate}<br />
                                                Last modified on {feedbackModifiedDate}
                                            </>)}
                                        </p>
                                        <div dangerouslySetInnerHTML={{__html: feedback}}/>
                                    </>
                                ) : (
                                    <p className={'lt-date-display'}>
                                        There is no feedback for your response
                                    </p>
                                )}
                            </section>
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
    setAlert(alert: string | null): void;
}

const FacultySubPanel: React.FC<FacultySubPanelProps> = ({
    responseData, createFeedback, updateFeedback, responseLayers,
    toggleResponseVisibility, activeEvent, setActiveEvent, layerVisibility,
    setActiveEventDetail, activeEventEdit, setAlert
}: FacultySubPanelProps) => {

    const [activeResponse, setActiveResponse] = useState<ResponseData | null>(null);
    const [activeResponseLayers, setActiveResponseLayers] =
        useState<Map<number, LayerData>>(new Map());
    const [feedback, setFeedback] = useState<string>('');
    const [feedbackSubmittedDate, setFeedbackSubmittedDate] = useState<string>('');
    const [feedbackModifiedDate, setFeedbackModifiedDate] = useState<string>('');

    useEffect(() => {
        // Populate feedback
        if (activeResponse && activeResponse.feedback) {
            setFeedback(activeResponse.feedback.body || '');
            setFeedbackSubmittedDate(activeResponse.feedback.submitted_at_formatted || '');
            setFeedbackModifiedDate(activeResponse.feedback.modified_at_formatted || '');
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
    }, [activeResponse, responseData]);

    const handleFeedbackSubmission = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeResponse) {
            if (activeResponse.feedback) {
                setAlert('Your feedback has been updated.');
                updateFeedback(
                    activeResponse.feedback.pk,
                    activeResponse.pk,
                    feedback
                );
            } else {
                setAlert('Your feedback has been created.');
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

    return (<>
        {activeResponse && activeResponseLayers.size > 0 ? (<>
            <button onClick={handleFeedbackCancel} className={'lt-button-back'}>
                <span className={'lt-icons lt-button-back__icon'}>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </span>
                <span className={'lt-button-back__text'}>
                    Return to Responses
                </span>
            </button>

            <h2>Response by {activeResponse.owners.join(', ')}</h2>
            <p className={'lt-date-display'}>
                Submitted on {activeResponse.submitted_at_formatted}<br />
                Last modified on {activeResponse.modified_at_formatted}
            </p>

            <section className={'lt-pane-section'}>
                <h3>Events</h3>
                <LayerSet
                    layers={activeResponseLayers}
                    setActiveEvent={setActiveEvent}
                    activeEvent={activeEvent}
                    setActiveEventDetail={setActiveEventDetail}
                    activeEventEdit={activeEventEdit} />
            </section>

            <section className={'lt-pane-section'}>
                <h3>Reflection</h3>
                <div dangerouslySetInnerHTML={{__html: activeResponse.reflection}}/>
            </section>
            <section className={'lt-pane-section'}>
                <h3>
                Feedback for {activeResponse.owners.join(', ')}
                </h3>
                <small className={'form-text text-muted mb-2 mt-0'}>
                    A short instruction on what feedback is about
                    and some guidance on the length of text.
                </small>
                <div className={'form-group pane-form-group'}>
                    <form onSubmit={handleFeedbackSubmission}>
                        {feedbackSubmittedDate && feedbackModifiedDate ? (
                            <p className={'lt-date-display'}>
                                {feedbackSubmittedDate == feedbackModifiedDate ? (
                                    <>Submitted on {feedbackSubmittedDate}</>
                                ) : (<>
                                    Submitted on {feedbackSubmittedDate}<br />
                                    Last modified on {feedbackModifiedDate}
                                </>)}
                            </p>
                        ) : (
                            <p className={'lt-date-display'}>
                                You haven&apos;t submitted feedback
                            </p>
                        )}
                        <ReactQuill
                            id={'form-field__feedback'}
                            value={feedback}
                            onChange={setFeedback}/>
                        <div className={'text-center mt-3'}>
                            <button
                                className={'btn btn-link mr-3'}
                                onClick={handleFeedbackCancel}>
                                Cancel
                            </button>
                            <button
                                type={'submit'}
                                className={'btn btn-primary'}>
                                {feedbackSubmittedDate ? (
                                    <>Update feedback</>
                                ) : (
                                    <>Send feedback</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>) : (<>
            {responseData.length === 1 ? (
                <p>There is {responseData.length} response to this activity.</p>
            ) : (
                <p>There are {responseData.length} responses to this activity.</p>
            )}

            {responseData.map((el) => {
                const responseLayers = el.layers.reduce((acc: boolean[], val) => {
                    const layerPks = val.split('/');
                    // Get the layer pk off of the API url
                    const PK_IDX = layerPks.length - 2;
                    if (layerPks && layerPks.length >= PK_IDX) {
                        const layerPk = Number(layerPks[5]);
                        if (typeof layerPk === 'number') {
                            acc.push(layerVisibility.get(layerPk) || false);
                        }
                    }
                    return acc;
                }, []);

                const responseVisible = responseLayers.every((i: boolean) => i);
                return (
                    <section
                        className={'lt-response-summary d-flex'}
                        aria-labelledby={`response-${el.pk}`}
                        key={el.pk}>
                        <div className={'d-flex flex-column'}>
                            <h3 id={`response-${el.pk}`}>
                                {el.owners.join(', ')}
                            </h3>
                            <p
                                className={'lt-date-display'}>
                                Submitted on {el.submitted_at_formatted}<br />
                                Last modified on {el.modified_at_formatted}
                            </p>
                        </div>
                        <ul className={'lt-list-group__action d-flex'}>
                            <li><button
                                onClick={
                                    (): void => {toggleResponseVisibility(el.pk);}}
                                className={'lt-icon-button lt-icon-button--transparent'}
                                aria-label={responseVisible ? 'Hide layer' : 'Show layer'}>
                                <span className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden={responseVisible ? 'false' : 'true'}>
                                    <FontAwesomeIcon icon={
                                        responseVisible ? faEye : faEyeSlash}/>
                                </span>
                            </button></li>
                            <li><button
                                onClick={(): void => {setActiveResponse(el);}}
                                className={'lt-icon-button lt-icon-button--transparent'}>
                                <span className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden='true'>
                                    <FontAwesomeIcon icon={faLayerGroup}/>
                                </span>
                            </button></li>
                        </ul>
                    </section>
                );
            })}
        </>)}
    </>);
};
