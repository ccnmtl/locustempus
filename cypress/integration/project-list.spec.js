/* eslint-disable max-len */
describe('Project Navigation', function() {
    it('Logs in as super user and navigates to a project', function() {
        cy.login_workspace('superuser', 'test');
        cy.visit('/course/1/project/1/');
        cy.url().should('match', /course\/1\/project\/1\/$/);
        cy.get('[data-cy=loading-modal]').should('not.exist');
    });
});
