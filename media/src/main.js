window.jQuery = window.$ = require('jquery');
require('tablesorter');

import './scss/main.scss';

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
