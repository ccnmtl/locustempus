/* eslint-disable max-len */
describe('Course Roster Invite', () => {
    beforeEach(() => {
        cy.login('faculty', 'test');
    });
    it('Adds a UNI user to a course', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=uni-0-invitee]').type('abc123');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/$/);
        cy.get('[data-cy=class-roster-table]').contains('abc123');
    });
    it('Submits an invalid UNI and fails validation', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=uni-0-invitee]').type('spacelizard');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/invite\/$/);
        cy.get('[data-cy=uni-invite-form]').contains('This is not a valid UNI');
    });
    it('Submits an empty UNI and fails validation', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/invite\/$/);
        cy.get('[data-cy=uni-invite-form]').contains('This field is required.');
    });
    it('Adds a second UNI field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_uni-1-invitee').should('not.be.visible');
        cy.get('[data-cy=add-uni]').click();
        cy.get('#id_uni-1-invitee').should('be.visible');
    });
    it('Deletes a second UNI field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_uni-1-invitee').should('not.be.visible');
        cy.get('[data-cy=add-uni]').click();
        cy.get('#id_uni-1-invitee').should('be.visible');
        cy.get('[data-cy=uni-invite-form]').within(() => {
            cy.get('[data-cy=remove-uni]').last().click();
        });
        cy.get('#id_uni-1-invitee').should('not.be.visible');
    });
    it('Adds UNIs to a course', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[data-cy=add-uni]').click();
        cy.get('[name=uni-0-invitee]').type('abc123');
        cy.get('[name=uni-1-invitee]').type('xyz123');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/$/);
        cy.get('[data-cy=class-roster-table]').contains('abc123');
        cy.get('[data-cy=class-roster-table]').contains('xyz123');
    });
});


