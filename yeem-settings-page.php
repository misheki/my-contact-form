<?php

function yeem_plugin_settings() {
	register_setting( 'yeem-plugin-settings-group', 'yeem_email_subject', 'yeem_email_subject_sanitize' );
	register_setting( 'yeem-plugin-settings-group', 'yeem_sender_email_address', 'yeem_sender_email_address_sanitize' );
	register_setting( 'yeem-plugin-settings-group', 'yeem_your_name_or_company', 'yeem_your_name_or_company_sanitize' );
    register_setting( 'yeem-plugin-settings-group', 'yeem_confirmation_msg', 'yeem_confirmation_msg_sanitize' );
    register_setting( 'yeem-plugin-settings-group', 'yeem_email_msg');
}
add_action( 'admin_init', 'yeem_plugin_settings' );

function yeem_add_menu(){
    add_menu_page( 
        'MY Contact Form', 
        'My Contact Form', 
        'manage_options', 
        'my_contact_form_builder', 
        'render_builder_page_callback' 
    );
    add_submenu_page(
        'my_contact_form_builder',
        'Settings', 
        'Settings',
        'manage_options', 
        'my_contact_form_settings',
        'render_settings_page_callback' 
    );
}
add_action('admin_menu', 'yeem_add_menu');

function yeem_email_subject_sanitize($input){
    $input = sanitize_text_field($input);
    return $input;
} 

function yeem_sender_email_address_sanitize($input){
    $input = sanitize_email($input);
    return $input;
} 

function yeem_your_name_or_company_sanitize($input){
    $input = sanitize_text_field($input);
    return $input;
} 

function yeem_confirmation_msg_sanitize($input){
    $input = esc_textarea($input);
    return $input;
} 

function render_builder_page_callback(){
?>

    <h3>This contact form, by default, comes with Name, Email, Start Date of the Trip, Number of People, Number of Days and a message box.</h3>
    <p>Add or remove certain form components as you see fit.  Don't forget to save your work.
    <br /><br />In your page editor for CONTACT US page, type [my_contact_form] in the text area. 

    <hr />
    <div class="alert hide">
        <h2>Success! Form saved.</h2>
    </div>
    <h2>Edit Contact Form</h2>
    <div class="holder">
        <div class="left">
            <h4>Click button to add an item of that type.</h4>      
            <ul id="add-field">
                <li><a id="add-text" data-type="text" href="#">Text Field</a></li>
                <li><a id="add-email" data-type="email" href="#">Email Field</a></li>
                <li><a id="add-date" data-type="date" href="#">Date Field</a></li>
                <li><a id="add-textarea" data-type="textarea" href="#">Comment Box</a></li>
                <li><a id="add-select" data-type="select" href="#">Drop Down Selection</a></li>
                <li><a id="add-radio" data-type="radio" href="#">Radio Buttons</a></li>
                <li><a id="add-checkbox" data-type="checkbox" href="#">Checkboxes</a></li>
                <li><a id="add-agree" data-type="agree" href="#">Agree Box</a></li>
            </ul>  
        </div>
        <div class="right">
            <h3><u>FORM LAYOUT</u><br></h3>
            <form id="sjfb" novalidate>
                <div id="form-fields" class="ui-sortable">
                </div>
                <button type="submit" class="submit">Save Form</button>
            </form>
        </div>
    </div>
<?php
}

function render_settings_page_callback(){
?>

    <h3>MY Contact Form Settings</h3>
    <br>
    <br> 
    <form method="post" action="options.php">
        <?php settings_fields( 'yeem-plugin-settings-group' ); ?>
        <?php do_settings_sections( 'yeem-plugin-settings-group' ); ?>
        <table class="form-table">
            <tr valign="top">
            <th scope="row">Your Name or Company Name</th>
            <td><input type="text" name="yeem_your_name_or_company" value="<?php echo esc_attr( get_option('yeem_your_name_or_company') ); ?>" /></td>
            </tr>

            <tr valign="top">
            <th scope="row">Email Address</th>
            <td><input type="text" name="yeem_sender_email_address" value="<?php echo esc_attr( get_option('yeem_sender_email_address') ); ?>" /></td>
            </tr>

            <tr valign="top">
            <th scope="row">Email Subject</th>
            <td><input type="text" name="yeem_email_subject" value="<?php echo esc_attr( get_option('yeem_email_subject') ); ?>" /></td>
            </tr>
            
            <tr valign="top">
            <th scope="row">Confirmation Message</th>
                <td><textarea rows="10" cols="50" name="yeem_confirmation_msg"><?php echo esc_attr( get_option('yeem_confirmation_msg') ); ?></textarea></td>
            </tr>
            
            <tr valign="top">
            <th scope="row">Email Message</th>
                <td><textarea rows="10" cols="50" name="yeem_email_msg"><?php echo esc_attr( get_option('yeem_email_msg') ); ?></textarea></td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>
      
<?php
}