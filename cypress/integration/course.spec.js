/* eslint-disable max-len */
describe('Course Navigation', function() {
    it('Logs in as super user and navigates to a course', function() {
        cy.login('superuser', 'test');
        cy.visit('/course/1/');
        cy.url().should('match', /course\/1\/$/);
    });
});

