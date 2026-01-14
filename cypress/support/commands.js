// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (username, password) => {
    cy.get('.user-auth--logout').click();
    cy.clearCookies();

    cy.visit('http://localhost:8000/dashboard/');
    cy.get('[data-cy="guest-login"]').click();
    cy.get('[data-cy="guest-login-username"]').type(username).blur();
    cy.get('[data-cy="guest-login-password"]').type(password).blur();
    cy.get('[data-cy="guest-login-submit"]').click();

    cy.get('#cu-privacy-notice-button').click();
});

Cypress.Commands.add('login_workspace', (userName) => {
    cy.login(userName, 'test');

    // Quick check of the workspaces list page
    cy.title().should('equal', 'Workspaces – Locus Tempus');
    cy.get('[data-cy="workspace-title-link"]')
        .should('be.visible');
    cy.get('[data-cy="workspace-title-link"]')
        .should('be.visible');
    cy.get('[data-cy="workspace-title-link"]')
        .contains('Sandbox Workspace');

    // Navigate to the Sandbox Workspace
    cy.get('[data-cy="workspace-title-link"]').click();
    cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
});
