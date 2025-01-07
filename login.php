<?php
header('Content-Type: application/json');
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "portfolio"; // Parent site database


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the submitted username and password
$user = $_POST['username'];
$pass = $_POST['password'];

// Query to check if the username and password are correct
$sql = "SELECT * FROM users WHERE username = ? AND password = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $user, $pass);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, get their details
    $row = $result->fetch_assoc();
    
    // Store user data in session
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['user_name'] = $row['name'];
    $_SESSION['user_grade'] = $row['grade'];
    $_SESSION['user_town'] = $row['town'];

 // ... store other session variables ...
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $row['id'],
            'name' => $row['name']
        ]
    ]);

    
    // Redirect to the child site with data as query parameters
    header("Location: https://www.esomakids.com/user?user_id=" . $row['id'] . "&user_name=" . $row['name'] . "&user_grade=" . $row['grade'] . "&user_town=" . $row['town']);
    exit();
} else {
    // Invalid login
    echo "Invalid username or password.";
}

$stmt->close();
$conn->close();
?>
