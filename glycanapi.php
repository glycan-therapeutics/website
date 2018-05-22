<?php
$server = "localhost";
$user = "kliu10";
$pass = "Saweqr1!";
$dbname = "glycan";

$conn = new mysqli($server, $user, $pass, $dbname);

if($conn->connect_error) {
	die("Connection failed: ").$conn->connect_error;
}

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$input = json_decode(file_get_contents("php://input"));

//to access table
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//specific area of table
$key = array_shift($request)+0;

//decides which query is used
switch($method) {
	case 'GET':
		$query = "SELECT * FROM `$table` ORDER BY `$table`.id ASC";
		break;
}

//prints json to be used by JS
if($method == "GET") {
	$result = $conn->query($query);
	if(!$result) {
		http_response_code(404);
		die($conn->error);
	}
	$outp = array();

	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		array_push($outp, $rs);
	}
	
	$conn->close();
	echo(json_encode($outp));
	exit();
}
?>