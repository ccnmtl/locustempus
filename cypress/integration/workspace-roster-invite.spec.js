// 9. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Roster_Dashboard
// 10. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Invite_Collaborator
// 11. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Invitation_Flow
// 12. https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Remove_Collaborators

describe('Workspace Roster and Invite Stories', function() {
    beforeEach(() => {
        cy.login('faculty-one', 'test');
    });

    it('View the workspace roster page', function() {
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="workspace-title-link"]')
            .contains('Sandbox Workspace').click();

        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="manage-workspace"]').should('be.visible');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="manage-workspace-roster"]').click();

        cy.title().should('equal', 'Sandbox Workspace: Roster – Locus Tempus');
        cy.get('[data-cy="breadcrumb-1"]').contains('Workspaces');
        cy.get('[data-cy="breadcrumb-2"]').contains('Sandbox Workspace');
        cy.get('[data-cy="breadcrumb-3"]').contains('Roster');

        cy.get('[data-cy="workspace-roster-invite"]').should('be.visible');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').should('have.length', 5);

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(0).contains('Author');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(1).contains('One');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(2).contains('author-one');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(3).contains('Author');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(4)
            .find('[data-cy="roster-demote"]');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(1).find('td').eq(4)
            .find('[data-cy="roster-remove"]');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(0).contains('Faculty');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(1).contains('One');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(2).contains('faculty-one');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(3).contains('Author');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(4)
            .find('[data-cy="roster-demote"]');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(2).find('td').eq(4)
            .find('[data-cy="roster-remove"]');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(0).contains('Student');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(1).contains('One');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(2).contains('student-one');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(3).contains('Contributor');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-promote"]');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-remove"]');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(0).contains('Student');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(1).contains('Three');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(2).contains('student-three');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(3).contains('Contributor');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(4)
            .find('[data-cy="roster-promote"]');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(4).find('td').eq(4)
            .find('[data-cy="roster-remove"]');
    });

    it('Promotes and demotes Student One', function() {
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="workspace-title-link"]')
            .contains('Sandbox Workspace').click();

        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="manage-workspace-roster"]').click();
        cy.title().should('equal', 'Sandbox Workspace: Roster – Locus Tempus');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-promote"]').click();

        // verify there is an alert confirming the promotion
        cy.get('.alert').should('be.visible');
        cy.get('.alert').contains('Student One is now Author');

        // and that the user's status has changed
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(3).contains('Author');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-demote"]');

        // okay, demote the student again
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-demote"]').click();

        // verify there is an alert confirming the promotion
        cy.get('.alert').should('be.visible');
        cy.get('.alert').contains('Student One is now Contributor');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(3).contains('Contributor');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(3).find('td').eq(4)
            .find('[data-cy="roster-promote"]');
    });

    it('Adds and removes Student Two', function() {
        cy.title().should('equal', 'Workspaces – Locus Tempus');
        cy.get('[data-cy="workspace-title-link"]')
            .contains('Sandbox Workspace').click();

        cy.title().should('equal', 'Sandbox Workspace – Locus Tempus');
        cy.get('[data-cy="manage-workspace"]').click();
        cy.get('[data-cy="manage-workspace-roster"]').click();
        cy.title().should('equal', 'Sandbox Workspace: Roster – Locus Tempus');

        // Add a student
        // Student Two is part of the integration dataset
        cy.get('[data-cy="workspace-roster-invite"]').click();
        cy.title().should(
            'equal', 'Sandbox Workspace: Invite Members – Locus Tempus');
        cy.get('[name=email-0-invitee]').type('studenttwo@example.com');
        cy.get('[data-cy=add-users]').click();

        cy.title().should('equal', 'Sandbox Workspace: Roster – Locus Tempus');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').should('have.length', 6);

        cy.get('.alert').should('be.visible');
        cy.get('.alert').contains(
            'student-two is now a workspace member.');
        cy.get('.alert').contains(
            'An email notification was sent to studenttwo@example.com.');

        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(0).contains('Student');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(1).contains('Two');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(2).contains('student-two');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(3).contains('Contributor');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(4)
            .find('[data-cy="roster-promote"]');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(4)
            .find('[data-cy="roster-remove"]');

        // Remove the student
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').eq(5).find('td').eq(4)
            .find('[data-cy="roster-remove"]').click();

        // verify there is an alert confirming the removal
        cy.get('.alert').should('be.visible');
        cy.get('.alert').contains(
            'Student Two is no longer a member of this workspace');
        cy.get('[data-cy="uni-roster-table"]')
            .find('tr').should('have.length', 5);
    });

    // Invitations
    it('Invite a UNI user to a course', () => {
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

    it('Invite a second UNI field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_uni-1-invitee').should('not.exist');
        cy.get('[data-cy=add-uni]').click();
        cy.get('#id_uni-1-invitee').should('be.visible');
    });

    it('Deletes a second UNI field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_uni-1-invitee').should('not.exist');
        cy.get('[data-cy=add-uni]').click();
        cy.get('#id_uni-1-invitee').should('be.visible');
        cy.get('[data-cy=uni-invite-form]').within(() => {
            cy.get('[data-cy=remove-uni]').last().click();
        });
        cy.get('#id_uni-1-invitee').should('not.exist');
    });

    it('Invite UNIs to a course', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('[data-cy=add-uni]').click();
        cy.get('[name=uni-0-invitee]').type('abc123');
        cy.get('[name=uni-1-invitee]').type('xyz123');
        cy.get('[data-cy=add-users]').click();
        cy.url().should('match', /course\/1\/roster\/$/);
        cy.get('[data-cy=uni-roster-table]').contains('abc123');
        cy.get('[data-cy=uni-roster-table]').contains('xyz123');
    });

    it('Invite a guest user to a course', () => {
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
        cy.get('#id_email-1-invitee').should('not.exist');
        cy.get('[data-cy=add-email]').click();
        cy.get('#id_email-1-invitee').should('be.visible');
    });

    it('Deletes a second email field', () => {
        cy.visit('/course/1/roster/invite/');
        cy.get('#id_email-1-invitee').should('not.exist');
        cy.get('[data-cy=add-email]').click();
        cy.get('#id_email-1-invitee').should('be.visible');
        cy.get('[data-cy=email-invite-form]').within(() => {
            cy.get('[data-cy=remove-email]').last().click();
        });
        cy.get('#id_uni-1-invitee').should('not.exist');
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