<?php
require_once __DIR__ . '/DatabaseHelper.php';


function requireAdminDb($db, $userId)
{
    // $userId
    $stmt = $db->prepare("SELECT is_admin FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || !isset($result["is_admin"]) || (isset($result["is_admin"]) && $result["is_admin"] === 0)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied — only admins can access this endpoint']);
        exit;
    }
}

function requireAdmin()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied — only admins can access this endpoint']);
        exit;
    }
}

function requireLogin()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401); // Use 401 for authentication issues
        echo json_encode(['success' => false, 'message' => 'Please login first']);
        exit;
    }
}