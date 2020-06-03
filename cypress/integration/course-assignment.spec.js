/* eslint-disable max-len */
describe('Course Assignment', function() {
    it('Checks that the manage assignment button is present for faculty', function(){
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=manage-assignment-button').contains('Manage Assignment');
        cy.get('[data-cy=manage-assignment-button').should('have.length', 1);
    });
    it('Checks that the create assignment button is present for faculty', function(){
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=create-assignment-button').contains('Create Assignment');
        cy.get('[data-cy=create-assignment-button').should('have.length', 1);
    });
    it('Checks that the assignment create button is not present for students', function(){
        cy.login('student-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=view-assignment-button').contains('View Assignment');
        cy.get('[data-cy=view-assignment-button').should('have.length', 1);
        cy.get('[data-cy=manage-assignment-button').should('have.length', 0);
        cy.get('[data-cy=create-assignment-button').should('have.length', 0);
    });
    it('Tests the assignment lifecycle', function(){
        // Create an assignment
        cy.login('faculty-one', 'test');
        cy.visit('/course/1/');
        cy.get('[data-cy=create-assignment-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/create\/$/);
        cy.get('[data-cy=field-assignment-instructions').type('Do these things.');
        cy.get('[data-cy=assignment-form-create-button').click();
        cy.url().should('match', /\/course\/1\/$/);
        cy.get('[data-cy=manage-assignment-button').should('have.length', 2);

        // Edit the assignment
        cy.get('[data-cy=manage-assignment-button').first().click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/$/);
        cy.get('[data-cy=edit-assignment-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/update\/$/);
        cy.get('[data-cy=field-assignment-instructions').clear();
        cy.get('[data-cy=field-assignment-instructions').type('Do these other things.');
        cy.get('[data-cy=assignment-form-update-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/$/);

        // Delete the assignment to clean up
        cy.visit('/course/1/');
        cy.get('[data-cy=manage-assignment-button').first().click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/$/);
        cy.get('[data-cy=delete-assignment-button').click();
        cy.url().should('match', /\/course\/1\/project\/1\/assignment\/delete\/$/);
        cy.get('[data-cy=delete-assignment-button').click();
        cy.url().should('match', /\/course\/1\/$/);
        cy.get('[data-cy=manage-assignment-button').should('have.length', 1);
        cy.get('[data-cy=create-assignment-button').should('have.length', 1);
    });
})
