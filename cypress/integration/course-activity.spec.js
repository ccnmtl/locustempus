/* eslint-disable max-len */
describe('Course Activity', function() {
    it('Checks that the manage activity button is present for faculty', function(){
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=manage-activity-button').contains('Manage Activity');
        cy.get('[data-cy=manage-activity-button').should('have.length', 1);
    });
    it('Checks that the create activity button is present for faculty', function(){
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=create-activity-button').contains('Create Activity');
        cy.get('[data-cy=create-activity-button').should('have.length', 1);
    });
    it('Checks that the activity create button is not present for students', function(){
        cy.login('student-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=view-activity-button').contains('View Activity');
        cy.get('[data-cy=view-activity-button').should('have.length', 1);
        cy.get('[data-cy=manage-activity-button').should('have.length', 0);
        cy.get('[data-cy=create-activity-button').should('have.length', 0);
    });
    it('Tests the activity lifecycle', function(){
        // Create an activity
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=create-activity-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/create\/$/);
        cy.get('[data-cy=field-activity-instructions').type('Do these things.');
        cy.get('[data-cy=activity-form-create-button').click();
        cy.url().should('match', /\/course\/1\/$/);
        cy.get('[data-cy=manage-activity-button').should('have.length', 2);

        // Edit the activity
        cy.get('[data-cy=manage-activity-button').first().click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/$/);
        cy.get('[data-cy=edit-activity-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/update\/$/);
        cy.get('[data-cy=field-activity-instructions').clear();
        cy.get('[data-cy=field-activity-instructions').type('Do these other things.');
        cy.get('[data-cy=activity-form-update-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/$/);

        // Delete the activity to clean up
        cy.visit('/course/1/');
        cy.get('[data-cy=manage-activity-button').first().click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/$/);
        cy.get('[data-cy=delete-activity-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/activity\/delete\/$/);
        cy.get('[data-cy=delete-activity-button').click();
        cy.url().should('match', /\/course\/1\/$/);
        cy.get('[data-cy=manage-activity-button').should('have.length', 1);
        cy.get('[data-cy=create-activity-button').should('have.length', 1);
    });
});
