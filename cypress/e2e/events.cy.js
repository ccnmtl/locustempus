describe('Activity Response Stories', function() {

    it('Create response layer with events', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();
        //Create Events
        cy.get('#activity-map-container').click(900, 500);
        cy.get('#form-field__name').clear().type('First Event');
        cy.get('#form-field__date').clear().type('1989-03-21');
        cy.get('#form-field__description').clear().type('Example first event.');
        cy.get('.lt-button--priority').click();

        cy.get('#activity-map-container').click(900, 490);
        cy.get('#form-field__name').clear().type('Second Event');
        cy.get('#form-field__date').clear().type('2010-08-03');
        cy.get('#form-field__description').clear().type(
            'Example second event.');
        cy.get('.lt-button--priority').click();

        cy.get('#activity-map-container').click(900, 480);
        cy.get('#form-field__name').clear().type('Third Event');
        cy.get('#form-field__date').clear().type('2022-11-14');
        cy.get('#form-field__description').clear().type('Example third event.');
        cy.get('.lt-button--priority').click();

        // Submit Response
        cy.get('[data-cy="submit-or-update-response"]').click();

        // Log Out
        cy.get('[data-cy="authenticated-user-choices"]').click();
        cy.get('.lt-list-item--caution').click();

    });
    it('Filter Using Time', function() {
        cy.login_workspace('student-three');

        cy.get('[data-cy="project-card"]').contains('Activity One').click();
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();
        //Submit a response to be able to see the filter
        cy.get('[data-cy="Response"]').click();
        cy.get('[data-cy="submit-or-update-response"]').click();
        // make sure it saved
        cy.reload();
        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        cy.get('[data-cy="Base Layers"]').click();
        // Make sure all layers are visible
        cy.get('[data-cy="collaborator-response-name"]').should('be.visible');
        cy.get('[data-cy="filter-section"]').should('be.visible');
        cy.get('ul.lt-list-layer').children().should('have.length', 3);
        cy.get('ul.lt-list-layer').children().contains('First Event');
        cy.get('[data-cy="filter_range_1"]').clear().type('2009-12-14');
        cy.get('[data-cy="filter_range_2"]').clear().type('2022-11-24');
        cy.get('[data-cy="search-btn"]').click();
        cy.get('ul.lt-list-layer').children().should('have.length', 2);
        cy.get('ul.lt-list-layer').children().should(
            'not.contain', 'First Event');
    });
    it('Cleanup', function() {
        cy.login('superuser', 'test');

        cy.visit('/admin/main/response/');
        cy.get('input[type="checkbox"]').check().should('be.checked');
        cy.get('[name="action"]').select('delete_selected');
        cy.get('.button').contains('Go').click();
        cy.get('input[value="Yes, I’m sure"]').click();
    });
});