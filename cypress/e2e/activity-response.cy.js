// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Submit_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#View_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Feedback_to_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#View_Feedback_to_Responses

describe('Activity Response Stories', function() {

    it('View the response tab as a contributor', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();

        cy.get('[data-cy="reflection-status"]')
            .contains('You have not submitted your response.');
        cy.get('[data-cy="reflection-status"]')
            .contains('Use this space to craft your response');

        // Verify basics with the layers
        cy.get('[data-cy="add-layer"]').should('be.visible');

        // There should be one Untitled layer, and it should be active
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('have.class', 'lt-list-group--active');

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

        // The reflection text area should be visible
        cy.get('[data-cy="reflection"]')
            .find('.ql-editor').should('be.visible');

        // There should be no feedback
        cy.get('[data-cy="feedback"]')
            .contains('There is no feedback for your response');

        // The draft & submit buttons should be visible
        cy.get('[data-cy="save-as-draft"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]')
            .contains('Submit response');
    });

    it('Interact with the response event layers as a contributor', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();

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
            .should('have.class', 'lt-list-group--active');
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
            .should('not.have.class', 'lt-list-group--active');

        cy.log('Delete the 2nd layer');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-cancel"]').click({force: true});
        cy.get('[data-cy="layer"]').should('have.length', 2);

        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-okay"]').click({force: true});
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');

        cy.log('Delete the 1st layer too');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-delete"]').find('a').click();
        cy.get('[data-cy="confirm-dialog-okay"]').click({force: true});

        cy.log('a new, untitled empty layer is automagically created');
        cy.wait(500); // prevents a detached dom issue
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('Untitled Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('have.class', 'lt-list-group--active');

        // The layer is appearing with visibility off
        // Bug opened. Update this test to check that the "eye" icon is visible
        // rather than the "eye-slash" icon when the bug is fixed.
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye-slash"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');
    });

    it('Save the response as draft', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();

        cy.log('Rename the 1st layer');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').eq(0).click();
        cy.get('[data-cy="layer-rename-title"]').clear().type('First Layer');

        cy.get('[data-cy="layer-rename-save"]').click();
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');
        cy.log('Add some reflection');
        cy.get('[data-cy="reflection"]')
            .find('.ql-editor').clear().type('through the looking glass');

        cy.get('[data-cy="save-as-draft"]').click();
        cy.get('.alert').contains('Your draft response has been saved');
        cy.get('[data-cy="submit-or-update-response"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]')
            .contains('Submit response');
        cy.get('[data-cy="save-as-draft"]').should('be.visible');

        // make sure it saved
        cy.reload();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');
        cy.get('[data-cy="Response"]').click();

        cy.get('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');
        cy.get('[data-cy="reflection"]')
            .find('.ql-editor').contains('through the looking glass');
        cy.get('[data-cy="submit-or-update-response"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]')
            .contains('Submit response');
        cy.get('[data-cy="save-as-draft"]').should('be.visible');
        cy.get('[data-cy="reflection-status"]')
            .contains('You have not submitted your response.');
        cy.get('[data-cy="reflection-status"]')
            .contains('Use this space to craft your response');

        // Verify faculty cannot see the response
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Verify 0 Responses are showing
        cy.get('[data-cy="Responses (0)"]').should('be.visible');
        cy.get('[data-cy="Responses (0)"]').click();
        cy.get('[data-cy="activity-response-count"]')
            .contains('There are 0 responses to this activity');

        // Verify student three cannot see the response
        cy.login_workspace('student-three');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Verify Student One's layer is not in Base Layers
        cy.get('[data-cy="Base Layers"]').click();
        cy.get('[data-cy="layer-title"]')
            .contains('First Layer').should('not.exist');
    });

    it('Submit the response', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();

        cy.get('[data-cy="submit-or-update-response"]').click();
        cy.get('.alert').contains('Your response has been submitted');
        cy.get('[data-cy="save-as-draft"]').should('not.exist');
        cy.get('[data-cy="submit-or-update-response"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]')
            .contains('Update response');

        cy.get('[data-cy="reflection-status"]')
            .contains('Last saved');
        cy.get('[data-cy="reflection-status"]')
            .should('not.contain', 'Use this space to craft your response');

        // make sure it saved
        cy.reload();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');
        cy.get('[data-cy="Response"]').click();

        cy.get('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');
        cy.get('[data-cy="reflection"]')
            .find('.ql-editor').contains('through the looking glass');
        cy.get('[data-cy="submit-or-update-response"]').should('be.visible');
        cy.get('[data-cy="submit-or-update-response"]')
            .contains('Update response');
        cy.get('[data-cy="save-as-draft"]').should('not.exist');
        cy.get('[data-cy="reflection-status"]')
            .contains('Last saved');
        cy.get('[data-cy="reflection-status"]')
            .should('not.contain', 'Use this space to craft your response');
    });

    it('View the submitted response as faculty', function() {
        // Verify faculty can see the response
        cy.login_workspace('faculty-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Verify 1 Responses are showing
        cy.get('[data-cy="Responses (1)"]').should('be.visible');
        cy.get('[data-cy="Responses (1)"]').click({force: true});

        cy.get('[data-cy="activity-response-count"]')
            .contains('There is 1 response to this activity');

        cy.get('[data-cy="response-summary"]')
            .find('[data-cy="contributor"]').contains('Student One');

        cy.get('[data-cy="response-summary"]')
            .find('[data-cy="open-response"]').click();

        cy.get('[data-cy="go-back"]').contains('Return to Responses');
        cy.get('[data-cy="response-by"]').contains('Student One');
        cy.get('[data-cy="response-modified"]').contains('Last modified');

        // check the layers
        cy.get('[data-cy="layer"]').should('have.length', 1);
        cy.get('[data-cy="layer"]').eq(0).find('[data-cy="layer-title"]')
            .contains('First Layer').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .should('not.have.class', 'lt-list-group--active');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt-muted"]')
            .contains('First Layer is empty');

        // Layer should not have visibility contols
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="eye"]').should('not.exist');

        // Layer should be expanded
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt-muted"]').should('be.visible');

        // collapse
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').click({force: true});
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt-muted"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('not.exist');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('be.visible');

        // re-expand
        // and once clicked, no longer visible
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').click();
        // Bug reported -- the layer-prompt is displayed rather than the
        // layer-prompt-muted. Once this bug is fixed, swap the messages.
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-prompt"]').should('be.visible');
        // cy.get('[data-cy="layer"]').eq(0)
        //    .find('[data-cy="layer-prompt-muted"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-down"]').should('be.visible');
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-icon="angle-right"]').should('not.exist');

        // There should be no overflow menu
        cy.get('[data-cy="layer"]').eq(0)
            .find('[data-cy="layer-menu"]').should('not.exist');

        cy.get('[data-cy="contributor-reflection"]')
            .contains('through the looking glass');

        cy.get('[data-cy="feedback-for-contributor"]')
            .contains('Student One');
        cy.get('[data-cy="feedback"]')
            .contains('You haven\'t submitted feedback');

        // Try submitting some feedback
        cy.get('[data-cy="feedback"]').find('.ql-editor')
            .type('feedback occurs when the gain in the signal' +
                  ' loop reaches "unity"');
        cy.get('[data-cy="cancel-feedback"]').click();

        // We should be back in the responses list
        cy.get('[data-cy="activity-response-count"]')
            .contains('There is 1 response to this activity')
            .should('be.visible');

        // Let's try that again'
        cy.get('[data-cy="response-summary"]')
            .find('[data-cy="open-response"]').click();
        cy.get('[data-cy="feedback"]').find('.ql-editor')
            .type('feedback occurs when the gain in the signal' +
                  ' loop reaches "unity"');
        cy.get('[data-cy="send-feedback"]').click();
        cy.get('.alert').contains('Your feedback has been sent');

        // @todo - the buttons should change here, but they aren't doing that
        // A bug was opened. When that's fixed, add additional confirmation
        // tests.
    });

    it('View the submitted response as a fellow contributor', function() {
        // Verify student three cannot see the response
        // @todo - this behavior is changing. Update the test when that happens
        cy.login_workspace('student-three');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Verify Student One's layer is not in Base Layers
        cy.get('[data-cy="Base Layers"]').click();
        cy.get('[data-cy="layer-title"]')
            .contains('First Layer').should('not.exist');

        // Now student-three submitts a response, should now see
        // student-one's layer
        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();
        cy.get('[data-cy="submit-or-update-response"]').click();

        cy.reload();

        // Verify Student One's layer is not in Base Layers
        cy.get('[data-cy="Base Layers"]').click();
        cy.get('[data-cy="collaborator-response-name"]')
            .contains('Response by Student One').should('exist');
        cy.get('[data-cy="layer-title"]')
            .contains('First Layer').should('exist');
    });

    it('Check the feedback', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();

        // Feedback exists
        cy.get('[data-cy="feedback"]').contains('Feedback for you');
        cy.get('[data-cy="feedback"]').contains('Faculty One');
        cy.get('[data-cy="feedback"]').contains(
            'feedback occurs when the gain in the signal' +
            ' loop reaches "unity"');
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
