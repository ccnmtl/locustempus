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
        cy.get('[data-cy=uni-roster-table]').contains('abc123');
    });
    it('Submits an invalid UNI and fails validation', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=uni-0-invitee]').type('spacelizard');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/invite\/$/);
        cy.get('[data-cy=uni-invite-form]').contains('This is not a valid UNI');
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
        cy.get('[data-cy=uni-roster-table]').contains('abc123');
        cy.get('[data-cy=uni-roster-table]').contains('xyz123');
    });
    it('Adds a guest user to a course', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=email-0-invitee]').type('foo@bar.com');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/$/);
        cy.get('[data-cy=guest-roster-table]').contains('foo@bar.com');
    });
    it('Submits a Columbia email address and fails validation', () => {
        let addr = 'roary@columbia.edu';
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=email-0-invitee]').type(addr);
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/invite\/$/);
        cy.get('[data-cy=email-invite-form]').contains(
            addr + ' is a Columbia University email address.');
    });
    it('Adds a second guest user field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_email-1-invitee').should('not.be.visible');
        cy.get('[data-cy=add-email]').click();
        cy.get('#id_email-1-invitee').should('be.visible');
    });
    it('Deletes a second email field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_email-1-invitee').should('not.be.visible');
        cy.get('[data-cy=add-email]').click();
        cy.get('#id_email-1-invitee').should('be.visible');
        cy.get('[data-cy=email-invite-form]').within(() => {
            cy.get('[data-cy=remove-email]').last().click();
        });
        cy.get('#id_uni-1-invitee').should('not.be.visible');
    });
    it('Adds multiple guest users to a course', () => {
        let addr1 = 'bar@baz.com';
        let addr2 = 'foo@baz.com';
        cy.visit('/course/1/roster/invite/');
        cy.get('[name=email-0-invitee]').type(addr1);
        cy.get('[data-cy=add-email]').click();
        cy.get('[name=email-1-invitee]').type(addr2);
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/$/);
        cy.get('[data-cy=guest-roster-table]').contains(addr1);
        cy.get('[data-cy=guest-roster-table]').contains(addr2);
    });
    it('Submits an empty UNI and empty email and fails validation', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/invite\/$/);
        cy.get('body').contains('A value must be entered in either field.');
    });
});


