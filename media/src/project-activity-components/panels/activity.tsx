import React, { useState, useEffect } from 'react';
import { ActivityData } from '../common';
import {OverflowMenu} from '../overflow-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt, faTrashAlt, faUserEdit
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
                                classCustom: 'caution',
                                icon: <FontAwesomeIcon icon={faTrashAlt}/>,
                                label: 'Delete activity',
                                confirmationTitle: 'Delete Activity?',
                                confirmationText:
                                    'Are you sure that you want to delete this activity? ' +
                                    'All student responses will be lost.',
                                confirmationButtonText: 'Delete',
                            }
                        ]}/>
                    )}
                </div>
                {showEditForm ? (
                    <div className={'form-group pane-form-group'}>
                        <form onSubmit={handleEdit}>
                            <label htmlFor={'activity-form__instructions'}>
                                Edit Instructions
                            </label>
                            <ReactQuill
                                value={instructions}
                                onChange={setInstructions}/>
                            <div className={'text-center mt-3'}>
                                <button
                                    onClick={(): void => setShowEditForm(false)}
                                    className={'lt-button lt-button--outlined mr-3'}>
                                    <span className={'lt-button__label'}>Cancel</span>
                                </button>
                                <button type={'submit'}
                                    className={'lt-button lt-button--priority'}>
                                    <span className={'lt-button__label'}>Save changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
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
                    <div className={'form-group pane-form-group'}>
                        <form onSubmit={handleCreateActivity}>
                            <label htmlFor={'activity-form__instructions'}>
                                Instructions
                            </label>
                            <ReactQuill
                                value={instructions || ''}
                                onChange={setInstructions}/>
                            <div className={'text-center mt-3'}>
                                <button
                                    onClick={(): void => setShowCreateForm(false)}
                                    className={'lt-button lt-button--outlined mr-3'}>
                                    <span className={'lt-button__label'}>Cancel</span>
                                </button>
                                <button type={'submit'}
                                    className={'lt-button lt-button--priority'}>
                                    <span className={'lt-button__label'}>Create</span>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className={'lt-banner mb-3'} role={'banner'}>
                            There is no activity assigned on this project.
                        </div>
                        <button
                            data-cy={'create-activity'}
                            type={'submit'}
                            onClick={(): void => setShowCreateForm(true)}
                            className={'lt-button lt-button--solid'}>
                            <span className={'lt-icons lt-button__icon'}>
                                <FontAwesomeIcon icon={faUserEdit}/>
                            </span>
                            <span className={'lt-button__label'}>Create Activity</span>
                        </button>
                    </>
                )}
            </>
        );
    }
};
