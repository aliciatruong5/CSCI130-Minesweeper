<?php
// Start session to handle error/success messages
session_start();

// Database configuration
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "user_accounts";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form data is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Input sanitization
    $firstName = htmlspecialchars(trim($_POST['fname']));
    $lastName = htmlspecialchars(trim($_POST['lname']));
    $email = htmlspecialchars(trim($_POST['email']));
    $password = htmlspecialchars(trim($_POST['password']));

    // Validate email only
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['error'] = "Invalid email format.";
    } else {
        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insert into the database
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $email, $hashedPassword);

        if ($stmt->execute()) {
            $_SESSION['success'] = "Account created successfully!";
        } else {
            if ($conn->errno === 1062) { // Duplicate email
                $_SESSION['error'] = "This email is already registered.";
            } else {
                $_SESSION['error'] = "Database error: " . $stmt->error;
            }
        }

        $stmt->close();
    }

    $conn->close();

    // Redirect to signup form
    header("Location: signup.html");
    exit();
}
?>
