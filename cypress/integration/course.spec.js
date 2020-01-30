/* eslint-disable max-len */
describe('Course Navigation', function() {
    it('Logs in as super user and navigates to a course', function() {
        cy.visit('http://localhost:8000');
        cy.get('#guest-login').click();
        cy.get('#id_username').type('superuser').blur();
        cy.get('#id_password').type('test').blur();
        cy.get('#login-local-form__submit').click();
        cy.visit('http://localhost:8000/course/1/');
    });
});

