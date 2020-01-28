window.jQuery = window.$ = require('jquery');
require('tablesorter');

import './scss/main.scss';

// Table sorter
$('.course-roster__table').tablesorter({
    theme: 'bootstrap',
});
