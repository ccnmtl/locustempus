import React, { useState, useEffect } from 'react';
import { Position } from '@deck.gl/core/utils/positions';
import { MediaEditor } from '../layers/media-editor';
import { MediaObject } from '../common';
import ReactQuill from 'react-quill';
import { EventData, LayerData } from '../common';

interface EventAddPanelProps {
    showAddEventForm: boolean;
    displayAddEventForm(show: boolean, mockData?: EventData): void;
    activePosition: Position | null;
    layers: Map<number, LayerData>;
    activeLayer: number | null;
    addEvent(
        label: string, datetime: string | null, description: string, lat: number, lng: number,
        mediaObj: MediaObject | null): void;
    setActiveTab(val: number): void;
    paneHeaderHeight: number;
    returnTab: number;
}

export const EventAddPanel: React.FC<EventAddPanelProps> = (
    { displayAddEventForm, activePosition, addEvent, setActiveTab,
        paneHeaderHeight, activeLayer, layers, returnTab
    }: EventAddPanelProps) => {

    const [activeLayerTitle, setActiveLayerTitle] = useState<string>('');
    const [eventName, setEventName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [fileS3Url, setFileS3Url] = useState<string | null>(null);
    const [source, setSource] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [alt, setAlt] = useState<string>('');

    useEffect(() => {
        if (activeLayer && layers.has(activeLayer)) {
            const l = layers.get(activeLayer);
            setActiveLayerTitle(l && l.title ? l.title : '');
        }
    }, [activeLayer, layers]);

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (activePosition) {
            const media = fileS3Url ? {
                url: fileS3Url, source: source, caption: caption, alt: alt} : null;
            addEvent(
                eventName === '' ? 'Untitled Marker' : eventName, datetime,
                description, activePosition[0], activePosition[1], media);
            displayAddEventForm(false);
            setActiveTab(returnTab);
        }
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        displayAddEventForm(false);
    };

    return (
        <>
            <div className={'pane-content-header pane-content-header--event'}
                style={{ top: paneHeaderHeight }}>
                <h2>{activeLayerTitle} &gt; Add an Event</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={eventName}
                            placeholder={'Untitled Event'}
                            autoFocus={true}
                            onChange={handleName} />
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group pane-form-group'}>
                        <label htmlFor={'form-field__date'}>
                                Associated date
                        </label>
                        <input
                            className={'form-control'}
                            type={'date'}
                            id={'form-field__date'}
                            value={datetime}
                            onChange={handleDatetime}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    {/* Add image form */}
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__image'}>Image</label>
                        <MediaEditor
                            fileS3Url={fileS3Url}
                            setFileS3Url={setFileS3Url}
                            source={source}
                            setSource={setSource}
                            caption={caption}
                            setCaption={setCaption}
                            alt={alt}
                            setAlt={setAlt}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group--final'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
                            id={'form-field__description'}
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'lt-pane-actions'}>
                        <div className={'lt-pane-actions__overlay overlay--event'}></div>
                        <div className={'lt-pane-actions__buttons'}>
                            <button
                                type={'button'}
                                onClick={handleCancel}
                                className={'lt-button lt-button--outlined mr-3'}>
                                <span className={'lt-button__label'}>Cancel</span>
                            </button>
                            <button type={'submit'} className={'lt-button lt-button--priority'}>
                                <span className={'lt-button__label'}>Save</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

