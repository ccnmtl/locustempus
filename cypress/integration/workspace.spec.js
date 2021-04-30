// 5. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Workspace_Dashboard
// 6. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Workspace
// 7. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_Workspace
// 8. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_Workspace

describe('Workspaces Stories', function() {
    beforeEach(() => {
        cy.visit('/accounts/logout/?next=/');
        cy.clearCookies();
        cy.login_workspace('faculty-three', 'test');
        cy.get('#cu-privacy-notice-button').click();
    });

    it('Verifies the empty workspaces page', function() {
        // Verify the workspaces page
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="breadcrumb-1"]')
            .contains('Faculty\'s Workspaces');
        cy.get('[data-cy="create-workspaces-prompt"]')
            .should('be.visible');
        cy.get('[data-cy="course-create-button"]').should('be.visible');
    });

    it('Creates a workspace', function() {
        // Create and Cancel
        cy.get('[data-cy=course-create-button]').click();
        cy.title().should('equal', 'Create New Workspace – Locus Tempus');
        cy.get('[data-cy="cancel-create-workspace"]').should('be.visible');
        cy.get('[data-cy="cancel-create-workspace"]').click();
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="create-workspaces-prompt"]')
            .should('be.visible');

        // Create and save
        cy.get('[data-cy=course-create-button]').click();
        cy.get('[data-cy=field-workspace-title]').type('New Workspace');
        cy.get('[data-cy=field-workspace-description]').type(
            'A new workspace description');
        cy.get('[data-cy=save-workspace]').click();
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy=workspace-cards]').contains('New Workspace');
        cy.get('[data-cy=workspace-cards]').contains(
            'A new workspace description');
        cy.get('[data-cy="create-workspaces-prompt"]').should('not.exist');
    });

    it('Verify the workspace details page', function() {
        cy.get('[data-cy="workspace-title-link"]')
            .contains('New Workspace').click();
        cy.title().should('equal', 'New Workspace – Locus Tempus');
        cy.get('[data-cy="create-projects-prompt"]').should('be.visible');
        cy.get('[data-cy="manage-workspace"]').should('be.visible');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="edit-workspace"]').should('be.visible');
        cy.get('[data-cy="manage-workspace-roster"]').should('be.visible');
        cy.get('[data-cy="delete-workspace"]').should('be.visible');

        cy.get('[data-cy="breadcrumb-1"]').contains('Workspaces');
        cy.get('[data-cy="breadcrumb-2"]').contains('New Workspace');
    });

    it('Edit the workspace details', function() {
        // Navigate to the edit view
        cy.get('[data-cy="workspace-title-link"]')
            .contains('New Workspace').click();
        cy.title().should('equal', 'New Workspace – Locus Tempus');
        cy.get('[data-cy="manage-workspace"]').should('be.visible');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="edit-workspace"]').should('be.visible');
        cy.get('[data-cy="edit-workspace"]').click();

        // Verify the edit page
        cy.title().should('equal', 'Edit New Workspace – Locus Tempus');
        cy.get('[data-cy="breadcrumb-3"]').contains('Edit');
        cy.get('[data-cy="save-workspace"]').should('be.visible');
        cy.get('[data-cy="cancel-save-workspace"]').should('be.visible');

        // Cancel the edit
        cy.get('[data-cy="cancel-save-workspace"]').click();
        cy.title().should('equal', 'New Workspace – Locus Tempus');

        // Make an edit
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="edit-workspace"]').click();
        cy.get('[data-cy=field-workspace-title]')
            .clear().type('A New Workspace');
        cy.get('[data-cy=field-workspace-description]')
            .clear().type('An updated description');
        cy.get('[data-cy=save-workspace]').click();
        cy.title().should('equal', 'A New Workspace – Locus Tempus');
        cy.get('[data-cy="project-list"]').contains('An updated description');
    });

    it('Delete the workspace details', function() {
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="workspace-title-link"]')
            .contains('A New Workspace').click();

        cy.get('[data-cy="manage-workspace"]').should('be.visible');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="delete-workspace"]').should('be.visible');
        cy.get('[data-cy="delete-workspace"]').click();

        cy.title().should('equal', 'Delete Workspace – Locus Tempus');
        cy.get('[data-cy="breadcrumb-3"]').contains('Delete');
        cy.get('[data-cy="delete-workspace"]').should('be.visible');
        cy.get('[data-cy="cancel-delete-workspace"]').should('be.visible');

        // Cancel Delete
        cy.get('[data-cy="cancel-delete-workspace"]').click();
        cy.title().should('equal', 'A New Workspace – Locus Tempus');

        // Actually Delete
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="delete-workspace"]').click();
        cy.title().should('equal', 'Delete Workspace – Locus Tempus');
        cy.get('[data-cy="delete-workspace"]').click();

        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="breadcrumb-1"]')
            .contains('Faculty\'s Workspaces');
        cy.get('[data-cy="create-workspaces-prompt"]')
            .should('be.visible');
        cy.get('[data-cy="course-create-button"]').should('be.visible');
    });
});
