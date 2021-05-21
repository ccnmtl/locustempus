// 13. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Workspace.27s_Projects_Dashboard
// 14. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Project
// 15. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Text_Editor
// 16. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Overall_Project_environment
// 17. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_.28Update.29_Project
// 18. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_Project

describe('Project List Stories (Workspace Detail)', function() {
    it('Verifies the workspace detail page', function() {
        cy.login_workspace_faculty('faculty-one');

        // just a little...this is also done in the workspace-list.spec
        // this test focuses on projects
        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="breadcrumb-1"]').contains('Workspaces');
        cy.get('[data-cy="breadcrumb-2"]').contains('Sandbox Workspace');
        cy.get('[data-cy="project-create-button"]')
            .should('be.visible');

        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 2);
        cy.get('[data-cy="project-card"]').contains('Project 0');
        cy.get('[data-cy="project-card"]').contains('Activity One');
    });

    it('Creates and cancel project', function() {
        cy.login_workspace_faculty('faculty-one');
        cy.get('[data-cy="project-create-button"]').click();

        // creating a project takes the user to the project detail space
        cy.title().should('equal', 'Untitled project – Locus Tempus');

        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // cancelling the creation flow returns the user to the workspace
        // detail page, with a delete confirmation
        cy.get('[data-cy="new-project-cancel"]').should('be.visible');
        cy.get('[data-cy="new-project-save"]').should('be.visible');

        cy.get('[data-cy="new-project-cancel"]').click();
        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 2);

        // verify there is no alert confirming the delete
        cy.get('.alert').should('not.exist');
    });

    it('Creates and saves project', function() {
        cy.login_workspace_faculty('faculty-one');

        cy.get('[data-cy="project-create-button"]').click();
        cy.get('[data-cy="loading-modal"]').should('be.visible');

        // creating a project takes the user to the project detail space
        cy.title().should('equal', 'Untitled project – Locus Tempus');

        // wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // the editing fields should be visible and tuned to a "new" project
        cy.get('[data-cy="edit-project-header"]').should('be.visible');
        cy.get('[data-cy="edit-project-header"]')
            .contains('Your project details');
        cy.get('[data-cy="edit-project-title"]').should('be.visible');
        // cy.get('[data-cy="edit-project-description"]').should('be.visible');
        cy.get('[name="basemapselection"').should('have.length', 6);

        // the cancel & "next", e.g. Save button should be visible
        cy.get('[data-cy="new-project-cancel"]').should('be.visible');
        cy.get('[data-cy="new-project-save"]').should('be.visible');

        // Update the field names
        cy.get('[data-cy="edit-project-title"]').clear();
        cy.get('[data-cy="edit-project-title"]').type('My Project');
        //cy.get('[data-cy="edit-project-description"]')
        //    .clear().type('Descriptive text');

        // Save the project
        cy.get('[data-cy="new-project-save"]').click();

        // The edit view should disappear and become the default project view
        // cy.title().should('equal', 'My Project – Locus Tempus');
        cy.get('.nav-link.active').contains('Overview');
        cy.get('[data-cy="project-title"]').contains('My Project');
        // cy.get('[data-cy="project-description"]')
        //  .contains('Descriptive text');
        cy.get('[data-cy="create-activity"]').should('be.visible');
    });

    it('Interacts with the new project', function() {
        cy.login_workspace_faculty('faculty-one');

        // Verify the new project shows up in the workspace
        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 3);

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('My Project').click();

        // wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Check for Overview & Base Layers tabs, no response tab
        cy.get('[data-cy="Overview"]').should('be.visible');
        cy.get('[data-cy="Base Layers"]').should('be.visible');
        cy.get('[data-cy="Responses"]').should('not.exist');

        // Check for the basics on the Overview tab
        cy.get('[data-cy="project-title"]').contains('My Project');
        // cy.get('[data-cy="project-description"]')
        //    .contains('Descriptive text');
        cy.get('[data-cy="create-activity"]').should('be.visible');

        // All the editing functionality is hidden
        cy.get('[data-cy="edit-project-header"]').should('not.exist');
        cy.get('[data-cy="edit-project-title"]').should('not.exist');
        cy.get('[data-cy="edit-project-description"]').should('not.exist');

        // Review the project menu functionality
        // open the menu
        cy.get('[data-cy="overflow-menu"]').eq(0).should('be.visible');
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(0).should('be.visible');
        cy.get('[data-cy="overflow-menu-item"]').eq(0)
            .contains('Edit project');
        cy.get('[data-cy="overflow-menu-item"]').eq(1).should('be.visible');
        cy.get('[data-cy="overflow-menu-item"]').eq(1)
            .contains('Delete project');

        // click the three dots closes the menu again
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').should('not.exist');

        // verify escape key also closes the menu
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(0)
            .should('be.visible');
        cy.get('body').type('{esc}');
        cy.get('[data-cy="overflow-menu-item"]').should('not.exist');
    });

    it('Edit the project details', function() {
        cy.login_workspace_faculty('faculty-one');

        // Navigate to project detail
        cy.get('[data-cy="project-card"]')
            .contains('My Project').click();

        // wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // open the menu and click edit
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(0).click();

        // verify edit elements are visible
        // the editing fields should be visible and tuned to an existing project
        cy.get('[data-cy="edit-project-header"]').should('be.visible');
        cy.get('[data-cy="edit-project-header"]')
            .contains('Edit project details');
        cy.get('[data-cy="edit-project-title"]').should('be.visible');
        // cy.get('[data-cy="edit-project-description"]').should('be.visible');
        cy.get('[data-cy="edit-project-basemap"').should('be.visible');

        // the cancel & "next", e.g. Save button should be visible
        cy.get('[data-cy="edit-project-cancel"]').should('be.visible');
        cy.get('[data-cy="edit-project-save"]').should('be.visible');

        // first, click cancel, and do a check that we're back in view mode
        cy.get('[data-cy="edit-project-save"]').click();
        cy.get('[data-cy="edit-project-header"]').should('not.exist');
        cy.get('[data-cy="edit-project-cancel"]').should('not.exist');
        cy.get('[data-cy="edit-project-save"]').should('not.exist');
        cy.get('[data-cy="project-title"]').contains('My Project');
        cy.get('[data-cy="create-activity"]').should('be.visible');

        // click edit again
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(0).click();

        // back in edit mode
        cy.get('[data-cy="edit-project-title"]').should('be.visible');

        // Update the field names
        cy.get('[data-cy="edit-project-title"]')
            .clear().type('My Amazing Project');
        //cy.get('[data-cy="edit-project-description"]')
        //    .clear().type('Descriptive text');

        // Save the project
        cy.get('[data-cy="edit-project-save"]').click();

        // The edit view should disappear and become the default project view
        // @bug - cy.title().should('equal', 'My Project – Locus Tempus');
        cy.get('.nav-link.active').contains('Overview');
        cy.get('[data-cy="project-title"]').contains('My Amazing Project');
        // cy.get('[data-cy="project-description"]')
        //  .contains('Descriptive text');
        cy.get('[data-cy="create-activity"]').should('be.visible');
    });

    it('View the project dashboard as a contributor', function() {
        // Workspace contributors cannot see projects
        cy.login_workspace_student('student-one');

        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 1);

        // Activity 
        cy.get('[data-cy="project-card"]')
            .contains('Activity One').should('be.visible');
    });

    it('View the project dashboard as a co-author', function() {
        // Workspace co-authors can see projects
        cy.login_workspace_faculty('author-one');

        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 3);

        // Navigates to project detail
        cy.get('[data-cy="project-card"]')
            .contains('Activity One').should('be.visible');
        cy.get('[data-cy="project-card"]')
            .contains('Project 0').should('be.visible');
    });

    it('Delete the project', function() {
        cy.login_workspace_faculty('faculty-one');

        // Navigate to project detail
        cy.get('[data-cy="project-card"]')
            .contains('My Amazing Project').click();

        // wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // open the menu and click delete, then cancel
        cy.get('[data-cy="confirm-dialog"]').should('not.exist');
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(1).click();
        cy.get('[data-cy="confirm-dialog"]').should('be.visible');
        cy.get('[data-cy="confirm-dialog-cancel"]').should('be.visible');
        cy.get('[data-cy="confirm-dialog-cancel"]').click();
        cy.get('[data-cy="confirm-dialog"]').should('not.exist');

        // open the menu and click delete, then okay
        cy.get('[data-cy="confirm-dialog"]').should('not.exist');
        cy.get('[data-cy="overflow-menu"]').eq(0).click();
        cy.get('[data-cy="overflow-menu-item"]').eq(1).click();
        cy.get('[data-cy="confirm-dialog"]').should('be.visible');
        cy.get('[data-cy="confirm-dialog-okay"]').should('be.visible');
        cy.get('[data-cy="confirm-dialog-okay"]').click();

        // navigate back to the workspace detail page
        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');

        // verify there is an alert confirming the delete
        cy.get('.alert').should('be.visible');
        cy.get('.alert').contains('My Amazing Project');
        cy.get('.alert').contains('has been deleted');

        // verify the project card is no longer there
        cy.get('[data-cy="project-list"]')
            .find('[data-cy="project-card"]').should('have.length', 2);
        cy.get('[data-cy="project-card"]')
            .contains('Untitled project').should('not.exist');
    });
});