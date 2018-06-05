<?php
if(!isset($connection)) {
	$config = parse_ini_file('../dbconfig/config.ini');
	$server = $config['server'];
	$user = $config['user'];
	$pass = $config['pass'];
	$dbname = $config['dbname'];

	$conn = new mysqli($server, $user, $pass, $dbname);

	if($conn->connect_error) {
		die("Connection failed: ").$conn->connect_error;
	}
}

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$input = json_decode(file_get_contents("php://input"));

//to access table
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//specific area of table
$key = array_shift($request);

$query = '';

//decides which query is used
switch($method) {
	case 'GET':
		if($table == 'synthesis') {
			$query = "SELECT * FROM `$table` WHERE UID = $key";
		}
		else {
			$query = "SELECT * FROM `$table` ORDER BY `$table`.id ASC";
		}
		break;
	case 'POST':
		if($table == 'synthesis') {
			if($key == 'delete') {
				$id = $input->id;
				$date_deleted = date("Y-m-d H:i:s");
				$query = "INSERT INTO `synthesis:deleted` VALUES ( (SELECT ID FROM synthesis WHERE id=$id), (SELECT UID FROM synthesis WHERE id=$id), (SELECT Structure FROM synthesis WHERE id=$id), (SELECT Date_Created FROM synthesis WHERE id=$id), '$date_deleted');";
				$conn->query($query);
				$query = "DELETE FROM synthesis WHERE id=?";
				$result = $conn->prepare($query);
				$result->bind_param('s', $id);
				$result->execute();
			}
			else {
				$uid = $input->uid;
				$structure = $input->structure;
				$date = date("Y-m-d H:i:s");
				$query = "INSERT INTO `$table` (UID, Structure, Date_Created) VALUES (?, ?, ?)";
				$result = $conn->prepare($query);
				$result->bind_param('iss', $uid, $structure, $date);
				$result->execute();
			}
		}
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

else if($method == "POST") {
	$conn->close();
	exit();
}
?>