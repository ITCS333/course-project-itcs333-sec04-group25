<?php
require_once __DIR__ . '/EnvLoader.php';

// Load .env file from project root
EnvLoader::load(__DIR__ . '/../../.env');

$config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'dbname' => $_ENV['DB_NAME'] ?? 'course',
    'username' => $_ENV['DB_USER'] ?? 'admin',
    'password' => $_ENV['DB_PASS'] ?? '',
    'options' => [
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
    ]
];
?>