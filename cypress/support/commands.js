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
    cy.visit('http://localhost:8000/dashboard/');
    cy.get('#guest-login').click();
    cy.get('#login-local-form__field-wrapper').should('be.visible');
    cy.get('#id_username').type(username).blur();
    cy.get('#id_password').type(password).blur();
    cy.get('#login-local-form__submit').click();
});

Cypress.Commands.add('reset_database', () => {
    cy.visit('http://localhost:8000/2b2c5419-b77c-47b5-b8ca-5dfe9f3d43a7/');
});
