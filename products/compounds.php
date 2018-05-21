<?php
$server = "localhost";
$user = "kliu10";
$pass = "Saweqr1!";
$dbname = "glycan";

$conn = new mysqli($server, $user, $pass, $dbname);

if($conn->connect_error) {
	die("Connection failed: ").$conn->connect_error;
}

if(isset($_SERVER["PATH_INFO"])) {
	$path_components = explode("/", $_SERVER["PATH_INFO"]);
}
else {
	$path_components = null;
}

$input = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] == "POST" && $path_components[2] == "limited") {
	$query = "SELECT * FROM limited ORDER BY compounds.id ASC";
	$result = $conn->query($query);

	$outp = "";
	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		if($outp != "") {
			$outp .= ",";
		}
		$outp .= '{"ID":'.$rs["ID"].'",';
		$outp .= '"Name":"'.$rs["Name"].'",';
		$outp .= '"Structure":"'.$rs["Structure"].'",';
		$outp .= '"Amount":"'.$rs["Amount"].'"}';
	}
}

else if($_SERVER['REQUEST_METHOD'] == "GET") {
	$query = "SELECT * FROM compounds ORDER BY compounds.id ASC";

	$result = $conn->query($query);

	$outp = "";
	while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
		if($outp != "") {
			$outp .= ",";
		}
		$outp .= '{"id":"'.$rs["id"].'",';
		$outp .= '"Family":"'.$rs["Family"].'",';
		$outp .= '"Series":"'.$rs["Series"].'",';
		$outp .= '"Name":"'.$rs["Name"].'",';
		$outp .= '"Structure":"'.$rs["Structure"].'",';
		$outp .= '"Updated":"'.$rs["Updated"].'",';
		$outp .= '"Sizes":"'.$rs["Sizes"].'",';
		$outp .= '"Price":"'.$rs["Price"].'",';
		$outp .= '"Price2":"'.$rs["Price2"].'",';
		$outp .= '"Price3":"'.$rs["Price3"].'",';
		$outp .= '"Keywords":"'.$rs["Keywords"].'"}';
	}

	$outp = '['.$outp.']';
	$conn->close();
	$file = '../products.json';
	file_put_contents($file, $outp);
	echo($outp);
	exit();
}

else if($_SERVER['REQUEST_METHOD'] == "POST") {
	$id = intval($_POST['id']);
	$pid = intval($_POST['pid']);
	$size = intval($_POST['size']);
	$qty = intval($_POST['quantity']);
	$date = date(gmdate('Y-m-d h:i:s'));
	$size_name = $conn->real_escape_string($_POST['size_name']);
	$query = "INSERT INTO tempcart VALUES ($id, $pid, $size, '$size_name', $qty, '$date')";
	$conn->query($query);
	exit();
}
?>
