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
$postdata = file_get_contents("php://input");
$input = json_decode($postdata);

//to access table
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//specific area of table
$key = array_shift($request);

$options = [
	'cost' => 11,
];

//decides which query is used
switch($method) {
	case 'GET':
		if($table == 'synthesis') {
			$query = "SELECT * FROM `$table` WHERE UID = $key";
		}
		else if($table == 'users') {
			break;
		}
		else if($table == 'login') {
			$ip = $_GET['ip'];
			$email = $_GET['email'];
			$query = "SELECT login.date, login.login_successful, users.FirstName, users.LastName , users.id FROM login INNER JOIN users ON login.email= users.email WHERE date = ( SELECT MAX(date) FROM login WHERE(IP = '$ip' AND email='$email') )";
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
		else if($table == 'users') {
			if($key == "register") {
				$first = $input->firstName;
				$last = $input->lastName;
		 		$email = $input->email;
				$password = $input->password;
				$date = date("Y-m-d H:i:s");
				$hash = password_hash($password, PASSWORD_BCRYPT, $options);		
				$query ="INSERT INTO users(FirstName, LastName, email, password, created) VALUES (?,?,?,?,?)";	
				$result=$conn->prepare($query);
				$result->bind_param('sssss', $first, $last, $email, $hash, $date);	
				if ($result->execute()) {
					echo "Email successfully registered";
				}
				else {
					echo "Email already exists";
				}
			}		

			else if($key == "login-attempt") {
				$email = $input->email;
				$password = $input->password;
				$ip = $input->ip;
				$date = date("Y-m-d H:i:s");
				$verified = 0;
				$hashedPasswordFromDB=$conn->query("SELECT password FROM users WHERE email = '$email'")->fetch_object()->password;
				if (password_verify($password, $hashedPasswordFromDB)) {
					echo 'Password is valid!';
					$verified = 1;
				}		
				$query = "INSERT INTO login(IP, date , email, login_successful) VALUES (?,?,?,?)";	
				$result=$conn->prepare($query);
				$result->bind_param('ssss', $ip, $date, $email, $verified);
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

//Add a user
else if($method == "POST"){
	$conn->close();
	exit();
}
?>