import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProjectMap } from './project/project-map';

const container = document.getElementById('project-map-container');
if (container) {
    const root = createRoot(container);
    root.render(
        <ProjectMap />
    );
}
