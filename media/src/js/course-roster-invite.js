import $ from 'jquery';

// UNI field: Add form
$('#uni-invite-form-add-field').on('click', (e) => {
    e.preventDefault();
    const formIdx = $('#id_uni-TOTAL_FORMS').val();
    $('#uni-invite-form-group').append(
        $('#uni-invite-form-template').clone(true, true)
    );

    const newForm = $('#uni-invite-form-group').children().last();
    // Take off the wrapper's id
    newForm.removeAttr('id');
    // Update __prefix__ with the form idx
    const newInputField = newForm.children('input');
    const updatedId = newInputField.attr('id').replace(/__prefix__/g, formIdx);
    newInputField.attr('id', updatedId);
    const updatedName = newInputField.attr('name').replace(
        /__prefix__/g, formIdx);
    newInputField.attr('name', updatedName);

    // Set the focus on the new element
    newInputField.focus();

    // Increment the management form
    $('#id_uni-TOTAL_FORMS').val(parseInt(formIdx) + 1);
});

// Delete form
$('.uni-invite-form-group__button--delete').on('click', (e) => {
    e.preventDefault();
    e.currentTarget.closest('.input-group').remove();
    const formIdx = $('#id_uni-TOTAL_FORMS').val();
    $('#id_uni-TOTAL_FORMS').val(parseInt(formIdx) - 1);
});

// Email field: Add form
$('#email-invite-form-add-field').on('click', (e) => {
    e.preventDefault();
    const formIdx = $('#id_email-TOTAL_FORMS').val();
    $('#email-invite-form-group').append(
        $('#email-invite-form-template').clone(true, true)
    );

    const newForm = $('#email-invite-form-group').children().last();
    // Take off the wrapper's id
    newForm.removeAttr('id');
    // Update __prefix__ with the form idx
    const newInputField = newForm.children('input');
    const updatedId = newInputField.attr('id').replace(/__prefix__/g, formIdx);
    newInputField.attr('id', updatedId);
    const updatedName = newInputField.attr('name').replace(
        /__prefix__/g, formIdx);
    newInputField.attr('name', updatedName);

    // Set the focus on the new element
    newInputField.focus();

    // Increment the management form
    $('#id_email-TOTAL_FORMS').val(parseInt(formIdx) + 1);
});

// Delete form
$('.email-invite-form-group__button--delete').on('click', (e) => {
    e.preventDefault();
    e.currentTarget.closest('.input-group').remove();
    const formIdx = $('#id_email-TOTAL_FORMS').val();
    $('#id_email-TOTAL_FORMS').val(parseInt(formIdx) - 1);
});
