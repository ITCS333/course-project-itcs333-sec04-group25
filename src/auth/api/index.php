<?php
/**
 * Authentication Handler for Login Form
 * 
 * This PHP script handles user authentication via POST requests from the Fetch API.
 * It validates credentials against a MySQL database using PDO,
 * creates sessions, and returns JSON responses.
 */

// --- Configure session for cross-origin (MUST be before session_start) ---
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => false, // Set to true if using HTTPS
    'httponly' => true,
    'samesite' => 'Lax' // Use Lax for HTTP, None requires HTTPS
]);

// --- Session Management ---
// TODO: Start a PHP session using session_start()
// This must be called before any output is sent to the browser
// Sessions allow us to store user data across multiple pages
session_start();


// --- Set Response Headers ---
// TODO: Set the Content-Type header to 'application/json'
// This tells the browser that we're sending JSON data back
header('Content-Type: application/json');


// TODO: (Optional) Set CORS headers if your frontend and backend are on different domains
// You'll need headers for Access-Control-Allow-Origin, Methods, and Headers
header('Access-Control-Allow-Origin: http://localhost:5173'); // Adjust the origin as needed
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true'); // Required to send cookies cross-origin


// --- Check Request Method ---
// TODO: Verify that the request method is POST
// Use the $_SERVER superglobal to check the REQUEST_METHOD
// If the request is not POST, return an error response and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// --- Get POST Data ---
// TODO: Retrieve the raw POST data
// The Fetch API sends JSON data in the request body
// Use file_get_contents with 'php://input' to read the raw request body
$rawData = file_get_contents('php://input');


// TODO: Decode the JSON data into a PHP associative array
// Use json_decode with the second parameter set to true
$data = json_decode($rawData, true);

// TODO: Extract the email and password from the decoded data
// Check if both 'email' and 'password' keys exist in the array
// If either is missing, return an error response and exit
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}


// TODO: Store the email and password in variables
// Trim any whitespace from the email
$email = trim($data['email']);
$password = $data['password'];


// --- Server-Side Validation (Optional but Recommended) ---
// TODO: Validate the email format on the server side
// Use the appropriate filter function for email validation
// If invalid, return an error response and exit
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}


// TODO: Validate the password length (minimum 8 characters)
// If invalid, return an error response and exit
if (strlen($password) < 8) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Password must be at least 8 characters long']);
    exit;
}

// --- Database Connection ---
// TODO: Get the database connection using the provided function
// Assume getDBConnection() returns a PDO instance with error mode set to exception
// The function is defined elsewhere (e.g., in a config file or db.php)
require_once '../../common/DatabaseHelper.php';
require_once '../../common/DBConfig.php';

$dbHelper = new DatabaseHelper(
    $config['host'],
    $config['dbname'],
    $config['username'],
    $config['password'],
    $config['options']
);
$db = $dbHelper->getConnection();


// TODO: Wrap database operations in a try-catch block to handle PDO exceptions
// This ensures you can return a proper JSON error response if something goes wrong
try {

    // --- Prepare SQL Query ---
// TODO: Write a SQL SELECT query to find the user by email
// Select the following columns: id, name, email, password
// Use a WHERE clause to filter by email
// IMPORTANT: Use a placeholder (? or :email) for the email value
// This prevents SQL injection attacks
    $sql = "SELECT id, name, email, is_admin, password FROM users WHERE email = :email";


    // --- Prepare the Statement ---
// TODO: Prepare the SQL statement using the PDO prepare method
// Store the result in a variable
// Prepared statements protect against SQL injection
    $stmt = $db->prepare($sql);


    // --- Execute the Query ---
// TODO: Execute the prepared statement with the email parameter
// Bind the email value to the placeholder
    $stmt->execute([':email' => $email]);


    // --- Fetch User Data ---
// TODO: Fetch the user record from the database
// Use the fetch method with PDO::FETCH_ASSOC
// This returns an associative array of the user data, or false if no user found
    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    // --- Verify User Exists and Password Matches ---
// TODO: Check if a user was found
// The fetch method returns false if no record matches
    if ($user) {
        // TODO: If user exists, verify the password
        // Use password_verify() to compare the submitted password with the hashed password from database
        // This function returns true if they match, false otherwise
        //
        // NOTE: This assumes passwords are stored as hashes using password_hash()
        // Never store passwords in plain text!
        if (password_verify($password, $user['password'])) {


            // --- Handle Successful Authentication ---
// TODO: If password verification succeeds:

            // TODO: Store user information in session variables
            // Store: user_id, user_name, user_email, logged_in
            // DO NOT store the password in the session!
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in'] = true;
            $_SESSION['is_admin'] = $user['is_admin'];


            // TODO: Prepare a success response array
            // Include:
            // - 'success' => true
            // - 'message' => 'Login successful'
            // - 'user' => array with safe user details (id, name, email)
            //
            // IMPORTANT: Do NOT include the password in the response
            $response = [
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email']
                ]
            ];

            // TODO: Encode the response array as JSON and echo it
            http_response_code(200);
            echo json_encode($response);

            // TODO: Exit the script to prevent further execution
            exit;
        } else {


            // --- Handle Failed Authentication ---
// TODO: If user doesn't exist OR password verification fails:
            // TODO: Prepare an error response array
            // Include:
            // - 'success' => false
            // - 'message' => 'Invalid email or password'
            //
            // SECURITY NOTE: Don't specify whether email or password was wrong
            // This prevents attackers from enumerating valid email addresses
            http_response_code(401);
            $response = [
                'success' => false,
                'message' => 'Invalid email or password'
            ];

            // TODO: Encode the error response as JSON and echo it
            echo json_encode($response);

            // TODO: Exit the script
            exit;
        }
    } else {
        // User not found
        http_response_code(401);
        $response = [
            'success' => false,
            'message' => 'Invalid email or password'
        ];
        echo json_encode($response);
        exit;
    }


    // TODO: Catch PDO exceptions in the catch block
// Catch PDOException type
} catch (PDOException $e) {
    // TODO: Log the error for debugging
    // Use error_log() to write the error message to the server error log
    error_log('Database error: ' . $e->getMessage());

    // TODO: Return a generic error message to the client
    // DON'T expose database details to the user for security reasons
    // Return a JSON response with success false and a generic message
    http_response_code(500);
    $response = [
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ];
    echo json_encode($response);

    // TODO: Exit the script
    exit;
}


// --- End of Script ---

?>