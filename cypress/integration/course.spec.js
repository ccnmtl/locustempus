/* eslint-disable max-len */
describe('Course Navigation', function() {
    it('Logs in as super user and navigates to a course', function() {
        cy.login('superuser', 'test');
        cy.visit('/course/1/');
        cy.url().should('match', /course\/1\/$/);
    });
});

describe('Course Creation', function() {
    it('Logs in and creates a course', function() {
        cy.login('faculty-one', 'test');
        cy.url().should('match', /\/dashboard\/$/);
        cy.get('[data-cy=course-create-button]').click();
        cy.url().should('match', /\/course\/create\/$/);
        cy.get('[data-cy=field-course-title]').type('A New Sandbox Course');
        cy.get('[data-cy=submit]').click();
        cy.url().should('match', /dashboard\/$/);
        cy.get('[data-cy=sandbox-course-cards]').contains('A New Sandbox Course');
    });
});
