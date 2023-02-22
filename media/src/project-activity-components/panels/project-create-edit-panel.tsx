import React, { useState, useEffect } from 'react';
import { BASE_MAPS, BASE_MAP_IMAGES } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCaretRight, faCaretDown
} from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import 'quill-paste-smart';


interface ProjectCreateEditPanelProps {
    isNewProject: boolean;
    setIsNewProject?(val: boolean): void;
    projectTitle: string;
    projectDescription: string;
    projectBaseMap: string;
    setBaseMap(baseMap: string): void;
    updateProject(title: string, description: string, baseMap: string): void;
    showDefaultMenu(): void;
    deleteProject(): void;
    paneHeaderHeight: number;
}

export const ProjectCreateEditPanel: React.FC<ProjectCreateEditPanelProps> = (
    {
        isNewProject, setIsNewProject, projectTitle, projectDescription,
        projectBaseMap, setBaseMap, updateProject, showDefaultMenu,
        deleteProject, paneHeaderHeight
    }: ProjectCreateEditPanelProps) => {

    const [title, setTitle] = useState<string>(projectTitle);
    const [description, setDescription] = useState<string>(projectDescription);
    const [initBaseMap, setInitBaseMap] = useState<string>('');
    const [showBaseMapMenu, setShowBaseMapMenu] = useState<boolean>(false);

    useEffect(() => {
        setInitBaseMap(projectBaseMap);
    }, []);

    useEffect(() => {
        setTitle(projectTitle);
        setDescription(projectDescription);
    }, [projectTitle, projectDescription]);

    const handleTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setTitle(e.target.value);
    };

    const handleBaseMap = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setBaseMap(e.target.value);
    };

    const toggleBaseMapMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
        setShowBaseMapMenu((prev) => {return !prev;});
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        updateProject(title, description, projectBaseMap);
        showDefaultMenu();
        if (setIsNewProject) {
            setIsNewProject(false);
        }
    };

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        setBaseMap(initBaseMap);
        showDefaultMenu();
    };

    const handleNewProjectCancel = (
        e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        deleteProject();
    };

    return (
        <>
            <div className={'pane-content-header pane-content-header--project'}
                style={{ top: paneHeaderHeight }}>
                <h2 data-cy='edit-project-header'>
                    {isNewProject ? 'Your project details' : 'Edit project details'}
                </h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Title</label>
                        {isNewProject && (
                            <div className={'lt-helper'}>
                                <div className={'lt-helper--line'} id={'helper-field__name'}>
                                    Name your new project.
                                </div>
                            </div>
                        )}
                        <input
                            data-cy={'edit-project-title'}
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={title}
                            autoFocus={true}
                            onChange={handleTitle}
                            aria-controls={'helper-field__name'}
                            aria-describedby={'helper-field__name'}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            About this project
                        </label>
                        {isNewProject && (
                            <div className={'lt-helper'}>
                                <div className={'lt-helper--line'}
                                    id={'helper-field__description'}>
                                    Describe what your new project is about.
                                    You can return later to fill this out.
                                </div>
                            </div>
                        )}
                        <ReactQuill
                            data-cy={'edit-project-description'}
                            id={'form-field__description'}
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    {isNewProject && (
                        <div className={'form-group pane-form-group'}>
                            <fieldset>
                                <legend className={'label'}>Base map</legend>
                                <div className={'lt-helper'}>
                                    <div className={'lt-helper--line'}
                                        id={'helper-field__base-map'}>
                                        The default base map is “Light.”
                                        You can select a different one,
                                        or return later if you change your mind.
                                    </div>
                                </div>
                                <ul className={'d-flex flex-row flex-wrap md-radio basemap__listview'} role='radiogroup'> {/* eslint-disable-line max-len */}
                                    {[...BASE_MAPS.keys()].map((val, idx) => {
                                        return (
                                            <li className={'basemap__item'} key={idx}>
                                                <input
                                                    name="basemapselection"
                                                    id={`base-map-${idx}`}
                                                    type={'radio'}
                                                    value={val}
                                                    onChange={handleBaseMap}
                                                    checked={
                                                        val === projectBaseMap}
                                                />
                                                <label htmlFor={`base-map-${idx}`}
                                                    className={'basemap__label'}>
                                                    <span className={'basemap__name'}>{BASE_MAPS.get(val)}</span> {/* eslint-disable-line max-len */}
                                                    <img
                                                        src={BASE_MAP_IMAGES.get(val)}
                                                        alt='Thumbnail for {BASE_MAPS.get(val)}'
                                                        className={'img-fluid basemap__thumbnail'} /> {/* eslint-disable-line max-len */}
                                                </label>
                                            </li>
                                        );})
                                    }
                                </ul>
                            </fieldset>
                        </div>
                    )}
                    {showBaseMapMenu && !isNewProject && (
                        <div className={'form-group pane-form-group base-map-expanded'}>
                            <button onClick={toggleBaseMapMenu}
                                className={'btn btn__accordion'}>
                                <span className={'menu-icon'}>
                                    <FontAwesomeIcon icon={faCaretDown}/>
                                </span>
                                Base map: {BASE_MAPS.get(projectBaseMap)}
                            </button>
                            <fieldset>
                                <ul className={'d-flex flex-row flex-wrap md-radio basemap__listview'} role='radiogroup'> {/* eslint-disable-line max-len */}
                                    {[...BASE_MAPS.keys()].map((val, idx) => {
                                        return (
                                            <li className={'basemap__item'} key={idx}>
                                                <input
                                                    name="basemapselection"
                                                    id={`base-map-${idx}`}
                                                    type={'radio'}
                                                    value={val}
                                                    onChange={handleBaseMap}
                                                    checked={
                                                        val === projectBaseMap}
                                                />
                                                <label htmlFor={`base-map-${idx}`}
                                                    className={'basemap__label'}>
                                                    <span className={'basemap__name'}>{BASE_MAPS.get(val)}</span> {/* eslint-disable-line max-len */}
                                                    <img
                                                        src={BASE_MAP_IMAGES.get(val)}
                                                        alt='Thumbnail for {BASE_MAPS.get(val)}'
                                                        className={'img-fluid basemap__thumbnail'} /> {/* eslint-disable-line max-len */}
                                                </label>
                                            </li>
                                        );})
                                    }
                                </ul>
                            </fieldset>
                        </div>
                    )}
                    {!showBaseMapMenu && !isNewProject && (
                        <div className={'form-group pane-form-group pane-form-group--final base-map-collapsed'}> {/* eslint-disable-line max-len */}
                            <button onClick={toggleBaseMapMenu}
                                data-cy={'edit-project-basemap'}
                                className={'btn btn__accordion'}>
                                <span className={'menu-icon'}>
                                    <FontAwesomeIcon
                                        icon={faCaretRight}/>
                                </span>
                                Base Map: {BASE_MAPS.get(projectBaseMap)}
                            </button>
                        </div>
                    )}
                    <div className={'lt-pane-actions'}>
                        <div className={'lt-pane-actions__overlay overlay--project'}></div>
                        <div className={'lt-pane-actions__buttons'}>
                            {isNewProject ? (
                                <>
                                    <button
                                        data-cy="new-project-cancel"
                                        onClick={handleNewProjectCancel}
                                        className={'lt-button lt-button--outlined mr-3'}>
                                        <span className={'lt-button__label'}>Cancel</span>
                                    </button>
                                    <button
                                        data-cy="new-project-save"
                                        type={'submit'}
                                        className={'lt-button lt-button--priority'}>
                                        <span className={'lt-button__label'}>Save & Continue</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        data-cy="edit-project-cancel"
                                        onClick={handleCancel}
                                        className={'lt-button lt-button--outlined mr-3'}>
                                        <span className={'lt-button__label'}>Cancel</span>
                                    </button>
                                    <button
                                        data-cy="edit-project-save"
                                        type={'submit'}
                                        className={'lt-button lt-button--priority'}>
                                        <span className={'lt-button__label'}>Save changes</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};
