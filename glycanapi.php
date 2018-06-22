<?php
include '/mc-connector.php';
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
		}
		else if($table == 'blog'){
			if($key == 'page'){
			$lowerlimit=$_GET['lowerlimit'];
			$upperlimit=$_GET['upperlimit'];
			$query=$conn->prepare("SELECT * FROM `blog` WHERE id > ? AND id < ?");
			$query->bind_param('ii', $lowerlimit, $upperlimit);
			$query->execute();
			$result = $query->get_result();
			$outp = array();
			while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
				array_push($outp, $rs);
			}
			$conn->close();
			echo(json_encode($outp));
			exit();
			}
			else if($key=='recent'){
				$query = "SELECT * FROM `blog` WHERE id = (Select MAX(`id`) FROM `blog`)";				
			}
			else if($key=='total'){
				$query = "SELECT * FROM `$table` ORDER BY `$table`.id ASC";	
			}

		}
		else {
			$query = "SELECT * FROM `$table` ORDER BY `$table`.id ASC";
		}
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
		else if($table == 'blog'){
			$title = $input->title;
			$content = $input->content;
			$source = $input->source;
			$uid = $input->uid;
			$permission = $input->permission;
			$date = date("Y-m-d");
			if(trim($permission) === "admin"){
				$query = "INSERT INTO blog(uid, date , title, content,source) VALUES (?,?,?,?,?)";	
				$result=$conn->prepare($query);
				$result->bind_param('issss', $uid, $date, $title, $content ,$source);
				if($result->execute())
					echo("post successful");
				else{
					echo("failed to post");
				}
			}
			else{
				echo("You should not be here");	
			}
		}

		else if($table == 'users') {
			if($key == "register"){
				$first = $input->firstName;
				$last = $input->lastName;
	 			$email = $input->email;
				$password = $input->password;
				$subscribe = $input->subscribe;
				$mc = new mcApi();
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
						if($result->execute() && $subscribe) {
							$mc->subscribe($email, $first, $last, '068752b958');
						}	
					}
					else {
						echo "Email already exists";
					}
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
			}
			
		else if($key == "updateUser"){
			$target= $input->target;
			$uid = $input->uid;
			$ip = $input->ip;
			$date = date("Y-m-d H:i:s");
			if($target=="Name"){
				$firstNameChange = $input->firstNameChange;
				$lastNameChange = $input->lastNameChange;
				$query = "INSERT INTO `users:changelog`(UID, IP, Target, PrevValue, date) VALUES (?,?,?,(SELECT concat(FirstName,' ',LastName) FROM users where id = ?),?)";	
				$result=$conn->prepare($query);
				$result->bind_param('sssss', $uid, $ip, $target, $uid, $date);
				$result->execute();
				$query = "UPDATE users SET FirstName = ?, LastName= ? WHERE id =?";	
				$result=$conn->prepare($query);
				$result->bind_param('sss', $firstNameChange ,$lastNameChange, $uid);
				$result->execute();		
				echo 'Name updated!';
			}
			else if($target=="Email"){
				$emailChange = $input->emailChange;
				$query = "INSERT INTO `users:changelog`(UID, IP, Target, PrevValue, date) VALUES (?,?,?,(SELECT email FROM users where id = ?),?)";	
				$result=$conn->prepare($query);
				$result->bind_param('sssss', $uid, $ip, $target, $uid, $date);
				$result->execute();
				$query = "UPDATE users SET email=? WHERE id =?";	
				$result=$conn->prepare($query);
				$result->bind_param('ss', $emailChange , $uid);
				if($result->execute()){		
					echo 'Email updated!';
			}
				else{
					echo 'Email already in use';
				}	
			}
			else if($target=="Password"){
				$passwordChange = $input->passwordChange;
				$hash = password_hash($passwordChange, PASSWORD_BCRYPT, $options);		
				$oldPassword = $input->oldPassword;
				$result=$conn->prepare("SELECT password FROM users WHERE id = ?");
				$result->bind_param('s',$uid);
				$result->execute();
				$result->bind_result($passwordfromDB);
				while ($result->fetch()) {
					$hashedPasswordFromDB=$passwordfromDB;	
				}
				if (password_verify($oldPassword, $hashedPasswordFromDB)) {						
					echo 'Password updated!';
					$query = "INSERT INTO `users:changelog`(UID, IP, Target, PrevValue, date) VALUES (?,?,?,(SELECT password FROM users where id = ?),?)";	
					$result=$conn->prepare($query);
					$result->bind_param('sssss', $uid, $ip, $target, $uid, $date);
					$result->execute();
					$query = "UPDATE users SET password=? WHERE id =?";	
					$result=$conn->prepare($query);
					$result->bind_param('ss', $hash, $uid);
					$result->execute();		
				}		
		
				else{
					echo 'Password is incorrect';
				}	
			}	
		}
	}	
		break;
	$conn->close();
	exit();
}		
?>