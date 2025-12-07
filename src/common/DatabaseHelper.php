<?php
class DatabaseHelper
{
    private $pdoInstance;
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $options;

    public function __construct(
        $host,
        $dbName,
        $username,
        $password,
        $options = [
            PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
        ]
    ) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
        $this->options = $options;
    }

    public function getConnection() // Retuns PDO instance
    {
        if (!$this->pdoInstance) {
            $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4";
            try {
                $this->pdoInstance = new PDO($dsn, $this->username, $this->password, $this->options);
            } catch (PDOException $e) {
                if ($e->getCode() == 1049) {
                    // Database doesn't exist, create it
                    $this->createDatabase();
                    // pdoInstance is already set by createDatabase()
                } else {
                    throw $e;
                }
            }
        }
        return $this->pdoInstance;
    }

    public function createDatabase()
    {
        try {
            // Create a temporary connection without database name
            $pdo = new PDO("mysql:host={$this->host}", $this->username, $this->password, $this->options);
            $pdo->exec("
        -- Create database
CREATE DATABASE IF NOT EXISTS course
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE course;

-- Disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (in correct order)
-- DROP TABLE IF EXISTS comments_assignment;
-- DROP TABLE IF EXISTS comments_resource;
-- DROP TABLE IF EXISTS comments_week;
-- DROP TABLE IF EXISTS replies;
-- DROP TABLE IF EXISTS topics;
-- DROP TABLE IF EXISTS assignments;
-- DROP TABLE IF EXISTS resources;
-- DROP TABLE IF EXISTS weeks;
-- DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- USERS TABLE (with admin flag)
-- ============================================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    
    -- ============================================================================
    -- ASSIGNMENTS TABLE
    -- ============================================================================
    CREATE TABLE assignments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        files TEXT, -- JSON-encoded array of file URLs
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        
        -- ============================================================================
        -- DISCUSSION TOPICS TABLE
        -- ============================================================================
        CREATE TABLE topics (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            author VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            
            -- ============================================================================
            -- DISCUSSION REPLIES TABLE
            -- ============================================================================
            CREATE TABLE replies (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                topic_id INT UNSIGNED NOT NULL,
                text TEXT NOT NULL,
                author VARCHAR(100) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_replies_topic
                FOREIGN KEY (topic_id) REFERENCES topics(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                
                -- ============================================================================
                -- RESOURCES TABLE
                -- ============================================================================
                CREATE TABLE resources (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    link VARCHAR(500) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                    
                    -- ============================================================================
                    -- WEEKS TABLE
                    -- ============================================================================
                    CREATE TABLE weeks (
                        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        start_date DATE NOT NULL,
                        description TEXT,
                        links TEXT, -- JSON-encoded array of resource links
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        
                        -- ============================================================================
                        -- COMMENTS TABLES (Separate tables for each resource type)
                        -- ============================================================================
                        
                        -- Comments for Assignments
                        CREATE TABLE comments_assignment (
                            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                            assignment_id INT UNSIGNED NOT NULL,
                            author VARCHAR(100) NOT NULL,
                            text TEXT NOT NULL,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT fk_comments_assignment
                            FOREIGN KEY (assignment_id) REFERENCES assignments(id)
                            ON DELETE CASCADE
                            ON UPDATE CASCADE
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                            
                            -- Comments for Resources
                            CREATE TABLE comments_resource (
                                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                resource_id INT UNSIGNED NOT NULL,
                                author VARCHAR(100) NOT NULL,
                                text TEXT NOT NULL,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                CONSTRAINT fk_comments_resource
                                FOREIGN KEY (resource_id) REFERENCES resources(id)
                                ON DELETE CASCADE
                                ON UPDATE CASCADE
                                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                                
                                -- Comments for Weeks
                                CREATE TABLE comments_week (
                                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                    week_id INT UNSIGNED NOT NULL,
                                    author VARCHAR(100) NOT NULL,
                                    text TEXT NOT NULL,
                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT fk_comments_week
                                    FOREIGN KEY (week_id) REFERENCES weeks(id)
                                    ON DELETE CASCADE
                                    ON UPDATE CASCADE
                                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // Now connect to the newly created database and set pdoInstance
            $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4";
            $this->pdoInstance = new PDO($dsn, $this->username, $this->password, $this->options);

            // Seed the database
            $this->seedDb();

        } catch (PDOException $e) {
            die("Error creating the database: " . $e->getMessage());
        }
    }

    public function seedDb()
    {
        // Hash the default password
        $hashedPassword = password_hash('password123', PASSWORD_DEFAULT);

        // Insert users with hashed password
        $stmt = $this->prepare("INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)");
        $users = [
            ['Course Admin', 'admin@uob.edu.bh', $hashedPassword, 1],
            ['Ali Hassan', '202101234@stu.uob.edu.bh', $hashedPassword, 0],
            ['Fatema Ahmed', '202205678@stu.uob.edu.bh', $hashedPassword, 0],
            ['Mohamed Abdulla', '202311001@stu.uob.edu.bh', $hashedPassword, 0],
            ['Noora Salman', '202100987@stu.uob.edu.bh', $hashedPassword, 0],
            ['Zainab Ebrahim', '202207766@stu.uob.edu.bh', $hashedPassword, 0]
        ];

        foreach ($users as $user) {
            $stmt->execute($user);
        }

        // Insert other seed data
        $this->pdoInstance->exec("
INSERT INTO assignments (title, description, due_date, files) VALUES
  ('HTML & CSS Portfolio', 'Create a responsive portfolio website using HTML5 and CSS3. Must include: header, navigation, main content area, and footer.', '2025-02-15', '[\"https://example.com/files/assignment1-brief.pdf\", \"https://example.com/files/starter-template.zip\"]'),
  ('JavaScript Interactivity', 'Add interactive features to your portfolio using vanilla JavaScript. Include form validation and dynamic content loading.', '2025-03-01', '[\"https://example.com/files/assignment2-brief.pdf\"]'),
  ('Final Project Proposal', 'Submit a detailed proposal for your final web application project including wireframes and technology stack.', '2025-03-20', '[]');

INSERT INTO topics (subject, message, author) VALUES
  ('Welcome to Web Development!', 'Welcome everyone! Please introduce yourself and share what you hope to learn in this course.', 'Course Admin'),
  ('Assignment 1 Discussion', 'Questions and discussions about the HTML & CSS Portfolio assignment.', 'Ali Hassan'),
  ('Best CSS Framework?', 'What CSS framework do you recommend for beginners? Bootstrap, Tailwind, or pure CSS?', 'Fatema Ahmed');

-- Insert Replies
INSERT INTO replies (topic_id, text, author) VALUES
  (1, 'Hi everyone! I am Ali from Bahrain. Excited to learn web development!', 'Ali Hassan'),
  (1, 'Hello! I am Fatema. I want to become a frontend developer.', 'Fatema Ahmed'),
  (1, 'Welcome everyone! This will be a great journey.', 'Course Admin'),
  (2, 'Can we use CSS Grid for the layout?', 'Mohamed Abdulla'),
  (2, 'Yes, both Flexbox and CSS Grid are acceptable for this assignment.', 'Course Admin'),
  (3, 'I would recommend starting with pure CSS to understand the fundamentals.', 'Course Admin'),
  (3, 'Bootstrap is great for rapid prototyping!', 'Noora Salman');

-- Insert Resources
INSERT INTO resources (title, description, link) VALUES
  ('Course Syllabus', 'Complete course outline, grading policy, and schedule for the semester.', 'https://www.uob.edu.bh/courses/web-dev/syllabus.pdf'),
  ('MDN Web Docs', 'Comprehensive web development documentation and tutorials from Mozilla.', 'https://developer.mozilla.org/en-US/'),
  ('W3Schools HTML Tutorial', 'Interactive HTML tutorial with examples and exercises.', 'https://www.w3schools.com/html/'),
  ('CSS Tricks', 'Articles, guides, and tips for modern CSS techniques.', 'https://css-tricks.com/'),
  ('JavaScript.info', 'Modern JavaScript tutorial covering basics to advanced topics.', 'https://javascript.info/');

-- Insert Weeks
INSERT INTO weeks (title, start_date, description, links) VALUES
  ('Week 1: Introduction to HTML', '2025-01-13', 'Learn HTML fundamentals including document structure, semantic elements, and forms.', 
   '[\"https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML\", \"https://www.w3schools.com/html/html_intro.asp\"]'),

  ('Week 2: CSS Fundamentals', '2025-01-20', 'Master CSS selectors, the box model, positioning, and basic layouts.',
   '[\"https://developer.mozilla.org/en-US/docs/Learn/CSS\", \"https://www.w3schools.com/css/\"]'),

  ('Week 3: Responsive Design', '2025-01-27', 'Create mobile-friendly websites using media queries, flexible grids, and responsive images.',
   '[\"https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design\", \"https://css-tricks.com/snippets/css/a-guide-to-flexbox/\"]'),

  ('Week 4: JavaScript Basics', '2025-02-03', 'Introduction to JavaScript: variables, data types, operators, and control structures.',
   '[\"https://javascript.info/first-steps\", \"https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps\"]'),

  ('Week 5: DOM Manipulation', '2025-02-10', 'Learn to interact with the Document Object Model and handle user events.',
   '[\"https://javascript.info/document\", \"https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model\"]');

-- Insert Comments for Assignments
INSERT INTO comments_assignment (assignment_id, author, text) VALUES
  (1, 'Mohamed Abdulla', 'Is it okay to use Flexbox for the layout instead of floats?'),
  (1, 'Course Admin', 'Absolutely! Flexbox and CSS Grid are the modern approaches and are preferred.'),
  (1, 'Zainab Ebrahim', 'Can we include JavaScript animations?'),
  (1, 'Course Admin', 'For Assignment 1, focus on HTML and CSS. We will add JavaScript in Assignment 2.'),
  (2, 'Ali Hassan', 'Do we need to support Internet Explorer?'),
  (2, 'Course Admin', 'No, you can use modern JavaScript (ES6+). Focus on Chrome, Firefox, and Safari.');

-- Insert Comments for Resources
INSERT INTO comments_resource (resource_id, author, text) VALUES
  (1, 'Fatema Ahmed', 'The syllabus is very clear. Thank you!'),
  (2, 'Noora Salman', 'MDN is my go-to resource for web development!'),
  (3, 'Mohamed Abdulla', 'W3Schools examples are really helpful for quick reference.'),
  (4, 'Ali Hassan', 'CSS Tricks helped me understand Flexbox much better.');

-- Insert Comments for Weeks
INSERT INTO comments_week (week_id, author, text) VALUES
  (1, 'Fatema Ahmed', 'The HTML basics were easy to follow. Great examples!'),
  (1, 'Zainab Ebrahim', 'Could you add more examples of semantic HTML elements?'),
  (2, 'Mohamed Abdulla', 'The CSS box model explanation was very clear.'),
  (3, 'Ali Hassan', 'Responsive design is challenging but interesting!'),
  (4, 'Noora Salman', 'JavaScript is more fun than I expected!')");
    }

    public function query($q)
    {
        return $this->pdoInstance->query($q);
    }
    public function prepare($sql)
    {
        return $this->pdoInstance->prepare($sql);
    }
    public function execute($sql)
    {
        return $this->pdoInstance->exec($sql); //Not execute() because that one is used after prepare
    }

    public function registerUser($name, $email, $password)
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->prepare(sql: "INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $hashedPassword]);
    }
    public function verifyUser($email, $password)
    {
        $stmt = $this->prepare("SELECT * FROM `users` WHERE `email` = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(); // If not found it returns false
        if ($user && password_verify($password, $user['password'])) {
            return true;
        }
        return false;


    }

}
?>