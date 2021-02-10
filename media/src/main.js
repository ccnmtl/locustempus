window.jQuery = window.$ = require('jquery');
require('tablesorter');

import 'bootstrap';
import './scss/main.scss';
import './js/course-roster-invite.js';
import './js/registration-form.js';
import './js/header-scroll.js';

// Table sorter
$('.course-roster__table').tablesorter({
    theme: 'bootstrap',
});

// Login form
$('#guest-login').click(function(evt) {
    $('#login-local-form__field-wrapper').show();
    $('#login-local-form__submit').show();
    $(this).hide();
});
