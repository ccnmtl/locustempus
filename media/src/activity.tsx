import React from 'react';
import { createRoot } from 'react-dom/client';
import { ActivityMap } from './activity/activity-map';

const container = document.getElementById('activity-map-container');
if (container) {
    const root = createRoot(container);
    root.render(
        <ActivityMap />
    );
}
