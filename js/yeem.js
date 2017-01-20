/*global jQuery*/

jQuery(document).ready(function () {
    'use strict';
      
    jQuery(generateForm());
    
    var formID = '1';
    
    //Add field
    jQuery("#add-field a").click(function() {
        event.preventDefault();
        jQuery(addField(jQuery(this).data('type'))).appendTo('#form-fields').hide().slideDown('fast');
        jQuery('#form-fields').sortable();
    });
    
    //Removes fields and choices with animation
    jQuery("#sjfb").on("click", ".delete", function() {
        if (confirm('Are you sure?')) {
            var $this = jQuery(this);
            $this.parent().slideUp( "slow", function() {
                $this.parent().remove()
            });
        }
    });

    //Makes fields required
    jQuery("#sjfb").on("click", ".toggle-required", function() {
        requiredField(jQuery(this));
    });

    //Makes choices selected
    jQuery("#sjfb").on("click", ".toggle-selected", function() {
        selectedChoice(jQuery(this));
    });

    //Adds new choice to field with animation
    jQuery("#sjfb").on("click", ".add-choice", function() {
        jQuery(addChoice()).appendTo(jQuery(this).prev()).hide().slideDown('fast');
        jQuery('.choices ul').sortable();
    });

    //Saving form
    jQuery("#sjfb").submit(function(event) {
        
        event.preventDefault();

        //Loop through fields and save field data to array
        var fields = [];

        jQuery('.field').each(function() {

            var $this = jQuery(this);

            //field type
            var fieldType = $this.data('type');

            //field label
            var fieldLabel = $this.find('.field-label').val();

            //field required
            var fieldReq = $this.hasClass('required') ? 1 : 0;

            //check if this field has choices
            if($this.find('.choices li').length >= 1) {

                var choices = [];

                $this.find('.choices li').each(function() {

                    var $thisChoice = jQuery(this);

                    //choice label
                    var choiceLabel = $thisChoice.find('.choice-label').val();

                    //choice selected
                    var choiceSel = $thisChoice.hasClass('selected') ? 1 : 0;

                    choices.push({
                        label: choiceLabel,
                        sel: choiceSel
                    });

                });
            }

            fields.push({
                type: fieldType,
                label: fieldLabel,
                req: fieldReq,
                choices: choices
            });

        });
        
        var data = JSON.stringify([{"name":"formID","value":formID},{"name":"formFields","value":fields}]);
  
        jQuery.ajax({
            method: "POST",
            url: "../wp-content/plugins/my-contactus/yeem-save-form.php",
            data: data,
            dataType: 'json',
            success: function (msg) {
                console.log(msg);
                jQuery('.alert').removeClass('hide');
                jQuery("html, body").animate({ scrollTop: 0 }, "fast");
            }
        });
    });

    //load saved form
    loadForm();
    
    //Submit form
    jQuery("#mycontactsubmit").click(function(event) {
        
        event.preventDefault();
        var ff = [];
        var email_to;
        
        // Get all the forms elements and their values in one step
        var values = jQuery('#mycontactform').serializeArray(); 
        var bCheckbox = false;
        var sCheckboxLabel = "";
        var sCheckboxValues = "";
        
        jQuery.getJSON('../wp-content/plugins/my-contactus/tmp/form1.txt', function(data) {
            if (data) {
                jQuery.each( data, function( k, v ) { //text
                     if(v['type'] === 'checkbox'){ 
                         bCheckbox = true; 
                         sCheckboxLabel = v['label'];
                     }
                     else{ 
                         if(bCheckbox){
                             sCheckboxValues = sCheckboxValues.substring(0, sCheckboxValues.length - 2);
                             ff.push({
                                name: sCheckboxLabel,
                                value: sCheckboxValues
                             });
                         }
                         bCheckbox = false;
                     }
                     jQuery.each( values, function( i, field ) { //text-12345
                         if(v['type'] === field.name.substring(0, field.name.indexOf('-'))){
                             
                             if(v['type'] === 'email'){ email_to = field.value; } 
                             
                             if(v['type'] === 'select'){    //if same value as placeholder, set to empty
                                 if(v['label'].replace(/\s/g,'') === field.value.replace(/\s/g,'')){ field.value = "";}             
                             }
                             
                             if(bCheckbox){ 
                                 sCheckboxValues += field.value + ", ";
                             }
                             else {
                                 ff.push({
                                    name: v['label'],
                                    value: field.value
                                 });
                             } 
                             
                             field.name = "done" + field.name;
                             
                             if(v['type'] != 'checkbox'){    
                                return false;    
                             }
                             
                            
                         }
                    });   
                });
                
                jQuery.ajax({
                    method: "POST",
                    url: '../wp-admin/admin-ajax.php',
                    data: {action: 'my_sendmail', fields:ff, email_to:email_to},
                    success: function (msg) {
                        jQuery('#ConfirmationMsg').removeClass('hide');
                        msg = msg.substring(0, msg.length-1);
                        jQuery("#ConfirmationMsg").html(msg);
                    }
                });
            }
        });
    
    });
});

//Add field to builder
function addField(fieldType) {

    var hasRequired, hasChoices;
    var includeRequiredHTML = '';
    var includeChoicesHTML = '';

    switch (fieldType) {
        case 'text':
        case 'email':
        case 'date':
            hasRequired = true;
            hasChoices = false;
            break;
        case 'textarea':
            hasRequired = true;
            hasChoices = false;
            break;
        case 'select':
            hasRequired = true;
            hasChoices = true;
            break;
        case 'radio':
            hasRequired = true;
            hasChoices = true;
            break;
        case 'checkbox':
            hasRequired = false;
            hasChoices = true;
            break;
        case 'agree':
            //required "agree to terms" checkbox
            hasRequired = false;
            hasChoices = false;
            break;
    }

    if (hasRequired) {
        includeRequiredHTML = '' +
            ' <label>Required? ' +
            '<input class="toggle-required" type="checkbox">' +
            '</label>'
    }

    if (hasChoices) {
        includeChoicesHTML = '' +
            '<div class="choices">' +
            '<ul></ul>' +
            '<button type="button" class="add-choice">Add Choice</button>' +
            '</div>'
    }

    return '' +
        '<div class="field ui-sortable-handle" data-type="' + fieldType + '">' +
        '<button type="button"  class="delete"> x </button>' +
        '<h4>' + fieldType + ' field</h4>' +
        '<label>Display Text: ' +
        '<input type="text" class="field-label">' +
        '</label>' +
        includeRequiredHTML +
        includeChoicesHTML +
        '</div>'
}

//Make builder field required
function requiredField($this) {
    if (!$this.parents('.field').hasClass('required')) {
        //Field required
        $this.parents('.field').addClass('required');
        $this.attr('checked','checked');
    } else {
        //Field not required
        $this.parents('.field').removeClass('required');
        $this.removeAttr('checked');
    }
}

function selectedChoice($this) {
    if (! $this.parents('li').hasClass('selected')) {

        //Only checkboxes can have more than one item selected at a time
        //If this is not a checkbox group, unselect the choices before selecting
        if ($this.parents('.field').data('type') != 'checkbox') {
            $this.parents('.choices').find('li').removeClass('selected');
            $this.parents('.choices').find('.toggle-selected').not($this).removeAttr('checked');
        }

        //Make selected
        $this.parents('li').addClass('selected');
        $this.attr('checked','checked');

    } else {

        //Unselect
        $this.parents('li').removeClass('selected');
        $this.removeAttr('checked');

    }
}

//Builder HTML for select, radio, and checkbox choices
function addChoice() {
    return '' +
        '<li>' +
        '<label>Choice: ' +
        '<input type="text" class="choice-label">' +
        '</label> ' +
        '<label> Selected? ' +
        '<input class="toggle-selected" type="checkbox">' +
        '</label>' +
        '<button type="button" class="delete">Delete Choice</button>' +
        '</li>'
}

//Loads a saved form from your database into the builder
function loadForm() {
    jQuery.getJSON('../wp-content/plugins/my-contactus/tmp/form1.txt', function(data) {
        if (data) {
            //go through each saved field object and render the builder
            jQuery.each( data, function( k, v ) {
                //Add the field
                jQuery(addField(v['type'])).appendTo('#form-fields').hide().slideDown('fast');
                var $currentField = jQuery('#form-fields .field').last();

                //Add the label
                $currentField.find('.field-label').val(v['label']);

                //Is it required?
                if (v['req']) {
                    requiredField($currentField.find('.toggle-required'));
                }

                //Any choices?
                if (v['choices']) {
                    jQuery.each( v['choices'], function( k, v ) {
                        //add the choices
                        $currentField.find('.choices ul').append(addChoice());

                        //Add the label
                        $currentField.find('.choice-label').last().val(v['label']);

                        //Is it selected?
                        if (v['sel']) {
                            selectedChoice($currentField.find('.toggle-selected').last());
                        }
                    });
                }

            });

            jQuery('#form-fields').sortable({
                tolerance: 'touch',
                drop: function () {
                    alert('delete!');
                }
            });
            jQuery('.choices ul').sortable();
        }
    });
}

//generates the form HTML
function generateForm() {

    //empty out the preview area
    jQuery("#formarea").empty();

    jQuery.getJSON('../wp-content/plugins/my-contactus/tmp/form1.txt', function(data) {
 
        if (data) {
            //go through each saved field object and render the form HTML
            jQuery.each( data, function( k, v ) {

                var fieldType = v['type'];
                var fieldLabel = v['label'];
                
                //Add the field
                jQuery('#formarea').append(addFieldHTML(fieldType));
                var $currentField = jQuery('#formarea p').last();

                //Add the label
                $currentField.find('input').attr("placeholder", fieldLabel);
                $currentField.find('textarea').attr("placeholder", fieldLabel);
                $currentField.find('select').append('<option selected>' + fieldLabel + '</option>');
                $currentField.find('label').text(fieldLabel);
                
                

                //Any choices?
                if (v['choices']) {

                    var uniqueID = Math.floor(Math.random()*999999)+1;

                    jQuery.each( v['choices'], function( k, v ) {

                        if (fieldType == 'select') {
                            //var selected = v['sel'] ? ' selected' : '';
                            //var choiceHTML = '<option' + selected + '>' + v['label'] + '</option>';
                            var choiceHTML = '<option>' + v['label'] + '</option>';
                            $currentField.find(".dropdownselect").append(choiceHTML);
                        }

                        else if (fieldType == 'radio') {
                            var selected = v['sel'] ? ' checked' : '';
                            var choiceHTML = '<input type="radio" name="radio-' + uniqueID + '"' + selected + ' value="' + v['label'] + '">' + v['label'] + '<br />';
                            $currentField.find(".choices").append(choiceHTML);
                        }

                        else if (fieldType == 'checkbox') {
                            var selected = v['sel'] ? ' checked' : '';
                            var choiceHTML = '<input type="checkbox" name="checkbox-' + uniqueID + '[]"' + selected + ' value="' + v['label'] + '">' + v['label'] + '<br />';
                            $currentField.find(".choices").append(choiceHTML);
                        }

                    });
                }

                //Is it required?
                if (v['req']) {
                    if (fieldType == 'text') { $currentField.find("input").prop('required',true) }
                    else if (fieldType == 'email') { $currentField.find("email").prop('required',true) }
                    else if (fieldType == 'date') { $currentField.find("date").prop('required',true) }
                    else if (fieldType == 'textarea') { $currentField.find("textarea").prop('required',true) }
                    else if (fieldType == 'select') { $currentField.find("select").prop('required',true) }
                    else if (fieldType == 'radio') { $currentField.find("input").prop('required',true) }
                }

            });
        }

        //HTML templates for rendering frontend form fields
        function addFieldHTML(fieldType) {

            var uniqueID = Math.floor(Math.random()*999999)+1;

            switch (fieldType) {

                case 'text':
                    return '' +
                        '<p>' +
                        '<input type="text" name="text-' + uniqueID + '" placeholder="" pattern="[a-zA-Z0-9 ]+">' +
                        '</p>';
                    
                case 'email':
                    return '' +
                        '<p>' +
                        '<input type="email" name="email-' + uniqueID + '" placeholder="">' +
                        '</p>';
                
                case 'date':
                    return '' +
                        '<p>' +
                        '<input type="text" class="calendar" id="datepicker1" placeholder="" name="date-' + uniqueID + '" size="20">' +
                        '</p>';

                case 'textarea':
                    return '' +
                        '<p>' +
                        '<textarea name="textarea-' + uniqueID + '" placeholder=""></textarea>' +
                        '</p>';

                case 'select':
                    return '' +
                        '<p class="clearfix">' +
                        '<select name="select-' + uniqueID + '" class="dropdownselect"></select>' +
                        '</p>';

                case 'radio':
                    return '' +
                        '<p>' +
                        '<label></label>' +
                        //'<div class="choices choices-radio"></div>' +
                         '<span class="choices"></span>' +
                        '</p>';

                case 'checkbox':
                    return '' +
                        '<p>' +
                        '<label></label><br />' +
                        //'<p class="choices choices-checkbox"></p>' +
                        '<span class="choices"></span>' +
                        '</p>';

                case 'agree':
                    return '' +
                        '<p id="sjfb-agree-' + uniqueID + '" class="sjfb-field sjfb-agree required-field">' +
                        '<input type="checkbox" required>' +
                        '<label></label>' +
                        '</p>'
            }
        }
    });
    
    
    jQuery("body").on("focus", "#datepicker1", function() {
        jQuery(this).datepicker();
    });
    
    
    
}