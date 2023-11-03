import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProjectMap } from './project/project-map';

const domContainer = document.getElementById('project-map-container');
const root = createRoot(domContainer as HTMLElement);

root.render(
    <React.StrictMode>
        <ProjectMap />
    </React.StrictMode>
);
