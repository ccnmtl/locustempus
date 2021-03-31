import React, { useState, useEffect } from 'react';
import { MediaEditor } from '../layers/media-editor';
import { EventData, LayerData, MediaObject } from '../common';
import ReactQuill from 'react-quill';


interface EventEditPanelProps {
    layers: Map<number, LayerData>;
    activeLayer: number | null;
    activeEventEdit: EventData;
    setActiveEventEdit(d: EventData | null): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number,
                layerPk: number, mediaObj: MediaObject | null): void;
    paneHeaderHeight: number;
    returnTab: number;
    setActiveTab(val: number): void;
    setActiveEventDetail(d: EventData | null): void;
}

export const EventEditPanel: React.FC<EventEditPanelProps> = (
    {
        activeEventEdit, setActiveEventEdit, updateEvent, paneHeaderHeight,
        layers, activeLayer, returnTab, setActiveTab, setActiveEventDetail
    }: EventEditPanelProps) => {

    const [
        eventName, setEventName] = useState<string>(activeEventEdit.label);
    const [
        description, setDescription
    ] = useState<string>(activeEventEdit.description);
    const [
        datetime, setDatetime
    ] = useState<string>(activeEventEdit.datetime || '');

    const [fileS3Url, setFileS3Url] = useState<string | null>(null);
    const [source, setSource] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [activeLayerTitle, setActiveLayerTitle] = useState<string>('');

    useEffect(() => {
        if (activeLayer && layers.has(activeLayer)) {
            const l = layers.get(activeLayer);
            setActiveLayerTitle(l && l.title ? l.title : '');
        }
    }, [activeLayer, layers]);

    useEffect(() => {
        if (activeEventEdit.media.length > 0) {
            setCaption(activeEventEdit.media[0].caption || '');
            setSource(activeEventEdit.media[0].source || '');
            setFileS3Url(activeEventEdit.media[0].url);
        }
    }, [activeEventEdit]);

    const handleName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEventName(e.target.value);
    };

    const handleDatetime = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDatetime(e.target.value);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const media = fileS3Url ? {
            url: fileS3Url, source: source, caption: caption} : null;
        updateEvent(
            eventName, description, activeEventEdit.location.lng_lat[1],
            activeEventEdit.location.lng_lat[0],
            activeEventEdit.pk, activeEventEdit.layer, media);
        setActiveEventDetail(null);
        setActiveEventEdit(null);
        setActiveTab(returnTab);
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventEdit(null);
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <h2>{activeLayerTitle} &gt; Edit event marker</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit}>
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Name</label>
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={eventName}
                            autoFocus={true}
                            onChange={handleName} />
                    </div>
                    <div className={'pane-form-divider'} />

                    {/* Edit image form */}
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
                    <div className={'form-group pane-form-group pane-form-group--final'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
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
                    <div className={'lt-cr-actions'}>
                        <div className={'lt-cr-actions__overlay'}></div>
                        <div className={'lt-cr-actions__buttons'}>
                            <button
                                type={'button'}
                                onClick={handleCancel} className={'btn btn-danger mr-3'}>
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

