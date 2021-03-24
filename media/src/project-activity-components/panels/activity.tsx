import React, { useState, useEffect } from 'react';
import { ActivityData } from '../common';
import {OverflowMenu} from '../overflow-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';


interface ActivityProps {
    activity: ActivityData | null;
    isFaculty: boolean;
    createActivity?(instructions: string): void;
    updateActivity(instructions: string, pk: number): void;
    deleteActivity(pk: number): void;
}

export const Activity: React.FC<ActivityProps> = (
    {activity, isFaculty, createActivity, updateActivity, deleteActivity}: ActivityProps) => {

    const [instructions, setInstructions] = useState<string>('');
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);

    const handleCreateActivity = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (createActivity) {
            createActivity(instructions);
        }
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        activity && updateActivity(instructions, activity.pk);
        setShowEditForm(false);
    };

    const handleDelete  = (): void => {
        activity && deleteActivity(activity.pk);
    };

    useEffect(() => {
        activity && setInstructions(activity.instructions);
    }, [activity]);

    if (activity) {
        return (
            <>
                <div className='lt-pane-section__header'>
                    <h2>Activity instructions</h2>
                    {isFaculty && (
                        <OverflowMenu items={[
                            {
                                handler: () => {setShowEditForm(true);},
                                icon: <FontAwesomeIcon icon={faPencilAlt}/>,
                                label: 'Edit activity'
                            },
                            {
                                handler: handleDelete,
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete activity'
                            }
                        ]}/>
                    )}
                </div>
                {showEditForm ? (
                    <form onSubmit={handleEdit}>
                        <div className="form-group">
                            <label htmlFor={'activity-form__instructions'}>
                            </label>
                            <ReactQuill
                                value={instructions}
                                onChange={setInstructions}/>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-3'}>
                            </div>
                            <div className={'form-group col-9'}>
                                <button
                                    type={'button'}
                                    onClick={(): void => setShowEditForm(false)}
                                    className={'btn btn-danger'}>
                                    Cancel
                                </button>
                                <button type={'submit'} className={'btn btn-primary'}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div dangerouslySetInnerHTML={{__html: activity.instructions}}/>
                )}
            </>
        );
    } else {
        return (
            <>
                <h2>Activity</h2>
                {showCreateForm ? (
                    <form onSubmit={handleCreateActivity}>
                        <div className={'form-group pane-form-group'}>
                            <label htmlFor={'activity-form__instructions'}>
                                Instructions
                            </label>
                            <ReactQuill
                                value={instructions || ''}
                                onChange={setInstructions}/>
                        </div>
                        <div className="form-row">
                            <div className={'form-group col-3'}>
                            </div>
                            <div className={'form-group col-9'}>
                                <button
                                    type={'button'}
                                    onClick={(): void => setShowCreateForm(false)}
                                    className={'btn btn-danger'}>
                                    Cancel
                                </button>
                                <button type={'submit'} className={'btn btn-primary'}>
                                    Create
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className={'text-muted'}>
                            There is no activity assigned on this project.
                        </p>
                        <button
                            type={'submit'}
                            className={'btn btn-primary'}
                            onClick={(): void => setShowCreateForm(true)}>
                            Create Activity
                        </button>
                    </>
                )}
            </>
        );
    }
};
