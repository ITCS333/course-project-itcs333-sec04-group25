<?php
// Database configuration
$config = [
    'host' => '127.0.0.1',
    'dbname' => 'course',
    'username' => 'admin',
    'password' => 'password123',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];