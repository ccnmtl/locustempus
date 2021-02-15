import React, { useState, useEffect } from 'react';
import { ActivityData } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisV, faPencilAlt, faTrashAlt
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
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);

    const handleCreateActivity = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (createActivity) {
            createActivity(instructions);
        }
    };

    const toggleMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowMenu((prev) => !prev);
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        activity && updateActivity(instructions, activity.pk);
        setShowEditForm(false);
    };

    const handleDelete  = (e: React.MouseEvent): void => {
        e.preventDefault();
        activity && deleteActivity(activity.pk);
        setShowMenu(false);
    };

    useEffect(() => {
        activity && setInstructions(activity.instructions);
    }, [activity]);

    if (activity) {
        return (
            <>
                <div className='lt-pane-section__header'>
                    <h2>Activity</h2>
                    {isFaculty && (
                        <div className={'lt-menu-overflow trailing'}>
                            <button onClick={toggleMenu}
                                className={'lt-icon-button lt-icon-button--transparent'}
                                aria-label={showMenu ?
                                    'Hide more actions' : 'Show more actions'}>
                                <span
                                    className={'lt-icons lt-icon-button__icon'}
                                    aria-hidden='true'>
                                    <FontAwesomeIcon icon={faEllipsisV}/>
                                </span>
                            </button>
                            {showMenu && (
                                <div className={'lt-menu lt-menu-overflow--expand'}>
                                    <ul className={'lt-list'} role='menu'>
                                        <li className={'lt-list-item'} role='menuitem'>
                                            <a href='#' onClick={(): void => {
                                                setShowMenu(false); setShowEditForm(true);}}
                                            className={'lt-list-item__link'}>
                                                <span
                                                    className={'lt-icons lt-list-item__icon'}
                                                    aria-hidden='true'>
                                                    <FontAwesomeIcon icon={faPencilAlt}/>
                                                </span>
                                                <span
                                                    className={'lt-list-item__primary-text'}>
                                                    Edit activity
                                                </span>
                                            </a>
                                        </li>
                                        <li className={'lt-list-item'} role='menuitem'>
                                            <a href='#' onClick={handleDelete}
                                                className={'lt-list-item__link'}>
                                                <span
                                                    className={'lt-icons lt-list-item__icon'}
                                                    aria-hidden='true'>
                                                    <FontAwesomeIcon icon={faTrashAlt}/>
                                                </span>
                                                <span
                                                    className={'lt-list-item__primary-text'}>
                                                    Delete activity
                                                </span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
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
                        <p>There is no activity assigned on this project.</p>
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
