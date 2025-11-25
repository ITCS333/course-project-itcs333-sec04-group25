<?php
/**
 * Student Management API
 * 
 * This is a RESTful API that handles all CRUD operations for student management.
 * It uses PDO to interact with a MySQL database.
 * 
 * Database Table Structure (for reference):
 * Table: students
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - student_id (VARCHAR(50), UNIQUE) - The student's university ID
 *   - name (VARCHAR(100))
 *   - email (VARCHAR(100), UNIQUE)
 *   - password (VARCHAR(255)) - Hashed password
 *   - created_at (TIMESTAMP)
 * 
 * HTTP Methods Supported:
 *   - GET: Retrieve student(s)
 *   - POST: Create a new student OR change password
 *   - PUT: Update an existing student
 *   - DELETE: Delete a student
 * 
 * Response Format: JSON
 */

// TODO: Set headers for JSON response and CORS
// Set Content-Type to application/json
// Allow cross-origin requests (CORS) if needed
// Allow specific HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
// Allow specific headers (Content-Type, Authorization)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


// TODO: Handle preflight OPTIONS request
// If the request method is OPTIONS, return 200 status and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// TODO: Include the database connection class
// Assume the Database class has a method getConnection() that returns a PDO instance
require_once '../../common/db.php';


// TODO: Get the PDO database connection
$db = getConnection();


// TODO: Get the HTTP request method
// Use $_SERVER['REQUEST_METHOD']
$method = $_SERVER['REQUEST_METHOD'];


// TODO: Get the request body for POST and PUT requests
// Use file_get_contents('php://input') to get raw POST data
// Decode JSON data using json_decode()
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);


// TODO: Parse query parameters for filtering and searching
$queryParams = [];
if (isset($_GET['search'])) {
    $queryParams['search'] = $_GET['search'];
}
if (isset($_GET['sort'])) {
    $queryParams['sort'] = $_GET['sort'];
}
if (isset($_GET['order'])) {
    $queryParams['order'] = $_GET['order'];
}



/**
 * Function: Get all students or search for specific students
 * Method: GET
 * 
 * Query Parameters:
 *   - search: Optional search term to filter by name, student_id, or email
 *   - sort: Optional field to sort by (name, student_id, email)
 *   - order: Optional sort order (asc or desc)
 */
function getStudents($db)
{
    // TODO: Check if search parameter exists
    // If yes, prepare SQL query with WHERE clause using LIKE
    // Search should work on name, student_id, and email fields
    global $queryParams;

    // TODO: Check if sort and order parameters exist
    // If yes, add ORDER BY clause to the query
    // Validate sort field to prevent SQL injection (only allow: name, student_id, email)
    // Validate order to prevent SQL injection (only allow: asc, desc)
    $allowedSortFields = ['name', 'student_id', 'email'];
    $allowedSortOrders = ['asc', 'desc'];
    $sortField = isset($queryParams['sort']) && in_array($queryParams['sort'], $allowedSortFields) ? $queryParams['sort'] : null;
    $sortOrder = isset($queryParams['order']) && in_array(strtolower($queryParams['order']), $allowedSortOrders) ? strtolower($queryParams['order']) : 'asc';

    // TODO: Prepare the SQL query using PDO
    // Note: Do NOT select the password field
    $sql = "SELECT id, student_id, name, email, created_at FROM students";
    $params = [];

    // TODO: Bind parameters if using search
    if (isset($queryParams['search'])) {
        $sql .= " WHERE name LIKE :search OR student_id LIKE :search OR email LIKE :search";
        $params[':search'] = '%' . $queryParams['search'] . '%';
    }

    // TODO: Execute the query
    if ($sortField) {
        $sql .= " ORDER BY $sortField $sortOrder";
    }

    // TODO: Fetch all results as an associative array
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // TODO: Return JSON response with success status and data
    echo json_encode([
        'success' => true,
        'data' => $students
    ]);
}


/**
 * Function: Get a single student by student_id
 * Method: GET
 * 
 * Query Parameters:
 *   - student_id: The student's university ID
 */
function getStudentById($db, $studentId)
{
    // TODO: Prepare SQL query to select student by student_id
    $sql = "SELECT id, student_id, name, email, created_at FROM students WHERE student_id = :student_id";

    // TODO: Bind the student_id parameter
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);

    // TODO: Execute the query
    $stmt->execute();

    // TODO: Fetch the result
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    // TODO: Check if student exists

    // If yes, return success response with student data
    // If no, return error response with 404 status
    if ($student) {
        echo json_encode([
            'success' => true,
            'data' => $student
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Student not found'
        ]);
    }
}


/**
 * Function: Create a new student
 * Method: POST
 * 
 * Required JSON Body:
 *   - student_id: The student's university ID (must be unique)
 *   - name: Student's full name
 *   - email: Student's email (must be unique)
 *   - password: Default password (will be hashed)
 */
function createStudent($db, $data)
{
    // TODO: Validate required fields
    // Check if student_id, name, email, and password are provided
    // If any field is missing, return error response with 400 status
    if (!isset($data['student_id'], $data['name'], $data['email'], $data['password'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    // TODO: Sanitize input data
    // Trim whitespace from all fields
    // Validate email format using filter_var()
    $studentId = trim($data['student_id']);
    $name = trim($data['name']);
    $email = trim($data['email']);
    $password = trim($data['password']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // TODO: Check if student_id or email already exists
    // Prepare and execute a SELECT query to check for duplicates
    // If duplicate found, return error response with 409 status (Conflict)
    $sql = "SELECT COUNT(*) FROM students WHERE student_id = :student_id OR email = :email";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $count = $stmt->fetchColumn();
    if ($count > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Student ID or email already exists']);
        exit;
    }

    // TODO: Hash the password
    // Use password_hash() with PASSWORD_DEFAULT
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);


    // TODO: Prepare INSERT query
    $sql = "INSERT INTO students (student_id, name, email, password, created_at) VALUES (:student_id, :name, :email, :password, NOW())";

    // TODO: Bind parameters
    // Bind student_id, name, email, and hashed password
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);

    // TODO: Execute the query
    $stmt->execute();

    // TODO: Check if insert was successful
    // If yes, return success response with 201 status (Created)
    // If no, return error response with 500 status
    if ($stmt->rowCount() > 0) {
        http_response_code(201); // Created
        echo json_encode(['success' => true, 'message' => 'Student created successfully']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to create student']);
    }
}


/**
 * Function: Update an existing student
 * Method: PUT
 * 
 * Required JSON Body:
 *   - student_id: The student's university ID (to identify which student to update)
 *   - name: Updated student name (optional)
 *   - email: Updated student email (optional)
 */
function updateStudent($db, $data)
{
    // TODO: Validate that student_id is provided
    // If not, return error response with 400 status
    if (!isset($data['student_id'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing student_id']);
        exit;
    }

    // TODO: Check if student exists
    // Prepare and execute a SELECT query to find the student
    // If not found, return error response with 404 status
    $studentId = $data['student_id'];
    $sql = "SELECT * FROM students WHERE student_id = :student_id";

    // TODO: Build UPDATE query dynamically based on provided fields
    // Only update fields that are provided in the request
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    // TODO: If email is being updated, check if new email already exists
    // Prepare and execute a SELECT query
    // Exclude the current student from the check
    // If duplicate found, return error response with 409 status
    if (isset($data['email']) && $data['email'] !== $student['email']) {
        $sql = "SELECT COUNT(*) FROM students WHERE email = :email AND student_id != :student_id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        $count = $stmt->fetchColumn();
        if ($count > 0) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }
    }

    // TODO: Bind parameters dynamically
    // Bind only the parameters that are being updated
    $updateFields = [];
    if (isset($data['name'])) {
        $updateFields['name'] = $data['name'];
    }
    if (isset($data['email'])) {
        $updateFields['email'] = $data['email'];
    }
    $setClauses = [];
    foreach ($updateFields as $field => $value) {
        $setClauses[] = "$field = :$field";
    }
    $setClause = implode(', ', $setClauses);
    $sql = "UPDATE students SET $setClause WHERE student_id = :student_id";
    $stmt = $db->prepare($sql);
    foreach ($updateFields as $field => $value) {
        $stmt->bindValue(":$field", $value);
    }
    $stmt->bindValue(':student_id', $studentId);
    $stmt->execute();

    // TODO: Check if update was successful
    // If yes, return success response
    // If no, return error response with 500 status
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to update student']);
    }
}


/**
 * Function: Delete a student
 * Method: DELETE
 * 
 * Query Parameters or JSON Body:
 *   - student_id: The student's university ID
 */
function deleteStudent($db, $studentId)
{
    // TODO: Validate that student_id is provided
    // If not, return error response with 400 status
    if (!$studentId) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing student_id']);
        exit;
    }

    // TODO: Check if student exists
    // Prepare and execute a SELECT query
    // If not found, return error response with 404 status
    $sql = "SELECT * FROM students WHERE student_id = :student_id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    // TODO: Prepare DELETE query
    $sql = "DELETE FROM students WHERE student_id = :student_id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->execute();

    // TODO: Bind the student_id parameter


    // TODO: Execute the query

    // TODO: Check if delete was successful
    // If yes, return success response
    // If no, return error response with 500 status
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to delete student']);
    }
}


/**
 * Function: Change password
 * Method: POST with action=change_password
 * 
 * Required JSON Body:
 *   - student_id: The student's university ID (identifies whose password to change)
 *   - current_password: The student's current password
 *   - new_password: The new password to set
 */
function changePassword($db, $data)
{
    // TODO: Validate required fields
    // Check if student_id, current_password, and new_password are provided
    // If any field is missing, return error response with 400 status
    if (!isset($data['student_id'], $data['current_password'], $data['new_password'])) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    // TODO: Validate new password strength
    // Check minimum length (at least 8 characters)
    // If validation fails, return error response with 400 status
    $newPassword = $data['new_password'];
    if (strlen($newPassword) < 8) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'New password must be at least 8 characters long']);
        exit;
    }

    // TODO: Retrieve current password hash from database
    // Prepare and execute SELECT query to get password
    $studentId = $data['student_id'];
    $sql = "SELECT password FROM students WHERE student_id = :student_id";

    // TODO: Verify current password
    // Use password_verify() to check if current_password matches the hash
    // If verification fails, return error response with 401 status (Unauthorized)
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || !password_verify($data['current_password'], $result['password'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Current password is incorrect']);
        exit;
    }

    // TODO: Hash the new password
    // Use password_hash() with PASSWORD_DEFAULT
    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // TODO: Update password in database
    // Prepare UPDATE query
    $sql = "UPDATE students SET password = :password WHERE student_id = :student_id";

    // TODO: Bind parameters and execute
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':password', $hashedNewPassword);
    $stmt->bindParam(':student_id', $studentId);
    $stmt->execute();

    // TODO: Check if update was successful
    // If yes, return success response
    // If no, return error response with 500 status
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['error' => 'Failed to change password']);
    }
}


// ============================================================================
// MAIN REQUEST ROUTER
// ============================================================================

try {
    // TODO: Route the request based on HTTP method

    if ($method === 'GET') {
        // TODO: Check if student_id is provided in query parameters
        // If yes, call getStudentById()
        // If no, call getStudents() to get all students (with optional search/sort)
        if (isset($_GET['student_id'])) {
            getStudentById($db, $_GET['student_id']);
        } else {
            getStudents($db);
        }

    } elseif ($method === 'POST') {
        // TODO: Check if this is a change password request
        // Look for action=change_password in query parameters
        // If yes, call changePassword()
        // If no, call createStudent()
        if (isset($_GET['action']) && $_GET['action'] === 'change_password') {
            changePassword($db, $data);
        } else {
            createStudent($db, $data);
        }

    } elseif ($method === 'PUT') {
        // TODO: Call updateStudent()
        updateStudent($db, $data);

    } elseif ($method === 'DELETE') {
        // TODO: Get student_id from query parameter or request body
        // Call deleteStudent()
        $studentId = $_GET['student_id'] ?? ($data['student_id'] ?? null);
        deleteStudent($db, $studentId);

    } else {
        // TODO: Return error for unsupported methods
        // Set HTTP status to 405 (Method Not Allowed)
        // Return JSON error message
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    // TODO: Handle database errors
    // Log the error message (optional)
    // Return generic error response with 500 status
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database error occurred']);

} catch (Exception $e) {
    // TODO: Handle general errors
    // Return error response with 500 status
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'An unexpected error occurred']);
}


// ============================================================================
// HELPER FUNCTIONS (Optional but Recommended)
// ============================================================================

/**
 * Helper function to send JSON response
 * 
 * @param mixed $data - Data to send
 * @param int $statusCode - HTTP status code
 */
function sendResponse($data, $statusCode = 200)
{
    // TODO: Set HTTP response code
    http_response_code($statusCode);

    // TODO: Echo JSON encoded data
    echo json_encode($data);

    // TODO: Exit to prevent further execution
    exit();
}


/**
 * Helper function to validate email format
 * 
 * @param string $email - Email address to validate
 * @return bool - True if valid, false otherwise
 */
function validateEmail($email)
{
    // TODO: Use filter_var with FILTER_VALIDATE_EMAIL
    // Return true if valid, false otherwise
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}


/**
 * Helper function to sanitize input
 * 
 * @param string $data - Data to sanitize
 * @return string - Sanitized data
 */
function sanitizeInput($data)
{
    // TODO: Trim whitespace
    // TODO: Strip HTML tags using strip_tags()
    // TODO: Convert special characters using htmlspecialchars()
    // Return sanitized data
    return htmlspecialchars(strip_tags(trim($data)));
}

?>