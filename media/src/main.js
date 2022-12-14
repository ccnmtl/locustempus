window.jQuery = window.$ = require('jquery');
require('tablesorter');

import 'bootstrap';
import './scss/main.scss';
import './js/course-roster-invite.js';
import './js/registration-form.js';
import './js/header-scroll.js';

$(document).ready(function() {
    // Table sorter
    $('#myTable').tablesorter({
        theme: 'bootstrap',
    });

    $('#roster__table').tablesorter({
        theme: 'bootstrap',
    });

    $('#member-roster__table').tablesorter({
        theme: 'bootstrap',
        sortList: [[3,0], [0,0]],
    });

    $('#workspaces__table').tablesorter({
        theme: 'bootstrap',
    });

    $('#projects__table').tablesorter({
        theme: 'bootstrap',
    });

    // Login form
    $('#guest-login').click(function(evt) {
        $('#login-local-form__field-wrapper').show();
        $('#login-local-form__submit').show();
        $(this).hide();
    });
});
