import $ from 'jquery';

$(document).ready(function() {
    // Get the 'signupEmail' value from the query string, if the email
    // field value is empty, replace it with the QS value, and prevent the
    // field from being edited
    let url = new URL(window.location);
    if (url.pathname === '/accounts/register/') {
        let params = new URLSearchParams(url.search);
        let email = params.get('signupEmail');
        let currentEmailField = $('[name="email"]');

        if (email && !currentEmailField.value) {
            currentEmailField.attr('placeholder', '');
            currentEmailField.attr('value', email);
            currentEmailField.attr('readonly', true);
            currentEmailField.removeClass('form-control');
            currentEmailField.addClass('form-control-plaintext');
        }
    }
});
