// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Edit_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Submit_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Delete_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#View_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#Create_Feedback_to_Responses
// https://wiki.ctl.columbia.edu/index.php/Locus_Tempus:_First_Pass_QA_Script#View_Feedback_to_Responses

describe('Activity Response Stories', function() {

    it('Create a response as a contributor', function() {
        cy.login_workspace('student-one');

        // Navigates to project detail
        cy.get('[data-cy="project-card"]').contains('Activity One').click();

        // Wait for the loading icon to go away
        cy.get('[data-cy="loading-modal"]').should('be.visible');
        cy.get('[data-cy="loading-modal"]').should('not.exist');

        // Navigate to the response tab
        cy.get('[data-cy="Response"]').click();
    });
});