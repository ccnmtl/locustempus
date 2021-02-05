import React, { useState, useEffect } from 'react';
import { MediaEditor } from '../layers/media-editor';
import { EventData } from '../layers/layer-set';
import ReactQuill from 'react-quill';


interface EventEditPanelProps {
    activeLayer: number | null;
    activeEventEdit: EventData;
    setActiveEventEdit(d: EventData | null): void;
    updateEvent(label: string, description: string,
                lat: number, lng: number, pk: number,
                layerPk: number, mediaUrl: string | null): void;
    paneHeaderHeight: number;
}

export const EventEditPanel: React.FC<EventEditPanelProps> = (
    {
        activeEventEdit, setActiveEventEdit, updateEvent, paneHeaderHeight
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

    useEffect(() => {
        if (activeEventEdit.media.length > 0) {
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
        updateEvent(
            eventName, description, activeEventEdit.location.lng_lat[1],
            activeEventEdit.location.lng_lat[0],
            activeEventEdit.pk, activeEventEdit.layer, fileS3Url);
        setActiveEventEdit(null);
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setActiveEventEdit(null);
    };

    return (
        <>
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <h2>Edit Event Marker</h2>
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
                            autoFocus={true}
                            onChange={handleName} />
                    </div>
                    <div className={'pane-form-divider'} />

                    {/* Edit image form */}
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__image'}>Image</label>
                        <MediaEditor fileS3Url={fileS3Url} setFileS3Url={setFileS3Url} />
                    </div>

                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            Description
                        </label>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
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

