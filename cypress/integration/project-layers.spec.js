// 19. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_layer
// 20.

describe('Project Layer Stories (Workspace Detail)', function() {
    // Note: the basic checks for title, edit and delete are in the
    // project.spec.js page. This test will verify the layer visibility
    // and create, edit, delete functionality.

    beforeEach(() => {
        // Login
        cy.visit('/accounts/logout/?next=/');
        cy.clearCookies();
        cy.login_workspace('faculty-one', 'test');
        cy.get('#cu-privacy-notice-button').click();

        // Navigate to the Sandbox Workspace
        cy.get('[data-cy="workspace-title-link"]').click();
        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
    });

    it('Verify the layers on the project detail page', function() {
        // Navigates to project detail
        cy.get('[data-cy="project-card"]')
            .contains('Project 0').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        // Verify base layer
        cy.get('[data-cy="add-layer"]').should('be.visible')
        

    });
});