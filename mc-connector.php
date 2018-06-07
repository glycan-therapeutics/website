<?php

class mcApi {
	public function __construct() {
		$apiKey = 'd5397b7a3e2dec9362fb217b37e33835-us18';
		$mcServer = 'https://us18.api.mailchimp.com/3.0/';
		$debug = isset($_POST["debug"])?$_POST["debug"]:0;
	}

	public function subscribe($email, $firstn, $lastn, $listid) {
		$auth = base64_encode('user:'.$apiKey);
		$data = array(
				'apikey' => $apikey,
				'email_address' => $email,
			    'status'		=> 'subscribed',
				'merge_fields'	=>  array(
						'FNAME' =>  $fname,
						'LNAME' =>  $lastn
									)
				);
		$json_data = json_encode($data);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $mcServer.'lists/'.$listid.'/members/');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Basic '.$auth));
		curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-MCAPI/2.0');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 10);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);

		$result = curl_exec($ch);

		if($debug) {
			var_dump($result);
			die("A HA HA HA HA HA HA -Tidus");
		}
		die();
	}
}

?>
