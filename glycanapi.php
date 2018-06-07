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
		if($table == 'users') {
			break;
		}
		else if($table == 'login'){
			$ip=$_GET['ip'];
			$email=$_GET['email'];
			$query=$conn->prepare("SELECT login.date, login.login_successful, users.FirstName, users.LastName , users.id FROM login INNER JOIN users ON login.email= users.email WHERE date = (SELECT MAX(date) FROM login WHERE(IP = ? AND email=?))");
			$query->bind_param('ss',$ip, $email);
			$query->execute();
			$result = $query->get_result();
			$outp = array();

			while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
				array_push($outp, $rs);
			}
			$conn->close();
			echo(json_encode($outp));
			exit();
			break;
		}
		else {
			$query = "SELECT * FROM `$table` ORDER BY `$table`.id ASC";
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
			break;
		}

	case 'POST':
	if($key == "register"){
		$first = $input->firstName;
		$last = $input->lastName;
 		$email = $input->email;
		$password = $input->password;
		$Q1 = $input->Q1;
		$A1 = $input->A1;
		$Q2 = $input->Q2;
		$A2 = $input->A2;
		$date = date("Y-m-d H:i:s");
		$hash = password_hash($password, PASSWORD_BCRYPT, $options);		
			$query ="INSERT INTO users(FirstName, LastName, email, password, created) VALUES (?,?,?,?,?)";	
			$result=$conn->prepare($query);
			$result->bind_param('sssss', $first, $last, $email, $hash, $date);	
			if ($result->execute()) {
				echo "Email successfully registered";
				$query ="INSERT INTO `users:recovery`(UID, Q1, Q2, A1, A2) VALUES ((SELECT id FROM users WHERE email = ?),?,?,?,?)";	
				$result=$conn->prepare($query);
				$result->bind_param('sssss', $email, $Q1, $Q2, $A1, $A2);	
				$result->execute();
			}
			else{
				echo "Email already exists";
			}
		break;
	}		

	else if($key == "login-attempt"){
		$email = $input->email;
		$password = $input->password;
		$ip = $input->ip;
		$date = date("Y-m-d H:i:s");
		$verified = 0;
		$result=$conn->prepare("SELECT password FROM users WHERE email = ?");
		$result->bind_param('s',$email);
		$result->execute();
		$result->bind_result($passwordfromDB);
		while ($result->fetch()) {
			$hashedPasswordFromDB=$passwordfromDB;	
		}

		if (password_verify($password, $hashedPasswordFromDB)) {
			echo 'Password is valid!';
			$verified = 1;
		}		
		$query = "INSERT INTO login(IP, date , email, login_successful) VALUES (?,?,?,?)";	
		$result=$conn->prepare($query);
		$result->bind_param('ssss', $ip, $date, $email, $verified);
		$result->execute();
		break;
	}
	


}

//prints json to be used by JS
if($method == "GET") {
	if($table != "login"){
}
}

//Add a user
else if($method == "POST"){
	$conn->close();
	exit();
}

//login


?>