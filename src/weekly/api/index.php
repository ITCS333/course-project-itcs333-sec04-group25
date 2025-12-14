<?php

/**
 * Weekly Course Breakdown API
 * 
 * This is a RESTful API that handles all CRUD operations for weekly course content
 * and discussion comments. It uses PDO to interact with a MySQL database.
 * 
 * Database Table Structures (for reference):
 * 
 * Table: weeks
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - title (VARCHAR(200))
 *   - start_date (DATE)
 *   - description (TEXT)
 *   - links (TEXT) - JSON encoded array of links
 *   - created_at (TIMESTAMP)
 *   - updated_at (TIMESTAMP)
 * 
 * Table: comments_week
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - week_id (INT) - Foreign key reference to weeks.id
 *   - author (VARCHAR(100))
 *   - text (TEXT)
 *   - created_at (TIMESTAMP)
 * 
 * HTTP Methods Supported:
 *   - GET: Retrieve week(s) or comment(s)
 *   - POST: Create a new week or comment
 *   - PUT: Update an existing week
 *   - DELETE: Delete a week or comment
 * 
 * Response Format: JSON
 */

// ============================================================================
// SETUP AND CONFIGURATION
// ============================================================================

// TODO: Set headers for JSON response and CORS
// Set Content-Type to application/json
// Allow cross-origin requests (CORS) if needed
// Allow specific HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
// Allow specific headers (Content-Type, Authorization)

require_once __DIR__ . '/../../common/DatabaseHelper.php';
require_once __DIR__ . '/../../common/DBConfig.php';
require_once __DIR__ . '/../../common/middlewares.php';
// If requireLogin is not defined in middlewares.php, define a dummy version here for now:
if (!function_exists('requireLogin')) {
    function requireLogin() {
        // Implement your authentication logic here, or leave empty for now
        // Example: throw error if not logged in
        // sendError('Authentication required', 401);
    }
}

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: " . ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// TODO: Handle preflight OPTIONS request
// If the request method is OPTIONS, return 200 status and exit

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// TODO: Include the database connection class
// Assume the Database class has a method getConnection() that returns a PDO instance
// Example: require_once '../config/Database.php';

// TODO: Get the PDO database connection
// Example: $database = new Database();
//          $db = $database->getConnection();



$dbHelper = new DatabaseHelper(
    $config['host'],
    $config['dbname'],
    $config['username'],
    $config['password'],
    $config['options']
);

$db = $dbHelper->getConnection();






// TODO: Get the HTTP request method
// Use $_SERVER['REQUEST_METHOD']

$method = $_SERVER['REQUEST_METHOD'];

// TODO: Get the request body for POST and PUT requests
// Use file_get_contents('php://input') to get raw POST data
// Decode JSON data using json_decode()

$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

// TODO: Parse query parameters
// Get the 'resource' parameter to determine if request is for weeks or comments
// Example: ?resource=weeks or ?resource=comments

$resource = isset($_GET['resource']) ? $_GET['resource'] : 'weeks';

// ============================================================================
// WEEKS CRUD OPERATIONS
// ============================================================================

/**
 * Function: Get all weeks or search for specific weeks
 * Method: GET
 * Resource: weeks
 * 
 * Query Parameters:
 *   - search: Optional search term to filter by title or description
 *   - sort: Optional field to sort by (title, start_date)
 *   - order: Optional sort order (asc or desc, default: asc)
 */
function getAllWeeks($db)
{
    // TODO: Initialize variables for search, sort, and order from query parameters

    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'start_date';
    $order = isset($_GET['order']) ? strtolower($_GET['order']) : 'asc';

    // TODO: Start building the SQL query
    // Base query: SELECT id, title, start_date, description, links, created_at FROM weeks

    $sql = "SELECT id, title, start_date, description, links, created_at FROM weeks";
    $params = [];

    // TODO: Check if search parameter exists
    // If yes, add WHERE clause using LIKE for title and description
    // Example: WHERE title LIKE ? OR description LIKE ?

    if ($search) {
        $sql .= " WHERE title LIKE ? OR description LIKE ?";
        $searchTerm = "%{$search}%";
        $params = [$searchTerm, $searchTerm];
    }

    // TODO: Check if sort parameter exists
    // Validate sort field to prevent SQL injection (only allow: title, start_date, created_at)
    // If invalid, use default sort field (start_date)

    $allowedSorts = ['title', 'start_date', 'created_at'];
    if (!isValidSortField($sort, $allowedSorts)) {
        $sort = 'start_date';
    }

    // TODO: Check if order parameter exists
    // Validate order to prevent SQL injection (only allow: asc, desc)
    // If invalid, use default order (asc)

    if (!in_array($order, ['asc', 'desc'])) {
        $order = 'asc';
    }

    // TODO: Add ORDER BY clause to the query

    $sql .= " ORDER BY {$sort} {$order}";

    // TODO: Prepare the SQL query using PDO

    $stmt = $db->prepare($sql);

    // TODO: Bind parameters if using search
    // Use wildcards for LIKE: "%{$searchTerm}%"

    if ($search) {
        $stmt->execute($params);
    } else {
        $stmt->execute();
    }

    // TODO: Execute the query
    // TODO: Fetch all results as an associative array

    $weeks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // TODO: Process each week's links field
    // Decode the JSON string back to an array using json_decode()

    foreach ($weeks as &$week) {
        if (isset($week['links']) && is_string($week['links'])) {
            $decoded = json_decode($week['links'], true);
            $week['links'] = is_array($decoded) ? $decoded : [];
        } else {
            $week['links'] = [];
        }
    }

    // TODO: Return JSON response with success status and data
    // Use sendResponse() helper function

    sendResponse(['success' => true, 'data' => $weeks]);
}

/**
 * Function: Get a single week by id
 * Method: GET
 * Resource: weeks
 * 
 * Query Parameters:
 *   - id: The unique week identifier
 */
function getWeekById($db, $weekId)
{
    // TODO: Validate that week_id is provided
    // If not, return error response with 400 status

    if (empty($weekId)) {
        sendError('week_id is required', 400);
    }

    // TODO: Prepare SQL query to select week by week_id
    // SELECT id, title, start_date, description, links, created_at FROM weeks WHERE id = ?

    $stmt = $db->prepare("SELECT id, title, start_date, description, links, created_at FROM weeks WHERE id = ?");

    // TODO: Bind the week_id parameter

    $stmt->execute([$weekId]);

    // TODO: Execute the query
    // TODO: Fetch the result

    $week = $stmt->fetch(PDO::FETCH_ASSOC);

    // TODO: Check if week exists
    // If yes, decode the links JSON and return success response with week data
    // If no, return error response with 404 status

    if ($week) {
        if (isset($week['links'])) {
            $week['links'] = json_decode($week['links'], true) ?: [];
        }
        sendResponse(['success' => true, 'data' => $week]);
    } else {
        sendError('Week not found', 404);
    }
}

/**
 * Function: Create a new week
 * Method: POST
 * Resource: weeks
 * 
 * Required JSON Body:
 *   - title: Week title (e.g., "Week 1: Introduction to HTML")
 *   - start_date: Start date in YYYY-MM-DD format
 *   - description: Week description
 *   - links: Array of resource links (will be JSON encoded)
 */
function createWeek($db, $data)
{
    // TODO: Validate required fields
    // Check if title, start_date, and description are provided
    // If any field is missing, return error response with 400 status

    if (empty($data['title']) || empty($data['start_date']) || empty($data['description'])) {
        sendError('Missing required fields: title, start_date, description', 400);
    }

    // TODO: Sanitize input data
    // Trim whitespace from title, description

    $title = sanitizeInput($data['title']);
    $startDate = trim($data['start_date']);
    $description = sanitizeInput($data['description']);

    // TODO: Validate start_date format
    // Use a regex or DateTime::createFromFormat() to verify YYYY-MM-DD format
    // If invalid, return error response with 400 status

    if (!validateDate($startDate)) {
        sendError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // TODO: Check if week_id already exists
    // Prepare and execute a SELECT query to check for duplicates
    // If duplicate found, return error response with 409 status (Conflict)

    // Skip duplicate check for auto-increment ID

    // TODO: Handle links array
    // If links is provided and is an array, encode it to JSON using json_encode()
    // If links is not provided, use an empty array []

    $linksArray = isset($data['links']) && is_array($data['links']) ? $data['links'] : [];
    
    // Validate URLs before encoding
    foreach ($linksArray as $link) {
        if (validateUrl($link) == false) {
            sendResponse(["message" => "Error occurred. This resource link is invalid: $link"], 400);
        }
    }
    
    $links = json_encode($linksArray);
    // TODO: Prepare INSERT query
    // INSERT INTO weeks (title, start_date, description, links) VALUES (?, ?, ?, ?)

    $stmt = $db->prepare("INSERT INTO weeks (title, start_date, description, links) VALUES (?, ?, ?, ?)");

    // TODO: Bind parameters
    // TODO: Execute the query

    $success = $stmt->execute([$title, $startDate, $description, $links]);

    // TODO: Check if insert was successful
    // If yes, return success response with 201 status (Created) and the new week data
    // If no, return error response with 500 status

    if ($success) {
        $newId = $db->lastInsertId();
        $newWeek = [
            'id' => $newId,
            'title' => $title,
            'start_date' => $startDate,
            'description' => $description,
            'links' => json_decode($links, true),
            'created_at' => date('Y-m-d H:i:s')
        ];
        sendResponse(['success' => true, 'data' => $newWeek], 201);
    } else {
        sendError('Failed to create week', 500);
    }
}

/**
 * Function: Update an existing week
 * Method: PUT
 * Resource: weeks
 * 
 * Required JSON Body:
 *   - id: The week identifier (to identify which week to update)
 *   - title: Updated week title (optional)
 *   - start_date: Updated start date (optional)
 *   - description: Updated description (optional)
 *   - links: Updated array of links (optional)
 */
function updateWeek($db, $data)
{
    // TODO: Validate that week_id is provided
    // If not, return error response with 400 status

    if (empty($data['id'])) {
        sendError('id is required', 400);
    }

    // TODO: Check if week exists
    // Prepare and execute a SELECT query to find the week
    // If not found, return error response with 404 status

    $stmt = $db->prepare("SELECT id FROM weeks WHERE id = ?");
    $stmt->execute([$data['id']]);
    if (!$stmt->fetch()) {
        sendError('Week not found', 404);
    }

    // TODO: Build UPDATE query dynamically based on provided fields
    // Initialize an array to hold SET clauses
    // Initialize an array to hold values for binding

    $setClauses = [];
    $params = [];

    // TODO: Check which fields are provided and add to SET clauses
    // If title is provided, add "title = ?"
    // If start_date is provided, validate format and add "start_date = ?"
    // If description is provided, add "description = ?"
    // If links is provided, encode to JSON and add "links = ?"

    if (isset($data['title'])) {
        $setClauses[] = "title = ?";
        $params[] = sanitizeInput($data['title']);
    }

    if (isset($data['start_date'])) {
        if (!validateDate($data['start_date'])) {
            sendError('Invalid date format. Use YYYY-MM-DD', 400);
        }
        $setClauses[] = "start_date = ?";
        $params[] = $data['start_date'];
    }

    if (isset($data['description'])) {
        $setClauses[] = "description = ?";
        $params[] = sanitizeInput($data['description']);
    }

    if (isset($data['links']) && is_array($data['links'])) {
        $setClauses[] = "links = ?";
        $params[] = json_encode($data['links']);
    }

    // TODO: If no fields to update, return error response with 400 status

    if (empty($setClauses)) {
        sendError('No fields to update', 400);
    }

    // TODO: Add updated_at timestamp to SET clauses
    // Add "updated_at = CURRENT_TIMESTAMP"

    $setClauses[] = "updated_at = CURRENT_TIMESTAMP";

    // TODO: Build the complete UPDATE query
    // UPDATE weeks SET [clauses] WHERE id = ?

    $sql = "UPDATE weeks SET " . implode(', ', $setClauses) . " WHERE id = ?";
    $params[] = $data['id'];

    // TODO: Prepare the query
    // TODO: Bind parameters dynamically
    // Bind values array and then bind week_id at the end
    // TODO: Execute the query

    $stmt = $db->prepare($sql);
    $success = $stmt->execute($params);

    // TODO: Check if update was successful
    // If yes, return success response with updated week data
    // If no, return error response with 500 status

    if ($success) {
        // Fetch updated week
        $stmt = $db->prepare("SELECT id, title, start_date, description, links, created_at, updated_at FROM weeks WHERE id = ?");
        $stmt->execute([$data['id']]);
        $week = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($week['links'])) {
            $week['links'] = json_decode($week['links'], true) ?: [];
        }
        sendResponse(['success' => true, 'data' => $week]);
    } else {
        sendError('Failed to update week', 500);
    }
}

/**
 * Function: Delete a week
 * Method: DELETE
 * Resource: weeks
 * 
 * Query Parameters or JSON Body:
 *   - id: The week identifier
 */
function deleteWeek($db, $weekId)
{
    // TODO: Validate that week_id is provided
    // If not, return error response with 400 status

    if (empty($weekId)) {
        sendError('id is required', 400);
    }

    // TODO: Check if week exists
    // Prepare and execute a SELECT query
    // If not found, return error response with 404 status

    $stmt = $db->prepare("SELECT id FROM weeks WHERE id = ?");
    $stmt->execute([$weekId]);
    if (!$stmt->fetch()) {
        sendError('Week not found', 404);
    }

    // TODO: Delete associated comments first (to maintain referential integrity)
    // Prepare DELETE query for comments table
    // DELETE FROM comments_week WHERE week_id = ?
    // TODO: Execute comment deletion query

    $stmt = $db->prepare("DELETE FROM comments_week WHERE week_id = ?");
    $stmt->execute([$weekId]);

    // TODO: Prepare DELETE query for week
    // DELETE FROM weeks WHERE id = ?
    // TODO: Bind the week_id parameter
    // TODO: Execute the query

    $stmt = $db->prepare("DELETE FROM weeks WHERE id = ?");
    $success = $stmt->execute([$weekId]);

    // TODO: Check if delete was successful
    // If yes, return success response with message indicating week and comments deleted
    // If no, return error response with 500 status

    if ($success) {
        sendResponse(['success' => true, 'message' => 'Week and associated comments deleted']);
    } else {
        sendError('Failed to delete week', 500);
    }
}

// ============================================================================
// COMMENTS CRUD OPERATIONS
// ============================================================================

/**
 * Function: Get all comments for a specific week
 * Method: GET
 * Resource: comments
 * 
 * Query Parameters:
 *   - week_id: The week identifier to get comments for
 */
function getCommentsByWeek($db, $weekId)
{
    // TODO: Validate that week_id is provided
    // If not, return error response with 400 status

    if (empty($weekId)) {
        sendError('week_id is required', 400);
    }

    // TODO: Prepare SQL query to select comments for the week
    // SELECT id, week_id, author, text, created_at FROM comments_week WHERE week_id = ? ORDER BY created_at ASC

    $stmt = $db->prepare("SELECT id, week_id, author, text, created_at FROM comments_week WHERE week_id = ? ORDER BY created_at ASC");

    // TODO: Bind the week_id parameter
    // TODO: Execute the query

    $stmt->execute([$weekId]);

    // TODO: Fetch all results as an associative array

    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // TODO: Return JSON response with success status and data
    // Even if no comments exist, return an empty array

    sendResponse(['success' => true, 'data' => $comments]);
}

/**
 * Function: Create a new comment
 * Method: POST
 * Resource: comments
 * 
 * Required JSON Body:
 *   - week_id: The week identifier this comment belongs to
 *   - author: Comment author name
 *   - text: Comment text content
 */
function createComment($db, $data)
{
    // TODO: Validate required fields
    // Check if week_id, author, and text are provided
    // If any field is missing, return error response with 400 status

    if (empty($data['week_id']) || empty($data['author']) || empty($data['text'])) {
        sendError('Missing required fields: week_id, author, text', 400);
    }

    // TODO: Sanitize input data
    // Trim whitespace from all fields

    $weekId = (int)$data['week_id'];
    $author = sanitizeInput($data['author']);
    $text = sanitizeInput($data['text']);

    // TODO: Validate that text is not empty after trimming
    // If empty, return error response with 400 status

    if (empty($text)) {
        sendError('Comment text cannot be empty', 400);
    }

    // TODO: Check if the week exists
    // Prepare and execute a SELECT query on weeks table
    // If week not found, return error response with 404 status

    $stmt = $db->prepare("SELECT id FROM weeks WHERE id = ?");
    $stmt->execute([$weekId]);
    if (!$stmt->fetch()) {
        sendError('Week not found', 404);
    }

    // TODO: Prepare INSERT query
    // INSERT INTO comments_week (week_id, author, text) VALUES (?, ?, ?)

    $stmt = $db->prepare("INSERT INTO comments_week (week_id, author, text) VALUES (?, ?, ?)");

    // TODO: Bind parameters
    // TODO: Execute the query

    $success = $stmt->execute([$weekId, $author, $text]);

    // TODO: Check if insert was successful
    // If yes, get the last insert ID and return success response with 201 status
    // Include the new comment data in the response
    // If no, return error response with 500 status

    if ($success) {
        $newId = $db->lastInsertId();
        $newComment = [
            'id' => $newId,
            'week_id' => $weekId,
            'author' => $author,
            'text' => $text,
            'created_at' => date('Y-m-d H:i:s')
        ];
        sendResponse(['success' => true, 'data' => $newComment], 201);
    } else {
        sendError('Failed to create comment', 500);
    }
}

/**
 * Function: Delete a comment
 * Method: DELETE
 * Resource: comments
 * 
 * Query Parameters or JSON Body:
 *   - id: The comment ID to delete
 */
function deleteComment($db, $commentId)
{
    // TODO: Validate that id is provided
    // If not, return error response with 400 status

    if (empty($commentId)) {
        sendError('Comment ID is required', 400);
    }

    // TODO: Check if comment exists
    // Prepare and execute a SELECT query
    // If not found, return error response with 404 status

    $stmt = $db->prepare("SELECT id FROM comments_week WHERE id = ?");
    $stmt->execute([$commentId]);
    if (!$stmt->fetch()) {
        sendError('Comment not found', 404);
    }

    // TODO: Prepare DELETE query
    // DELETE FROM comments_week WHERE id = ?

    $stmt = $db->prepare("DELETE FROM comments_week WHERE id = ?");

    // TODO: Bind the id parameter
    // TODO: Execute the query

    $success = $stmt->execute([$commentId]);

    // TODO: Check if delete was successful
    // If yes, return success response
    // If no, return error response with 500 status

    if ($success) {
        sendResponse(['success' => true, 'message' => 'Comment deleted']);
    } else {
        sendError('Failed to delete comment', 500);
    }
}

// ============================================================================
// MAIN REQUEST ROUTER
// ============================================================================

try {
    // TODO: Determine the resource type from query parameters
    // Get 'resource' parameter (?resource=weeks or ?resource=comments)
    // If not provided, default to 'weeks'

    // Already done above: $resource = isset($_GET['resource']) ? $_GET['resource'] : 'weeks';

    // Route based on resource type and HTTP method

    // ========== WEEKS ROUTES ==========
    requireLogin();
    if ($resource === 'weeks') {
        if ($method === 'GET') {
            // TODO: Check if week_id is provided in query parameters
            // If yes, call getWeekById()
            // If no, call getAllWeeks() to get all weeks (with optional search/sort)

            if (isset($_GET['id'])) {
                getWeekById($db, $_GET['id']);
            } else {
                getAllWeeks($db);
            }
        } elseif ($method === 'POST') {
            // TODO: Call createWeek() with the decoded request body
            requireAdmin();
            createWeek($db, $data);
        } elseif ($method === 'PUT') {
            // TODO: Call updat            requireAdmin();
            requireAdmin();
            updateWeek($db, $data);
        } elseif ($method === 'DELETE') {
            // TODO: Get week_id from query parameter or request body
            // Call deleteWeek()
            requireAdmin();
            $weekId = isset($_GET['id']) ? $_GET['id'] : ($data['id'] ?? null);
            deleteWeek($db, $weekId);
        } else {
            // TODO: Return error for unsupported methods
            // Set HTTP status to 405 (Method Not Allowed)

            sendError('Method not allowed', 405);
        }
    }

    // ========== COMMENTS ROUTES ==========
    elseif ($resource === 'comments') {

        if ($method === 'GET') {
            // TODO: Get week_id from query parameters
            // Call getCommentsByWeek()

            $weekId = isset($_GET['week_id']) ? $_GET['week_id'] : null;
            getCommentsByWeek($db, $weekId);
        } elseif ($method === 'POST') {
            // TODO: Call createComment() with the decoded request body

            createComment($db, $data);
        } elseif ($method === 'DELETE') {
            // TODO: Get comment id from query parameter or request body
            // Call deleteComment()

            $commentId = isset($_GET['id']) ? $_GET['id'] : ($data['id'] ?? null);
            deleteComment($db, $commentId);
        } else {
            // TODO: Return error for unsupported methods
            // Set HTTP status to 405 (Method Not Allowed)

            sendError('Method not allowed', 405);
        }
    }

    // ========== INVALID RESOURCE ==========
    else {
        // TODO: Return error for invalid resource
        // Set HTTP status to 400 (Bad Request)
        // Return JSON error message: "Invalid resource. Use 'weeks' or 'comments'"

        sendError("Invalid resource. Use 'weeks' or 'comments'", 400);
    }
} catch (PDOException $e) {
    // TODO: Handle database errors
    // Log the error message (optional, for debugging)
    // error_log($e->getMessage());

    // TODO: Return generic error response with 500 status
    // Do NOT expose database error details to the client
    // Return message: "Database error occurred"

    error_log($e->getMessage());
    sendError('Database error occurred', 500);
} catch (Exception $e) {
    // TODO: Handle general errors
    // Log the error message (optional)
    // Return error response with 500 status

    error_log($e->getMessage());
    sendError('An error occurred: ' . $e->getMessage(), 500);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to send JSON response
 * 
 * @param mixed $data - Data to send (will be JSON encoded)
 * @param int $statusCode - HTTP status code (default: 200)
 */
function sendResponse($data, $statusCode = 200)
{
    // TODO: Set HTTP response code
    // Use http_response_code($statusCode)

    http_response_code($statusCode);

    // TODO: Echo JSON encoded data
    // Use json_encode($data)

    echo json_encode($data);

    // TODO: Exit to prevent further execution

    exit();
}

/**
 * Helper function to send error response
 * 
 * @param string $message - Error message
 * @param int $statusCode - HTTP status code
 */
function sendError($message, $statusCode = 400)
{
    // TODO: Create error response array
    // Structure: ['success' => false, 'error' => $message]

    $error = ['success' => false, 'error' => $message];

    // TODO: Call sendResponse() with the error array and status code

    sendResponse($error, $statusCode);
}

/**
 * Helper function to validate date format (YYYY-MM-DD)
 * 
 * @param string $date - Date string to validate
 * @return bool - True if valid, false otherwise
 */
function validateDate($date)
{
    // TODO: Use DateTime::createFromFormat() to validate
    // Format: 'Y-m-d'
    // Check that the created date matches the input string
    // Return true if valid, false otherwise

    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
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

    $data = trim($data);

    // TODO: Strip HTML tags using strip_tags()

    $data = strip_tags($data);

    // TODO: Convert special characters using htmlspecialchars()

    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');

    // TODO: Return sanitized data

    return $data;
}

function validateUrl($url)
{
    // TODO: Use filter_var with FILTER_VALIDATE_URL
    // Return true if valid, false otherwise
    return filter_var($url, FILTER_VALIDATE_URL) !== false; // filter_var returns a string if it is a valid, and returns false if it invalid
}

/**
 * Helper function to validate allowed sort fields
 * 
 * @param string $field - Field name to validate
 * @param array $allowedFields - Array of allowed field names
 * @return bool - True if valid, false otherwise
 */
function isValidSortField($field, $allowedFields)
{
    // TODO: Check if $field exists in $allowedFields array
    // Use in_array()
    // Return true if valid, false otherwise

    return in_array($field, $allowedFields);
}

/**
 * Helper function to validate email format
 * 
 * @param string $email - Email address to validate
 * @return bool - True if valid email format, false otherwise
 */
function validateEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
function verifyPassword($password, $hash)
{
    return password_verify($password, $hash);
}

// Start session for authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Store user session data for tracking (populated by middleware)
$user_id = $_SESSION["user_id"] ?? null;
$is_admin = $_SESSION["is_admin"] ?? 0;