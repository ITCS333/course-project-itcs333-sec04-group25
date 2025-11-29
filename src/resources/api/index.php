<?php

/**
 * Course Resources API
 * 
 * This is a RESTful API that handles all CRUD operations for course resources 
 * and their associated comments/discussions.
 * It uses PDO to interact with a MySQL database.
 * 
 * Database Table Structures (for reference):
 * 
 * Table: resources
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - title (VARCHAR(255))
 *   - description (TEXT)
 *   - link (VARCHAR(500))
 *   - created_at (TIMESTAMP)
 * 
 * Table: comments
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - resource_id (INT, FOREIGN KEY references resources.id)
 *   - author (VARCHAR(100))
 *   - text (TEXT)
 *   - created_at (TIMESTAMP)
 * 
 * HTTP Methods Supported:
 *   - GET: Retrieve resource(s) or comment(s)
 *   - POST: Create a new resource or comment
 *   - PUT: Update an existing resource
 *   - DELETE: Delete a resource or comment
 * 
 * Response Format: JSON
 * 
 * API Endpoints:
 *   Resources:
 *     GET    /api/resources.php                    - Get all resources
 *     GET    /api/resources.php?id={id}           - Get single resource by ID
 *     POST   /api/resources.php                    - Create new resource
 *     PUT    /api/resources.php                    - Update resource
 *     DELETE /api/resources.php?id={id}           - Delete resource
 * 
 *   Comments:
 *     GET    /api/resources.php?resource_id={id}&action=comments  - Get comments for resource
 *     POST   /api/resources.php?action=comment                    - Create new comment
 *     DELETE /api/resources.php?comment_id={id}&action=delete_comment - Delete comment
 */

// ============================================================================
// HEADERS AND INITIALIZATION
// ============================================================================

// TODO: Include the database connection class
// Assume the Database class has a method getConnection() that returns a PDO instance
// Example: require_once '../config/Database.php';
require_once __DIR__ . '/../../common/DatabaseHelper.php';
require_once __DIR__ . '/../../common/DBConfig.php';

// TODO: Set headers for JSON response and CORS
// Set Content-Type to application/json
// Allow cross-origin requests (CORS) if needed
// Allow specific HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
// Allow specific headers (Content-Type, Authorization)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: " . ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173'));
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, PATCH, DELETE");
header("Access-Control-Allow-Credentials: true");

// TODO: Handle preflight OPTIONS request
// If the request method is OPTIONS, return 200 status and exit
if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit; // Retuns 200 reponse code with empty reponse body
}


$user_id =$_SESSION["user_id"];

// TODO: Get the PDO database connection
// Example: $database = new Database();
// Example: $db = $database->getConnection();
$database = new DatabaseHelper($config['host'], $config['dbname'], $config['username'], $config['password'], $config['options']);
$db = $database->getConnection();


// TODO: Get the HTTP request method
// Use $_SERVER['REQUEST_METHOD']
$method = $_SERVER['REQUEST_METHOD'];

// TODO: Get the request body for POST and PUT requests
// Use file_get_contents('php://input') to get raw POST data
// Decode JSON data using json_decode() with associative array parameter
if ($method === "POST" || $method === "PUT") {
    $rawBody = file_get_contents("php://input"); //Because PHP only fills $_POST when the request content-type is:application/x-www-form-urlencoded or multipart/form-data
    $jsonBody = json_decode($rawBody, true);
}



// TODO: Parse query parameters
// Get 'action', 'id', 'resource_id', 'comment_id' from $_GET
$action = $_GET["action"] ?? null;
$id = $_GET["id"] ?? null;
$resource_id = $_GET["resource_id"] ?? null;
$comment_id = $_GET["comment_id"] ?? null;

// ============================================================================
// RESOURCE FUNCTIONS
// ============================================================================

/**
 * Function: Get all resources
 * Method: GET
 * 
 * Query Parameters:
 *   - search: Optional search term to filter by title or description
 *   - sort: Optional field to sort by (title, created_at)
 *   - order: Optional sort order (asc or desc, default: desc)
 * 
 * Response:
 *   - success: true/false
 *   - data: Array of resource objects
 */
function getAllResources($db)
{
    // TODO: Initialize the base SQL query
    // SELECT id, title, description, link, created_at FROM resources
    $sql = "SELECT id, title, description, link, created_at FROM resources";

    // TODO: Check if search parameter exists
    // If yes, add WHERE clause using LIKE to search title and description
    // Use OR to search both fields
    if (isset($_GET["search"])) {
        $search = $_GET["search"];
        $sql .= " WHERE title like :search OR description like :search";
    }
    // TODO: Check if sort parameter exists and validate it
    // Only allow: title, created_at
    // Default to created_at if not provided or invalid
    $sort = "created_at";
    if (isset($_GET["sort"])) {
        $sort = in_array(trim($_GET["sort"]), ["title", "created_at"]) ? trim($_GET["sort"]) : $sort;
    }
    // TODO: Check if order parameter exists and validate it
    // Only allow: asc, desc
    // Default to desc if not provided or invalid
    $order = "desc";
    if (isset($_GET["order"])) {
        $order = in_array(trim($_GET["order"]), ["asc", "desc"]) ? trim($_GET["order"]) : $order;
    }

    // TODO: Add ORDER BY clause to query
    $sql .= " ORDER BY $sort $order";
    // TODO: Prepare the SQL query using PDO
    $stmt = $db->prepare($sql);
    // TODO: If search parameter was used, bind the search parameter
    // Use % wildcards for LIKE search
    if (isset($_GET["search"])) {
        $searchParam = "%$search%";
        $stmt->bindParam(":search", $searchParam);
    }


    // TODO: Execute the query
    $stmt->execute();
    // TODO: Fetch all results as an associative array
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // TODO: Return JSON response with success status and data
    // Use the helper function sendResponse()
    sendResponse($data, 200);
}


/**
 * Function: Get a single resource by ID
 * Method: GET
 * 
 * Parameters:
 *   - $resourceId: The resource's database ID
 * 
 * Response:
 *   - success: true/false
 *   - data: Resource object or error message
 */
function getResourceById($db, $resourceId)
{
    // TODO: Validate that resource ID is provided and is numeric
    // If not, return error response with 400 status
    // TODO: Prepare SQL query to select resource by id
    // SELECT id, title, description, link, created_at FROM resources WHERE id = ?
    // TODO: Execute the query

    // TODO: Fetch the result as an associative array

    // TODO: Check if resource exists
    // If yes, return success response with resource data
    // If no, return error response with 404 status
    if (is_numeric($resourceId) && isset($resourceId)) {
        $sql = "SELECT id, title, description, link, created_at from resources where `id`=?";
        $stmt = $db->prepare($sql);
        // TODO: Bind the resource_id parameter
        $stmt->bindParam(1, $resourceId);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($data) {
            sendResponse($data, 200);
        } else {
            sendResponse("Resouce not found", 404);
        }
    } else {
        sendResponse(["message" => "Resource id is invalid."], 400);
    }
}


/**
 * Function: Create a new resource
 * Method: POST
 * 
 * Required JSON Body:
 *   - title: Resource title (required)
 *   - description: Resource description (optional)
 *   - link: URL to the resource (required)
 * 
 * Response:
 *   - success: true/false (Already returned by the sendResponse() helper function)
 *   - message: Success or error message
 *   - id: ID of created resource (on success)
 */
function createResource($db, $data)
{
    // TODO: Validate required fields
    // Check if title and link are provided and not empty
    // If any required field is missing, return error response with 400 status
    if(!isset($data)){
        sendResponse("Error, fields are missing", 400);
    }
    if (isset($data)) {
        if (!isset($data["title"]) || !isset($data["link"]) || empty($data["link"]) || empty($data["title"])) {
            sendResponse("Error, fields are missing", 400);
        }
    } 

    // TODO: Sanitize input data
    // Trim whitespace from all fields
    foreach ($data as $key => $value) {
        $data[$key] = sanitizeInput($value);
    }
    // Validate URL format for link using filter_var with FILTER_VALIDATE_URL
    // If URL is invalid, return error response with 400 status
    if (validateUrl($data["link"]) === false) {
        sendResponse([
            "message" => "Error occurred. The resource link is invalid."
        ], 400);
        exit;
    }

    // TODO: Set default value for description if not provided
    // Use empty string as default
    $description = isset($data["description"]) && !empty($data["description"]) ? $data["description"] : "";
    // TODO: Prepare INSERT query
    // INSERT INTO resources (title, description, link) VALUES (?, ?, ?)
    $stmt = $db->prepare("INSERT INTO resources (title, description, link) VALUES (?, ?, ?)");

    // TODO: Bind parameters
    // Bind title, description, and link
    $stmt->bindParam(1, $data["title"]);
    $stmt->bindParam(2, $description);
    $stmt->bindParam(3, $data["link"]);

    // TODO: Execute the query
    $success = $stmt->execute();
    // TODO: Check if insert was successful
    // If yes, get the last inserted ID using $db->lastInsertId()
    // Return success response with 201 status and the new resource ID
    // If no, return error response with 500 status
    if ($success) {
        $lastInsertedId = $db->lastInsertId();
        sendResponse([
            "message" => "The resource is added successfully.",
            "id" => $lastInsertedId
        ], 201);
    } else {
        sendResponse([
            "message" => "Error occurred on creating the resource."
        ], 500);
    }
}


/**
 * Function: Update an existing resource
 * Method: PUT
 * 
 * Required JSON Body:
 *   - id: The resource's database ID (required)
 *   - title: Updated resource title (optional)
 *   - description: Updated description (optional)
 *   - link: Updated URL (optional)
 * 
 * Response:
 *   - success: true/false
 *   - message: Success or error message
 */
function updateResource($db, $data)
{
    // TODO: Validate that resource ID is provided
    // If not, return error response with 400 status
    if(!validateRequiredFields($data, ["id"])){
        sendResponse(["message" => "Resource id is missing."], 400);
    }
    // TODO: Check if resource exists
    // Prepare and execute a SELECT query to find the resource by id
    $stmt = $db->prepare("SELECT title FROM resources WHERE `id`=?");
    $stmt->bindParam(1, $data["id"]);
    $stmt->execute();
    $result = $stmt->fetch(); // returns false when there are no results found
    // If not found, return error response with 404 status
    if ($result === false) {
        sendResponse(["message" => "No resource with this id is obtained."], 404);
    }

    // TODO: Build UPDATE query dynamically based on provided fields
    // Initialize empty arrays for fields to update and values
    // Check which fields are provided (title, description, link)
    // Add each provided field to the update arrays
    $updateArray = [];
    if (isset($data["title"]) && trim($data["title"]) !== "") {
        $temp = sanitizeInput($data["title"]);
        $updateArray["title"] =  $temp;
    }
    if (isset($data["description"]) && trim($data["description"]) !== "") {
        $temp = sanitizeInput($data["description"]);
        $updateArray["description"] = $temp;
    }
    if (isset($data["link"]) && trim($data["link"]) !== "") {
        $temp = sanitizeInput($data["link"]);
        $updateArray["link"] = $temp;
    }
    // TODO: If no fields to update, return error response with 400 status
    if (count($updateArray) === 0) {
        sendResponse([
            "message" => "Nothing to update"
        ], 400);
    }

    // TODO: If link is being updated, validate URL format
    // Use filter_var with FILTER_VALIDATE_URL
    // If invalid, return error response with 400 status
    if (isset($updateArray["link"])) {
        if (validateUrl($updateArray["link"]) === false) {
            sendResponse([
                "message" => "Link is invalid"
            ], 400);
        }
    }

    // TODO: Build the complete UPDATE SQL query
    // UPDATE resources SET field1 = ?, field2 = ? WHERE id = ?
    $sql = "UPDATE `resources` SET ";
    foreach ($updateArray as $key => $value) {
        $sql .= "`$key` = ?, ";
    }
    $sql = substr($sql, 0, -2); // To remove the last ", "
    $sql .= " WHERE `id` = ?";
    // TODO: Prepare the query
    $stmt = $db->prepare($sql);
    // TODO: Bind parameters dynamically
    $i = 1;
    foreach ($updateArray as $key => $value) {
        $stmt->bindValue($i, $value);
        $i++;
    }
    // Bind all update values, then bind the resource ID at the end
    $stmt->bindValue($i, $data["id"]);
    // TODO: Execute the query
    $result = $stmt->execute();
    // TODO: Check if update was successful
    // If yes, return success response with 200 status
    // If no, return error response with 500 status
    if ($result) {
        sendResponse(
            ["message" => "The resource is updated successfully"],
            200
        );
    } else {
        sendResponse(
            ["message" => "Error occurred on updating the resource"],
            500
        );
    }
}


/**
 * Function: Delete a resource
 * Method: DELETE
 * 
 * Parameters:
 *   - $resourceId: The resource's database ID
 * 
 * Response:
 *   - success: true/false
 *   - message: Success or error message
 * 
 * Note: This should also delete all associated comments
 */
function deleteResource($db, $resourceId)
{
    // TODO: Validate that resource ID is provided and is numeric
    // If not, return error response with 400 status
    if (!isset($resourceId) || !is_numeric($resourceId)) {
        sendResponse([
            "message" => "The provided resource id is invalid."
        ], 400);
    }

    // TODO: Check if resource exists
    // Prepare and execute a SELECT query
    // If not found, return error response with 404 status
    $stmt = $db->prepare("SELECT * FROM resources WHERE id = ?");
    $stmt->bindParam(1, $resourceId);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result === false) {
        sendResponse([
            "message" => "The provided resource id does not match any available resource."
        ], 404);
    }
    // TODO: Begin a transaction (for data integrity)
    // Use $db->beginTransaction()
    try {
        $db->beginTransaction();
        // TODO: First, delete all associated comments
        // Prepare DELETE query for comments table
        // DELETE FROM comments WHERE resource_id = ?
        // TODO: Bind resource_id and execute
        $stmt = $db->prepare("DELETE FROM comments_resource WHERE resource_id = ?");
        $stmt->bindParam(1, $resourceId);
        $success = $stmt->execute();
        if (!$success) {
            throw new Exception("Cannot delete comments where resource id is " . $resourceId);
        }
        // TODO: Then, delete the resource
        // Prepare DELETE query for resources table
        // DELETE FROM resources WHERE id = ?
        // TODO: Bind resource_id and execute
        $stmt = $db->prepare("DELETE FROM resources WHERE id = ?");
        $stmt->bindParam(1, $resourceId);
        $success = $stmt->execute();
        if (!$success) {
            throw new Exception("Cannot delete the resource with id = " . $resourceId);
        }
        // TODO: Commit the transaction
        // Use $db->commit()
        $db->commit();
        // TODO: Return success response with 200 status
        sendResponse([
            "message" => "The resource and its associated comments are deleted successfully."
        ], 200);
    } catch (Exception $e) {
        // TODO: Rollback the transaction on error
        // Use $db->rollBack()
        $db->rollBack();
        // TODO: Return error response with 500 status
        sendResponse([
            "message" => "Error on deleting a resource."
        ], 500);
    }
}


// ============================================================================
// COMMENT FUNCTIONS
// ============================================================================

/**
 * Function: Get all comments for a specific resource
 * Method: GET with action=comments
 * 
 * Query Parameters:
 *   - resource_id: The resource's database ID (required)
 * 
 * Response:
 *   - success: true/false
 *   - data: Array of comment objects
 */
function getCommentsByResourceId($db, $resourceId)
{
    // TODO: Validate that resource_id is provided and is numeric
    // If not, return error response with 400 status
    if (!isset($resourceId) || !is_numeric($resourceId)) {
        sendResponse([
            "message" => "The provided resource id is invalid."
        ], 400);
    }
    // TODO: Prepare SQL query to select comments for the resource
    // SELECT id, resource_id, author, text, created_at 
    // FROM comments 
    // WHERE resource_id = ? 
    // ORDER BY created_at ASC
    // TODO: Bind the resource_id parameter

    // TODO: Execute the query

    // TODO: Fetch all results as an associative array
    $stmt = $db->prepare("SELECT id, resource_id, author, text, created_at FROM comments_resource WHERE resource_id = ?");
    $stmt->execute([$resourceId]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC); // It doesn't return false like fetch(), but rather returns an empty array when no results are there.
    // TODO: Return success response with comments data
    // Even if no comments exist, return empty array (not an error)
    sendResponse($result, 200);
}


/**
 * Function: Create a new comment
 * Method: POST with action=comment
 * 
 * Required JSON Body:
 *   - resource_id: The resource's database ID (required)
 *   - author: Name of the comment author (required)
 *   - text: Comment text content (required)
 * 
 * Response:
 *   - success: true/false
 *   - message: Success or error message
 *   - id: ID of created comment (on success)
 */
function createComment($db, $data)
{
    // TODO: Validate required fields
    // Check if resource_id, author, and text are provided and not empty
    // If any required field is missing, return error response with 400 status
    // TODO: Validate that resource_id is numeric
    // If not, return error response with 400 status
    if (!isset($data["resource_id"], $data["author"], $data["text"]) || !is_numeric($data["resource_id"]) || trim($data["author"]) === "" && trim($data["text"]) === "") {
        sendResponse([
            "message" => "Missing or invalid field"
        ], 400);
    }

    // TODO: Check if the resource exists
    // Prepare and execute SELECT query on resources table
    // If resource not found, return error response with 404 status
    $stmt = $db->prepare("SELECT title FROM resources WHERE id = ?");
    $stmt->execute([$data["resource_id"]]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result) {
        sendResponse([
            "message" => "Invalid resource id. No resource with id = " . $data["resource_id"] . " is found."
        ], 404);
    }
    // TODO: Sanitize input data
    // Trim whitespace from author and text
    $author = sanitizeInput($data["author"]);
    $commentText = sanitizeInput($data["text"]);
    // TODO: Prepare INSERT query
    // INSERT INTO comments (resource_id, author, text) VALUES (?, ?, ?)
    // TODO: Bind parameters
    // Bind resource_id, author, and text
    $stmt = $db->prepare("INSERT INTO comments_resource (resource_id, author, text) VALUES (?, ?, ?)");
    $stmt->bindParam(1, $data["resource_id"]);
    $stmt->bindParam(2, $author);
    $stmt->bindParam(3, $commentText);
    // TODO: Execute the query
    // TODO: Check if insert was successful
    // If yes, get the last inserted ID using $db->lastInsertId()
    // Return success response with 201 status and the new comment ID
    // If no, return error response with 500 status
    $success = $stmt->execute();
    if ($success) {
        $lastInsertedId = $db->lastInsertId();
        sendResponse([
            "message" => "The comment is successfully inserted!",
            "id" => $lastInsertedId
        ], 200);
    } else {
        sendResponse([
            "message" => "Error occurred on inserting the comment"
        ], 500);
    }
}


/**
 * Function: Delete a comment
 * Method: DELETE with action=delete_comment
 * 
 * Query Parameters or JSON Body:
 *   - comment_id: The comment's database ID (required)
 * 
 * Response:
 *   - success: true/false
 *   - message: Success or error message
 */
function deleteComment($db, $commentId)
{
    // TODO: Validate that comment_id is provided and is numeric
    // If not, return error response with 400 status
    if (!isset($commentId) || !is_numeric($commentId)) {
        sendResponse([
            "message" => "invalid comment id."
        ], 400);
    }
    // TODO: Check if comment exists
    // Prepare and execute a SELECT query
    // If not found, return error response with 404 status
    $stmt = $db->prepare("SELECT id FROM comments_resource WHERE id = ?");
    $stmt->execute([$commentId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result) {
        sendResponse([
            "message" => "No comment with the provided id is found."
        ], 404);
    }
    // TODO: Prepare DELETE query
    // DELETE FROM comments WHERE id = ?
    // TODO: Bind the comment_id parameter
    // TODO: Execute the query
    $stmt = $db->prepare("DELETE FROM comments_resource WHERE id = ?");
    $stmt->execute([$commentId]);
    // TODO: Check if delete was successful
    // If yes, return success response with 200 status
    // If no, return error response with 500 status
    if ($stmt->rowCount() === 0) {
        sendResponse([
            "message" => "Error occurred on deleting the comment"
        ], 500);
    } else {
        sendResponse([
            "message" => "The comment is successfully deleted."
        ], 200);
    }
}


// ============================================================================
// MAIN REQUEST ROUTER
// ============================================================================

try {
    // TODO: Route the request based on HTTP method and action parameter

    if ($method === 'GET') {
        // TODO: Check the action parameter to determine which function to call
        switch ($action) {
            case "comments":
                if (isset($resource_id)) {
                    getCommentsByResourceId($db, $resource_id); //Already will exit automatically
                }
                break;
            default:
                if (isset($id)) {
                    getResourceById($db, $id);
                } else {
                    getAllResources($db);
                }
                break;
        }
        // If action is 'comments', get comments for a resource
        // TODO: Check if action === 'comments'
        // Get resource_id from query parameters
        // Call getCommentsByResourceId()

        // If id parameter exists, get single resource
        // TODO: Check if 'id' parameter exists in $_GET
        // Call getResourceById()

        // Otherwise, get all resources
        // TODO: Call getAllResources()

    } elseif ($method === 'POST') {
        // TODO: Check the action parameter to determine which function to call
        // If action is 'comment', create a new comment
        // TODO: Check if action === 'comment'
        // Call createComment()

        // Otherwise, create a new resource
        // TODO: Call createResource()
        switch ($action) {
            case "comment":
                createComment($db, $jsonBody);
                break;
            default:
                createResource($db, $jsonBody);
        }
    } elseif ($method === 'PUT') {
        // TODO: Update a resource
        // Call updateResource()
        updateResource($db, $jsonBody);
    } elseif ($method === 'DELETE') {
        // TODO: Check the action parameter to determine which function to call
        // If action is 'delete_comment', delete a comment
        // TODO: Check if action === 'delete_comment'
        // Get comment_id from query parameters or request body
        // Call deleteComment()

        // Otherwise, delete a resource
        // TODO: Get resource id from query parameter or request body
        // Call deleteResource()
        switch ($action) {
            case "delete_comment":
                deleteComment($db, $comment_id);
                break;
            default:
                deleteResource($db, $id);
        }
    } else {
        // TODO: Return error for unsupported methods
        // Set HTTP status to 405 (Method Not Allowed)
        // Return JSON error message using sendResponse()
        sendResponse(["message" => "Unsupported method."], 405);
    }
} catch (PDOException $e) {
    // TODO: Handle database errors
    // Log the error message (optional, use error_log())
    // Return generic error response with 500 status
    // Do NOT expose detailed error messages to the client in production
    error_log("PDOException: " . $e->getMessage());
    sendResponse([
        "message" => "PDO error occurred."
    ], 500);
} catch (Exception $e) {
    // TODO: Handle general errors
    // Log the error message (optional)
    // Return error response with 500 status
    error_log("Exception: " . $e->getMessage());
    sendResponse([
        "message" => "error occurred."
    ], 500);
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to send JSON response
 * 
 * @param array $data - Data to send (should include 'success' key)
 * @param int $statusCode - HTTP status code (default: 200)
 */
function sendResponse($data, $statusCode = 200)
{
    // TODO: Set HTTP response code using http_response_code()
    http_response_code($statusCode);
    // TODO: Ensure data is an array
    // If not, wrap it in an array
    if (!is_array($data)) {
        $data = ["message" => $data];
    }
    $response = [
        "success" => $statusCode >= 200 && $statusCode < 300,
        "data"    => $data
    ];
    // TODO: Echo JSON encoded data
    // Use JSON_PRETTY_PRINT for readability (optional)
    echo json_encode($response, JSON_PRETTY_PRINT);
    // TODO: Exit to prevent further execution
    exit;
}


/**
 * Helper function to validate URL format
 * 
 * @param string $url - URL to validate
 * @return bool - True if valid, false otherwise
 */
function validateUrl($url)
{
    // TODO: Use filter_var with FILTER_VALIDATE_URL
    // Return true if valid, false otherwise
    return filter_var($url, FILTER_VALIDATE_URL) !== false; // filter_var returns a string if it is a valid, and returns false if it invalid
}


/**
 * Helper function to sanitize input
 * 
 * @param string $data - Data to sanitize
 * @return string - Sanitized data
 */
function sanitizeInput($data)
{
    // TODO: Trim whitespace using trim()
    $data = trim($data);
    // TODO: Strip HTML tags using strip_tags()
    $data = strip_tags($data); // Protect against XSS
    // TODO: Convert special characters using htmlspecialchars()
    $data = htmlspecialchars($data, ENT_QUOTES);
    // Use ENT_QUOTES to escape both double and single quotes
    // TODO: Return sanitized data
    return $data;
}


/**
 * Helper function to validate required fields
 * 
 * @param array $data - Data array to validate
 * @param array $requiredFields - Array of required field names
 * @return array - Array with 'valid' (bool) and 'missing' (array of missing fields)
 */
function validateRequiredFields($data, $requiredFields)
{
    // TODO: Initialize empty array for missing fields
    $missing = [];
    // TODO: Loop through required fields
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === "") {
            $missing[] = $field;
        }
    }
    // Check if each field exists in data and is not empty
    // If missing or empty, add to missing fields array
    return [
        "valid" => count($missing) === 0,
        "missing" => $missing
    ];
    // TODO: Return result array
    // ['valid' => (count($missing) === 0), 'missing' => $missing]
}

// getResourceById($db, 6);
// updateResource($db, [
//     "id" => 1,
//     "title" => "Javascript new!",
//     "link" => "http://localhost:8000/src/resources/api/index.php"
// ]);
// deleteResource($db, 2);