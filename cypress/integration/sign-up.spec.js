// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Sign-up

describe('Sign-Up Stories', function() {
    it('Sign Up', function() {
        // Navigate to the home page
        cy.visit('/');
        cy.title().should('equal', 'Home page – Locus Tempus');
        cy.get('#cu-privacy-notice-button').click();

        // Navigate to the sign up page
        cy.get('[data-cy="sign-up-large"]').should('exist');
        cy.get('[data-cy="sign-up-large"]').click();
        cy.title().should('equal', 'Sign up for an account – Locus Tempus');
        cy.get('[data-cy="sign-up-error"]').should('not.exist');

        // Incomplete registration
        cy.get('[data-cy="sign-up-submit"]').click();
        cy.get('[data-cy="sign-up-error"]').should('be.visible');
        cy.get('[data-cy="sign-up-error"]').should(
                'contain', 'Please correct errors');
        cy.get('[data-cy="username-error"]').should(
                'contain', 'This field is required');
        cy.get('[data-cy="email-error"]').should(
                'contain', 'This field is required');
        cy.get('[data-cy="password-error"]').should(
                'contain', 'Please enter your password twice.');

        // Complete registration
        cy.get('[data-cy="username"]').type('newstudent').blur();
        cy.get('[data-cy="email"]').type('newstudent@example.com').blur();
        cy.get('[data-cy="password1"]').type('test').blur();
        cy.get('[data-cy="password2"]').type('test').blur();
        cy.get('[data-cy="sign-up-submit"]').click();

        // Data validated, activation email sent
        cy.title().should('equal', 'Activation email sent – Locus Tempus');

        // Cypress can't complete the rest of this flow (and it is best
        // tested in server-side unit test)
    });
});
