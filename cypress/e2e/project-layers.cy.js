// 19. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_layer
// 20. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Overall_Layer_interactions
// 21. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_layer
// 22. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_layer

describe('Project Layer Stories (Workspace Detail)', function() {
    // Note: the basic checks for title, edit and delete are in the
    // project.spec.js page. This test will verify the layer visibility
    // and create, edit, delete functionality.

    it('Verify the layers on the project detail page', function() {
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]')
            .contains('Project 0').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        // Verify basics in Base Layers
        cy.get('[data-cy="add-layer"]').should('be.visible');

        // There should be one Untitled layer, and it should be active
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('have.class', 'lt-list-group--amber');

        // Layer should be visible
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye-slash"]').should('not.exist');
        // and once clicked, no longer visible
        cy.get('[data-icon="eye"]').eq(0).click();
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye-slash"]').should('be.visible');

        // Layer should be expanded
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');

        // collapse
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').click();
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('be.visible');

        // re-expand
        // and once clicked, no longer visible
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').click();
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('not.exist');

        // The Overflow menu should let us rename the layer & delete it
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename"]').should('be.visible');
        cy.get('[data-cy="layer-delete"]').should('be.visible');

        // Close it back up
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename"]').should('not.exist');
        cy.get('[data-cy="layer-delete"]').should('not.exist');
    });

    it('Add, edit, delete a layer', function() {
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]')
            .contains('Project 0').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        cy.log('Rename the 1st layer');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename-title"]').clear().type('First Layer');
        cy.get('[data-cy="layer-rename-cancel"]').click();
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');

        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename-title"]').clear().type('First Layer');
        cy.get('[data-cy="layer-rename-save"]').click();
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');

        cy.log('Add a second layer');
        cy.get('[data-cy="add-layer"]').should('be.visible');
        cy.get('[data-cy="add-layer"]').click();

        // There should be two layers now,
        // with the new layer at the top, active, visible and expanded
        cy.get('[data-cy="layer"]').should('have.length', 2);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('have.class', 'lt-list-group--amber');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');

        cy.log('The original layer is now second in the list & is not active');
        cy.get('[data-cy="layer"]').eq(1).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(1)
            .should('not.have.class', 'lt-list-group--amber');

        cy.log('Delete the 2nd layer');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-cancel"]').click();
        cy.get('[data-cy="layer"]').should('have.length', 2);

        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-okay"]').click();
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');

        cy.log('Delete the 1st layer too');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-okay"]').click();

        cy.log('a new, untitled empty layer is automagically created');
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('have.class', 'lt-list-group--amber');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');
    });
});