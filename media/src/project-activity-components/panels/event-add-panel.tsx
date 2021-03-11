import React, { useState, useEffect } from 'react';
import { Position } from '@deck.gl/core/utils/positions';
import { MediaEditor } from '../layers/media-editor';
import { MediaObject } from '../common';
import ReactQuill from 'react-quill';
import { LayerData } from '../common';

interface EventAddPanelProps {
    showAddEventForm: boolean;
    setShowAddEventForm(val: boolean): void;
    activePosition: Position | null;
    layers: Map<number, LayerData>;
    activeLayer: number | null;
    addEvent(
        label: string, description: string, lat: number, lng: number,
        mediaObj: MediaObject | null): void;
    clearActivePosition(): void;
    setActiveTab(val: number): void;
    paneHeaderHeight: number;
}

export const EventAddPanel: React.FC<EventAddPanelProps> = (
    { setShowAddEventForm, activePosition, addEvent, clearActivePosition,
        setActiveTab, paneHeaderHeight, activeLayer, layers
    }: EventAddPanelProps) => {

    const [activeLayerTitle, setActiveLayerTitle] = useState<string>('');
    const [eventName, setEventName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [datetime, setDatetime] = useState<string>('');
    const [fileS3Url, setFileS3Url] = useState<string | null>(null);
    const [source, setSource] = useState<string>('');
    const [caption, setCaption] = useState<string>('');

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
                url: fileS3Url, source: source, caption: caption} : null;
            addEvent(
                eventName === '' ? 'Untitled Marker' : eventName,
                description, activePosition[0], activePosition[1], media);
            setShowAddEventForm(false);
            // TODO pass in the active tab this should return to
            setActiveTab(1);
            clearActivePosition();
        }
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setShowAddEventForm(false);
        clearActivePosition();
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
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
                    {/* Add image form */}
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__image'}>Image</label>
                        <MediaEditor
                            fileS3Url={fileS3Url}
                            setFileS3Url={setFileS3Url}
                            source={source}
                            setSource={setSource}
                            caption={caption}
                            setCaption={setCaption}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
                            id={'form-field__description'}
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    {/*
                        <div className={'pane-form-divider'} />
                        <div className={'form-group pane-form-group'}>
                            <label htmlFor={'form-field__date'}>
                                Date
                            </label>
                            <input
                                className={'form-control'}
                                type={'datetime-local'}
                                id={'form-field__date'}
                                value={datetime}
                                onChange={handleDatetime}/>
                        </div>
                      */}
                    <div className="form-row">
                        <div className={'form-group col-3'}>
                        </div>
                        <div className={'form-group col-9'}>
                            <button
                                type={'button'}
                                onClick={handleCancel} className={'btn btn-danger'}>
                                Cancel
                            </button>
                            <button type={'submit'} className={'btn btn-primary'}>
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

