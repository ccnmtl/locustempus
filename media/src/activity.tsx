import React from 'react';
import { createRoot } from 'react-dom/client';
import { ActivityMap } from './activity/activity-map';

const domContainer = document.querySelector('#activity-map-container');
const root = createRoot(domContainer as HTMLElement);

root.render(
    <React.StrictMode>
        <ActivityMap />
    </React.StrictMode>
);