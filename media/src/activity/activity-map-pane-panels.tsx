import React, { useState, useEffect } from 'react';
import { LayerSet } from '../project-activity-components/layers/layer-set';
import { AggregatedLayerSet } from '../project-activity-components/layers/aggregated-layer-set';
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
import 'quill-paste-smart';


interface DefaultPanelProps {
    activeTab: number;
    setActiveTab(idx: number): void;
    addLayer(): void;
    description: string;
    layers: Map<number, LayerData>;
    projectLayers:  Map<number, LayerData>;
    fellowContributorLayers: Map<number, LayerData>;
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
    activeResponse: ResponseData | null;
    setActiveResponse(response: ResponseData | null): void;
    filterLayersByDate(range1: string, range2: string): void;
    resetContributorLayers(): Promise<void>
}

export const DefaultPanel: React.FC<DefaultPanelProps> = (
    {
        activeTab, setActiveTab, addLayer, layers, description, activity,
        updateActivity, deleteActivity, deleteLayer, updateLayer,
        layerVisibility, toggleLayerVisibility, toggleResponseVisibility,
        activeLayer, setActiveLayer, activeEvent, setActiveEvent,
        setActiveEventDetail, activeEventEdit, projectLayers,
        fellowContributorLayers, responseData, updateResponse, createFeedback,
        updateFeedback, isFaculty, responseLayers, paneHeaderHeight, setAlert,
        activeResponse, setActiveResponse, filterLayersByDate, resetContributorLayers
    }: DefaultPanelProps) => {


    const [reflection, setReflection] = useState<string>('');
    // keep this for later, till we figure out the date logic
    // const [reflectionSubmittedAt, setReflectionSubmittedAt] = useState<string>('');
    const [reflectionModifiedAt, setReflectionModifiedAt] = useState<string>('');
    // TODO: display response status
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reflectionStatus, setReflectionStatus] = useState<string>('DRAFT');
    const [feedback, setFeedback] = useState<string>('');
    const [feedbackSubmittedDate, setFeedbackSubmittedDate] = useState<string>('');
    const [feedbackModifiedDate, setFeedbackModifiedDate] = useState<string>('');
    const [feedbackSubmittedBy, setFeedbackSubmittedBy] = useState<string>('');

    useEffect(() => {
        // Only set a reflection if the user is not faculty/author
        if (!isFaculty && responseData.length == 1) {
            setReflection(responseData[0].reflection);
            // setReflectionSubmittedAt(responseData[0].submitted_at_formatted || '');
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
        setAlert('Your response has been submitted.');
        updateResponse(reflection, ResponseStatus.SUBMITTED);
    };

    const handleReflectionSaveDraft = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setAlert('Your draft response has been saved.');
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
            <div className={'pane-content-body'}>
                {/* TODO: Render the tabs for activities here.
                    Think about how to turn these into components that can be passed into
                    this larger panel */}
                {activeTab === OVERVIEW && activity && (
                    <div className='fade-load'>
                        {description ? (
                            <section className={'lt-pane-section'}>
                                <div className={'lt-quill-rendered'}
                                    dangerouslySetInnerHTML={{__html: description}}/>
                            </section>
                        ) : (<>
                            {isFaculty && (
                                <section className={'lt-pane-section'}>
                                    <div className={'lt-banner'} role={'banner'}>
                                        There is no description for this project.
                                    </div>
                                </section>
                            )}
                        </>)}
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
                        <h2 className={'mb-0'}>
                            Base Event Markers
                        </h2>
                        <LayerSet
                            layers={projectLayers}
                            addLayer={isFaculty ? addLayer : undefined}
                            updateLayer={isFaculty ? updateLayer : undefined}
                            deleteLayer={isFaculty ? deleteLayer : undefined}
                            toggleLayerVisibility={toggleLayerVisibility}
                            layerVisibility={layerVisibility}
                            activeLayer={activeLayer}
                            setActiveLayer={setActiveLayer}
                            setActiveEvent={setActiveEvent}
                            activeEvent={activeEvent}
                            setActiveEventDetail={setActiveEventDetail}
                            activeEventEdit={activeEventEdit} />
                        {!isFaculty && (
                            <AggregatedLayerSet
                                layers={fellowContributorLayers}
                                toggleLayerVisibility={toggleLayerVisibility}
                                layerVisibility={layerVisibility}
                                activeLayer={activeLayer}
                                setActiveLayer={setActiveLayer}
                                setActiveEvent={setActiveEvent}
                                activeEvent={activeEvent}
                                resetContributorLayers={resetContributorLayers}
                                filterLayersByDate={filterLayersByDate}
                                setActiveEventDetail={setActiveEventDetail}
                                activeEventEdit={activeEventEdit} />
                        )}
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
                                activeResponse={activeResponse}
                                setActiveResponse={setActiveResponse}
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
                            <section className={'lt-pane-section pb-0 mb-0 border-0'}
                                data-cy="reflection-status">
                                {reflectionStatus === 'SUBMITTED' ? (
                                    <p className={'lt-date-display'}>
                                        Last saved on {reflectionModifiedAt}
                                    </p>
                                ) : (<>
                                    <p className={'lt-date-display'}>
                                        You have not submitted your response.
                                    </p>
                                    <div className={'lt-banner'} role={'banner'}>
                                        Use this space to craft your response to this activity by
                                        adding event markers, and composing your reflection. You
                                        can save your response as draft, or submit it when done.
                                    </div>
                                </>)}
                            </section>
                            <section className={'lt-pane-section'}>
                                <h2 className={'mb-0'}>Event Markers</h2>
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
                            <section className={'lt-pane-section'}
                                data-cy="reflection">
                                <h2>Reflection</h2>
                                <form onSubmit={handleSubmitResponse}>
                                    <div className={'form-group pane-form-group'}>
                                        <div className={'lt-helper'}>
                                            <div className={'lt-helper--line'}
                                                id={'helper-field__description'}>
                                                Use this text area to compose a summary, or
                                                additional overall analysis of the event markers
                                                as part of your response.
                                            </div>
                                        </div>
                                        <ReactQuill
                                            value={reflection}
                                            onChange={setReflection}/>
                                    </div>
                                    <div className={'lt-pane-actions'}>
                                        <div className={'lt-pane-actions__overlay overlay--response'}></div> {/* eslint-disable-line max-len */}
                                        <div className={'lt-pane-actions__buttons'}>
                                            {reflectionStatus === 'DRAFT' && (
                                                <button
                                                    className={'lt-button lt-button--solid mr-3'}
                                                    onClick={handleReflectionSaveDraft}
                                                    data-cy="save-as-draft">
                                                    <span className={'lt-button__label'}>Save as draft</span> {/* eslint-disable-line max-len */}
                                                </button>
                                            )}
                                            <button
                                                type={'submit'}
                                                className={'lt-button lt-button--priority'}
                                                data-cy="submit-or-update-response">
                                                <span className={'lt-button__label'}>
                                                    {reflectionStatus === 'DRAFT' ? (
                                                        <>Submit response</>
                                                    ) : (
                                                        <>Update response</>
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </section>
                            <section
                                className={'lt-pane-section lt-pane-section__feedback'}
                                data-cy="feedback">
                                <h2>Feedback for you</h2>
                                {feedback ? (
                                    <>
                                        <p className={'lt-date-display'} data-cy="feedback-status">
                                            From {feedbackSubmittedBy}<br />
                                            {feedbackSubmittedDate == feedbackModifiedDate ? (
                                                <>Submitted on {feedbackSubmittedDate}</>
                                            ) : (<>
                                                Submitted on {feedbackSubmittedDate}<br />
                                                Last modified on {feedbackModifiedDate}
                                            </>)}
                                        </p>
                                        <div className={'lt-quill-rendered'}
                                            dangerouslySetInnerHTML={{__html: feedback}}/>
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
    activeResponse: ResponseData | null;
    setActiveResponse(response: ResponseData | null): void;
}

const FacultySubPanel: React.FC<FacultySubPanelProps> = ({
    responseData, createFeedback, updateFeedback, responseLayers,
    activeResponse, setActiveResponse, toggleResponseVisibility, activeEvent,
    setActiveEvent, layerVisibility, setActiveEventDetail, activeEventEdit,
    setAlert, setActiveLayer, activeLayer
}: FacultySubPanelProps) => {

    const [activeResponseLayers, setActiveResponseLayers] =
        useState<Map<number, LayerData>>(new Map());
    const [feedback, setFeedback] = useState<string>('');
    const [feedbackSubmittedDate, setFeedbackSubmittedDate] = useState<string>('');
    const [feedbackModifiedDate, setFeedbackModifiedDate] = useState<string>('');

    useEffect(() => {
        // Populate feedback
        if (activeResponse) {
            if (activeResponse.feedback) {
                setFeedback(activeResponse.feedback.body);
                setFeedbackSubmittedDate(activeResponse.feedback.submitted_at_formatted);
                setFeedbackModifiedDate(activeResponse.feedback.modified_at_formatted);
            } else {
                setFeedback('');
                setFeedbackSubmittedDate('');
                setFeedbackModifiedDate('');
            }
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
                setAlert('Your feedback has been sent.');
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
            <div className={'pane-content-subheader'}>
                <button onClick={handleFeedbackCancel} className={'lt-button-back'}>
                    <span className={'lt-icons lt-button-back__icon'}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </span>
                    <div className={'lt-button-back__clip'} data-cy="go-back">
                        <span className={'lt-button-back__text'}>
                            Return to Responses
                        </span>
                    </div>
                </button>
            </div>

            <h2 className={'pt-5'} data-cy="response-by">
                Response by {activeResponse.owners.join(', ')}
            </h2>
            <p className={'lt-date-display'} data-cy="response-modified">
                Last modified on {activeResponse.modified_at_formatted}
            </p>

            <section className={'lt-pane-section'}>
                <h3>Events</h3>
                <LayerSet
                    layers={activeResponseLayers}
                    setActiveEvent={setActiveEvent}
                    activeEvent={activeEvent}
                    setActiveEventDetail={setActiveEventDetail}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    activeEventEdit={activeEventEdit} />
            </section>

            <section data-cy="contributor-reflection" className={'lt-pane-section'}>
                <h3>Reflection</h3>
                <div className={'lt-quill-rendered'}
                    dangerouslySetInnerHTML={{__html: activeResponse.reflection}}/>
            </section>
            <section className={'lt-pane-section lt-pane-section__feedback'}>
                <h3 data-cy="feedback-for-contributor">
                    Feedback for {activeResponse.owners.join(', ')}
                </h3>
                <div className={'lt-helper'}>
                    <div className={'lt-helper--line'}
                        id={'helper-field__description'}>
                        Write a feedback on this Contributor’s response.
                    </div>
                </div>
                <div data-cy="feedback" className={'form-group pane-form-group'}>
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
                                onClick={handleFeedbackCancel}
                                className={'lt-button lt-button--outlined mr-3'}
                                data-cy="cancel-feedback">
                                <span className={'lt-button__label'}>Cancel</span>
                            </button>
                            <button type={'submit'}
                                className={'lt-button lt-button--priority'}
                                data-cy="send-feedback">
                                <span className={'lt-button__label'}>
                                    {feedbackSubmittedDate ? (
                                        <>Update feedback</>
                                    ) : (
                                        <>Send feedback</>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>) : (<>
            <section data-cy="activity-response-count" className={'lt-pane-section'}>
                {responseData.length === 1 ? (
                    <p>There is {responseData.length} response to this activity.</p>
                ) : (
                    <p>There are {responseData.length} responses to this activity.</p>
                )}
            </section>

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
                        key={el.pk}
                        data-cy="response-summary">
                        <div className={'d-flex flex-column'}>
                            <a href="#" onClick={(): void => {setActiveResponse(el);}}>
                                <h3 id={`response-${el.pk}`} data-cy="contributor">
                                    {el.owners.join(', ')}
                                </h3>
                            </a>
                            <p
                                className={'lt-date-display'}>
                                Last modified on {el.modified_at_formatted}
                            </p>
                        </div>
                        <ul className={'lt-list-group__action d-flex'}>
                            <li><button
                                onClick={
                                    (): void => {toggleResponseVisibility(el.pk);}}
                                className={'lt-icon-button'}
                                aria-label={responseVisible ? 'Hide layer' : 'Show layer'}>
                                <span className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden={responseVisible ? 'false' : 'true'}>
                                    <FontAwesomeIcon icon={
                                        responseVisible ? faEye : faEyeSlash}/>
                                </span>
                            </button></li>
                            <li><button
                                onClick={(): void => {setActiveResponse(el);}}
                                className={'lt-icon-button'}
                                data-cy="open-response">
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
