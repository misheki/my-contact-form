<?php
/*
Plugin Name: MY Contact Form Plugin
Plugin URI: http://www.michelleanneyee.com
Description: Simple customizable contact form builder 
Version: 1.0
Author: Michelle Anne Yee
Author URI: http://www.michelleanneyee.com
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}
require 'yeem-settings-page.php';

function yeem_enqueue_scripts() {
    wp_enqueue_script('yeem-js',plugins_url('js/yeem.js', __FILE__), array('jquery', 'jquery-ui-datepicker'), 1.1, true);
    wp_enqueue_script('jquery-ui','http://code.jquery.com/ui/1.11.1/jquery-ui.js');
    wp_enqueue_style('jquery-style','https://ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/themes/smoothness/jquery-ui.css');
    wp_enqueue_style('bootstrap-style','https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css');
    wp_enqueue_style('yeem-css',plugins_url('css/style.css', __FILE__));
    wp_localize_script( 'ajax-script', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
}
add_action('wp_enqueue_scripts', 'yeem_enqueue_scripts');
add_action('admin_enqueue_scripts', 'yeem_enqueue_scripts');

function yeem_display_form() {
    ?>
    <form id="mycontactform" class="contactform" novalidate>
        <div id="formarea">

        </div>
        <div id="ConfirmationMsg" class="hide"></div>
        <p>
            <input type="submit" id="mycontactsubmit" name="submitted" class="contact-submit" value="Send">
        </p>
	</form>

	
<?php
}

function yeem_wp_mail_from( $original_email_address ) {
	return esc_attr( get_option('yeem_sender_email_address'));
}
add_filter( 'wp_mail_from', 'yeem_wp_mail_from' );

function yeem_wp_mail_from_name( $original_email_from ) {
	return esc_attr( get_option('yeem_your_name_or_company'));
}
add_filter( 'wp_mail_from_name', 'yeem_wp_mail_from_name' );

function yeem_set_content_type(){
    return "text/html";
}
add_filter( 'wp_mail_content_type','yeem_set_content_type' );

function my_sendmail() {    
    $subject = esc_attr( get_option('yeem_email_subject'));
    $to   = get_option(yeem_sender_email_address) . ", " . sanitize_email( $_POST["email_to"] );
    
    $message = get_option('yeem_email_msg') .
            " <br><br><br>" .
                "<table style='border: 2px solid #000000;'><th colspan='2' style='padding:5px; border: 2px solid #000000;'>Requirements</th>";
    
    
    $fields = $_POST['fields'];
    
    foreach($fields as $field)
    {
        $message .= "<tr><td style='padding:5px; border: 2px solid #000000; width:30%;'><b>" . sanitize_text_field($field['name']) . 
            " </b></td><td style='padding:5px; border: 2px solid #000000; width:60%; word-wrap:break-word;'> " . sanitize_text_field($field['value']) . "</td></tr>";
    }
    
    $message .= "</table>";
    
    //echo $message;
    
    //$headers = "From: $name <$email>" . "\r\n";

    // If email has been process for sending, display a success message
    if ( wp_mail( $to, $subject, $message, $headers ) ) {
        echo '<div>';
        echo esc_attr( get_option('yeem_confirmation_msg'));
        echo '</div>';
    } else {
        echo 'An unexpected error occurred';
    }
    exit();
}
add_action( 'wp_ajax_my_sendmail', 'my_sendmail' );
add_action( 'wp_ajax_nopriv_my_sendmail', 'my_sendmail' );


function yeem_my_shortcode() {
	ob_start();
	//yeem_send_mail();
	yeem_display_form();
	return ob_get_clean();
}

add_shortcode( 'my_contact_form', 'yeem_my_shortcode' );

?>