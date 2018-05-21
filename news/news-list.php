<?php
$server = "localhost";
$user = "kliu10";
$pass = "Saweqr1!";
$dbname = "glycan";

$conn = new mysqli($server, $user, $pass, $dbname);

if($conn->connect_error) {
	die("Connection failed: ").$conn->connect_error;
}

$input = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] == "GET") {
	$query = "SELECT * FROM `news` ORDER BY `news`.id DESC";
	$result = $conn->query($query);
	$outp = array();

	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		array_push($outp, $rs);
	}
	
	$conn->close();
	echo(json_encode($outp));
	exit();
}
?>