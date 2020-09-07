import $ from 'jquery';

$(document).ready(function() {
    // Get the 'signupEmail' value from the query string, if the email
    // field value is empty, replace it with the QS value, and prevent the
    // field from being edited
    const url = new URL(window.location);
    if (url.pathname === '/accounts/register/') {
        const params = new URLSearchParams(url.search);
        const email = params.get('signupEmail');
        const currentEmailField = $('[name="email"]');

        if (email && !currentEmailField.value) {
            currentEmailField.attr('placeholder', '');
            currentEmailField.attr('value', email);
            currentEmailField.attr('readonly', true);
            currentEmailField.removeClass('form-control');
            currentEmailField.addClass('form-control-plaintext');
        }
    }
});
