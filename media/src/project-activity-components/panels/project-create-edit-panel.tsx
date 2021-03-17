import React, { useState, useEffect } from 'react';
import { BASE_MAPS, BASE_MAP_IMAGES } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCaretRight, faCaretDown
} from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';


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
            <div className={'pane-content-header'} style={{ top: paneHeaderHeight }}>
                <h2>{isNewProject ? 'Your project details' : 'Edit project details'}</h2>
            </div>
            <div className={'pane-content-body'}>
                <form onSubmit={handleFormSubmit} >
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__name'}>Title</label>
                        {isNewProject && (
                            <small id="form-field__description-help" className={'form-text text-muted mb-2 mt-0'}> {/* eslint-disable-line max-len */}
                                Name your new project.
                            </small>
                        )}
                        <input
                            type={'text'}
                            id={'form-field__name'}
                            className={'form-control'}
                            value={title}
                            autoFocus={true}
                            onChange={handleTitle}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    <div className={'form-group pane-form-group'}>
                        <label htmlFor={'form-field__description'}>
                            About this project
                        </label>
                        {isNewProject && (
                            <small id="form-field__description-help" className={'form-text text-muted mb-2 mt-0'}> {/* eslint-disable-line max-len */}
                                Describe what your new project is about.
                                You can return later to fill this out.
                            </small>
                        )}
                        <ReactQuill
                            value={description}
                            onChange={setDescription}/>
                    </div>
                    <div className={'pane-form-divider'} />
                    {isNewProject && (
                        <div className={'form-group pane-form-group'}>
                            <fieldset>
                                <legend className={'label'}>Base map</legend>
                                <small id="form-field__description-help" className={'form-text text-muted mb-2 mt-0'}> {/* eslint-disable-line max-len */}
                                The default base map is “Light.” You can select a different one,
                                or return later if you change your mind.
                                </small>
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
                        <div className={'form-group pane-form-group base-map-collapsed'}>
                            <button onClick={toggleBaseMapMenu}
                                className={'btn btn__accordion'}>
                                <span className={'menu-icon'}>
                                    <FontAwesomeIcon
                                        icon={faCaretRight}/>
                                </span>
                                Base Map: {BASE_MAPS.get(projectBaseMap)}
                            </button>
                        </div>
                    )}
                    <div className={'form-row'}>
                        <div className={'form-group col-3'}>
                        </div>
                        <div className={'form-group col-9'}>
                            {isNewProject ? (
                                <>
                                    <button
                                        type={'button'}
                                        onClick={handleNewProjectCancel}
                                        className={'btn btn-danger'}>
                                        Cancel
                                    </button>
                                    <button
                                        type={'submit'}
                                        className={'btn btn-primary'}>
                                        Next
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type={'button'}
                                        onClick={handleCancel}
                                        className={'btn btn-danger'}>
                                        Cancel
                                    </button>
                                    <button
                                        type={'submit'}
                                        className={'btn btn-primary'}>
                                        Save
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
