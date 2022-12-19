// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Activity
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_Activity
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_Activity

describe('Activity Stories', function() {
    // This test verifies basic project activity interaction. Basic project
    // functionality is in project.spec & project-layers.spec

    it('Create, edit, delete an activity', function() {
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Project 0').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Verify a few details
        cy.title().should('equal', 'Project 0 – Locus Tempus');
        cy.get('[data-cy="Overview"]').should('be.visible');
        cy.get('[data-cy="Overview"]').should('have.class', 'active');
        cy.get('[data-cy="Base Layers"]').should('be.visible');
        cy.get('[data-cy="Responses (0)"]').should('not.exist');
        cy.get('[data-cy="create-activity"]').should('be.visible');

        // Visible options to edit & delete the project
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit project');
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="project-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete project');

        // Create an activity
        cy.get('[data-cy="create-activity"]').click();
        cy.get('[data-cy="create-activity-form"]').should('be.visible');
        cy.get('[data-cy="create-activity-cancel"]').should('be.visible');
        cy.get('[data-cy="create-activity-save"]').contains('Create');
        cy.get('[data-cy="create-activity-save"]').should('be.visible');

        // Cancel
        cy.get('[data-cy="create-activity-cancel"]').click();
        cy.get('[data-cy="create-activity-form"]').should('not.exist');
        cy.get('[data-cy="create-activity-cancel"]').should('not.exist');
        cy.get('[data-cy="create-activity-save"]').should('not.exist');

        // Try this again
        cy.get('[data-cy="create-activity"]').click();
        cy.get('[data-cy="create-activity-form"]').should('be.visible');
        cy.get('[data-cy="create-activity-cancel"]').should('be.visible');
        cy.get('[data-cy="create-activity-save"]').should('be.visible');

        // If you try to click save without a description, nothing happens
        // @todo, add cancel flow when bug is fixed.
        // cy.get('[data-cy="create-activity-save"]').click();
        // cy.get('[data-cy="create-activity-form"]').should('be.visible');

        // Enter some instructions
        cy.get('.ql-editor').type('Add five markers to the map.');
        cy.get('[data-cy="create-activity-save"]').click();

        // Verify the activity is saved
        cy.title().should('equal', 'Activity: Project 0 – Locus Tempus');
        cy.get('[data-cy="Overview"]').should('be.visible');
        cy.get('[data-cy="Overview"]').should('have.class', 'active');
        cy.get('[data-cy="create-activity"]').should('not.exist');
        cy.get('[data-cy="Base Layers"]').should('be.visible');
        cy.get('[data-cy="Responses (0)"]').should('be.visible');

        // Visible options to edit & delete the project
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit project');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete project');

        cy.get('[data-cy="activity-instructions-header"]')
            .should('be.visible');
        cy.get('[data-cy="activity-instructions"]')
            .contains('Add five markers to the map.');

        // Verify overflow menu for this activity
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit activity');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete activity');

        // Edit Activity
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit activity').click();
        cy.get('.ql-editor').should('be.visible');
        cy.get('.ql-editor').clear().type('Add six markers to the map.');
        cy.get('[data-cy="edit-activity-cancel"]').click();
        cy.get('[data-cy="activity-instructions"]')
            .contains('Add five markers to the map.');

        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit activity').click();
        cy.get('.ql-editor').should('be.visible');
        cy.get('.ql-editor').clear().type('Add six markers to the map.');
        cy.get('[data-cy="edit-activity-save"]').contains('Save changes');
        cy.get('[data-cy="edit-activity-save"]').click();
        cy.get('[data-cy="activity-instructions"]')
            .contains('Add six markers to the map.');

        // Delete the activity, cancel first, then really do it
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete activity').click();
        cy.get('[data-cy="confirm-dialog-cancel"]').click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete activity').click();
        cy.get('[data-cy="confirm-dialog-okay"]').click();

        cy.title().should('equal', 'Project 0 – Locus Tempus');
        cy.get('[data-cy="activity-instructions-header"]').should('not.exist');
        cy.get('[data-cy="activity-instructions"]').should('not.exist');
        cy.get('[data-cy="create-activity"]').should('be.visible');
        cy.get('[data-cy="Responses (0)"]').should('not.exist');
    });

    it('View the activity as the author', function() {
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Co-author has options to edit and delete the project
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit project');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete project');

        // Co-author has options to edit and delete the activity
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit activity');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete activity');

        // Co-author can navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        // Co-author can add a layer
        cy.get('[data-cy="add-layer"]').should('be.visible');

        // Co-author can edit and delete a layer
        // The Overflow menu should let us rename the layer & delete it
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename"]').should('be.visible');
        cy.get('[data-cy="layer-delete"]').should('be.visible');

        // There should one layer
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

        // Co-author can navigate to the responses tab
        cy.get('[data-cy="Responses (0)"]').click();
        cy.get('[data-cy="activity-response-count"]')
            .contains('There are 0 responses to this activity.');
    });

    it('View the activity as the co-author', function() {
        cy.login_workspace('author-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Co-author has options to edit and delete the project
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit project');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity-header"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete project');

        // Co-author has options to edit and delete the activity
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit activity');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="activity"]')
            .find('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete activity');

        // Co-author can navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        // Co-author can add a layer
        cy.get('[data-cy="add-layer"]').should('be.visible');

        // Co-author can edit and delete a layer
        // The Overflow menu should let us rename the layer & delete it
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename"]').should('be.visible');
        cy.get('[data-cy="layer-delete"]').should('be.visible');

        // There should one layer
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

        // Co-author can navigate to the responses tab
        cy.get('[data-cy="Responses (0)"]').click();
        cy.get('[data-cy="activity-response-count"]')
            .contains('There are 0 responses to this activity.');
    });

    it('View the activity as a contributor', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Student does not see options to edit or delete project
        cy.get('[data-cy="activity-header"]').
            get('[data-cy="overflow-menu"]').should('not.exist');

        // Student does not see options to edit and delete the activity
        cy.get('[data-cy="activity"]')
            .get('[data-cy="overflow-menu"]').should('not.exist');

        // Student can navigate to the Base Layers page
        cy.get('[data-cy="Base Layers"]').click();

        // Student cannot add a layer
        cy.get('[data-cy="add-layer"]').should('not.exist');

        // Student cannot edit and delete a layer
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').should('not.exist');

        // But they can see the layer...though it is not active
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('not.have.class', 'lt-list-group--active');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('not.exist');

        // Student does not see the responses tab, but does see a response tab
        cy.get('[data-cy="Responses (0)"]').should('not.exist');
        cy.get('[data-cy="Response"]').click();
        cy.get('[data-cy="activity-response-count"]').should('not.exist');
    });
});