// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Sign-in

describe('Sign-In Stories', function() {
    beforeEach(() => {
        cy.visit('/accounts/logout/?next=/');
        cy.clearCookies();
    });

    it('Sign In', function() {
        // Navigate to the home page
        cy.visit('/');
        cy.title().should('equal', 'Home page – Locus Tempus');
        cy.get('#cu-privacy-notice-button').click();
        cy.get('[data-cy="see-workspaces"]').should('not.exist');
        cy.get('[data-cy="authenticated-user-choices"]').should('not.exist');

        // Navigate to login via the large Sign In button
        cy.get('[data-cy="sign-in-large"]').should('exist');
        cy.get('[data-cy="sign-in-large"]').click();
        cy.title().should('equal', 'Log in – Locus Tempus');
        cy.get('[data-cy="columbia-login"]').should('exist');
        cy.get('[data-cy="guest-login"]').should('exist');

        // Navigate back to the home page
        cy.visit('/');

        // Navigate to login via the small Sign In button in the corner
        cy.title().should('equal', 'Home page – Locus Tempus');
        cy.get('[data-cy="sign-in-small"]').should('exist');
        cy.get('[data-cy="sign-in-small"]').click();
        cy.title().should('equal', 'Log in – Locus Tempus');
        cy.get('[data-cy="columbia-login"]').should('exist');
        cy.get('[data-cy="guest-login"]').should('exist');

        // Sign in as a guest
        cy.title().should('equal', 'Log in – Locus Tempus');
        cy.get('[data-cy="guest-login"]').click();

        cy.get('[data-cy="guest-login-username"]').should('be.visible');
        cy.get('[data-cy="guest-login-password"]').should('be.visible');
        cy.get('[data-cy="guest-login-submit"]').should('be.visible');
        cy.get('[data-cy="guest-login-error"]').should('not.exist');

        // Empty fields
        cy.get('[data-cy="guest-login-submit"]').click();
        cy.get('[data-cy="guest-login-error"]').should('be.visible');
        cy.get('[data-cy="guest-login-error"]').should(
                'contain', 'Invalid username or password');

        // Invalid credentials
        cy.get('[data-cy="guest-login-username"]').type('faculty-one').blur();
        cy.get('[data-cy="guest-login-password"]').type('wrong').blur();
        cy.get('[data-cy="guest-login-submit"]').click();
        cy.get('[data-cy="guest-login-error"]').should('be.visible');
        cy.get('[data-cy="guest-login-error"]').should(
                'contain', 'Invalid username or password');

        // Valid credentials
        cy.get('[data-cy="guest-login-username"]').type('faculty-one').blur();
        cy.get('[data-cy="guest-login-password"]').type('test').blur();
        cy.get('[data-cy="guest-login-submit"]').click();

        // Navigate to the dashboard
        cy.title().should('equal', 'Home page – Locus Tempus');
        cy.get('[data-cy="sign-in-small"]').should('not.exist');
        cy.get('[data-cy="authenticated-user-choices"]').should('be.visible');
        cy.get('[data-cy="authenticated-user-choices"]').should(
                'contain', 'Hello, Faculty');
        cy.get('[data-cy="see-workspaces"]').should('be.visible');
    });

    it('Forgot Password', function() {
        // Navigate to the home page
        cy.visit('/')
        cy.title().should('equal', 'Home page – Locus Tempus');
        cy.get('#cu-privacy-notice-button').click();
        cy.get('[data-cy="sign-in-small"]').should('exist');
        cy.get('[data-cy="sign-in-small"]').click();

        // Navigate to the sign-in page
        cy.title().should('equal', 'Log in – Locus Tempus');
        cy.get('[data-cy="forgot-password"]').should('exist');

        // Navigate to the forgot password page
        cy.get('[data-cy="forgot-password"]').click();
        cy.title().should('equal', 'Password reset – Locus Tempus');

        // Cypress can't handle the email round-trip that is required to
        // reset the password. We'll leave that for now.
    });
});
