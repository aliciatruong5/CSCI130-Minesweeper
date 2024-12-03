<?php
// database configuration
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "user_accounts";

// create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// check if form data is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = htmlspecialchars(trim($_POST['fname']));
    $lastName = htmlspecialchars(trim($_POST['lname']));
    $email = htmlspecialchars(trim($_POST['email']));
    $password = htmlspecialchars(trim($_POST['password']));

    // hash the password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // insert data into SQL
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $firstName, $lastName, $email, $hashedPassword);

    // execute the statement
    if ($stmt->execute()) {
        echo "Account created successfully!";
    } else {
        if ($conn->errno === 1062) { // duplicate entry error code
            echo "Error: This email is already registered.";
        } else {
            echo "Error: " . $stmt->error;
        }
    }

    // close the statement and connection
    $stmt->close();
    $conn->close();
}
?>
