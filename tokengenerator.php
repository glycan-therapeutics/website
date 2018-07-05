<?php
include '/mc-connector.php';

if(!isset($connection)) {
	$config = parse_ini_file('../dbconfig/config.ini');
	$server = $config['server'];
	$user = $config['user'];
	$pass = $config['pass'];
	$dbname = $config['dbname'];
	$secret = $config['secret'];

	$conn = new mysqli($server, $user, $pass, $dbname);

	if($conn->connect_error) {
		die("Connection failed: ").$conn->connect_error;
	}
}

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$postdata = file_get_contents("php://input");
$input = json_decode($postdata);

//to access table
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//specific area of table
$key = array_shift($request);
	if($key == "login"){
	$ip=$_GET['ip'];
	$email=$_GET['email'];
	$query=$conn->prepare("SELECT login.date, login.login_successful,users.permission, users.FirstName, users.LastName, users.email, users.id, users.verified FROM login INNER JOIN users ON login.email= users.email WHERE date = (SELECT MAX(date) FROM login WHERE(IP = ? AND email=?))");
	$query->bind_param('ss',$ip, $email);
	$query->execute();
	$result = $query->get_result();
	$outp = array();
	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		array_push($outp, $rs);
	}
	$conn->close();
	$data=$outp[0];
	// Create token header as a JSON string
	$header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
	// Create token payload as a JSON string
	$payload = json_encode(['data' => $data]);
	// Encode Header to Base64Url String
	$base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
	// Encode Payload to Base64Url String
	$base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
	$signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
	// Encode Signature to Base64Url String
	$base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
	// Create JWT
	$jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;		
	echo($jwt);
	exit();

}

else if($key=="update"){
	$ip=$_GET['ip'];
	$uid=$_GET['uid'];
	$query=$conn->prepare("SELECT `users:changelog`.date, users.FirstName,users.permission, users.LastName ,users.email, users.id, users.verified FROM `users:changelog` INNER JOIN users ON `users:changelog`.uid= users.id WHERE date = (SELECT MAX(date) FROM `users:changelog` WHERE(IP = ? AND uid=?))");
	$query->bind_param('ss',$ip, $uid);
	$query->execute();
	$result = $query->get_result();
	$outp = array();
	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		array_push($outp, $rs);
	}
	$conn->close();
	$data=$outp[0];
		// Create token header as a JSON string
		$header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
		// Create token payload as a JSON string
		$payload = json_encode(['data' => $data]);
		// Encode Header to Base64Url String
		$base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
		// Encode Payload to Base64Url String
		$base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
		$signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload,"BINGBONG", true);
		// Encode Signature to Base64Url String
		$base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
		// Create JWT
		$jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;		
		echo($jwt);
		exit();
}	
?>