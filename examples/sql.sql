-- Neomono Theme Demo - SQL Examples
-- Database schema for a blog application

-- Create database
CREATE DATABASE IF NOT EXISTS neomono_blog;
USE neomono_blog;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    FULLTEXT INDEX idx_fulltext (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Post-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data

-- Sample users
INSERT INTO users (username, email, password_hash, display_name, bio, is_admin) VALUES
('alice', 'alice@example.com', '$2y$10$hash1', 'Alice Johnson', 'Tech enthusiast and blogger', TRUE),
('bob', 'bob@example.com', '$2y$10$hash2', 'Bob Smith', 'Full-stack developer', FALSE),
('charlie', 'charlie@example.com', '$2y$10$hash3', 'Charlie Brown', 'UI/UX designer', FALSE);

-- Sample tags
INSERT INTO tags (name, slug, description) VALUES
('Programming', 'programming', 'Posts about programming and software development'),
('Design', 'design', 'Posts about UI/UX design'),
('Tutorial', 'tutorial', 'Step-by-step guides and tutorials'),
('VSCode', 'vscode', 'Visual Studio Code related content'),
('Themes', 'themes', 'Editor themes and customization');

-- Sample posts
INSERT INTO posts (user_id, title, slug, content, excerpt, status, published_at) VALUES
(1, 'Getting Started with Neomono Theme', 'getting-started-neomono', 
 'Neomono is a vibrant, futuristic dark theme with neon accents for modern developers. In this post, we will explore how to install and use it.',
 'Learn how to install and use the Neomono theme',
 'published', NOW()),

(1, 'Top 10 VSCode Extensions for 2025', 'top-vscode-extensions-2025',
 'Visual Studio Code has become the go-to editor for developers. Here are the best extensions to enhance your productivity.',
 'Discover the must-have VSCode extensions',
 'published', NOW()),

(2, 'Building a Modern Web App', 'building-modern-web-app',
 'A comprehensive guide to building modern web applications using the latest technologies and best practices.',
 'Complete guide to modern web development',
 'draft', NULL);

-- Link posts with tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 4), (1, 5),  -- Neomono post: VSCode, Themes
(2, 1), (2, 3), (2, 4),  -- Extensions post: Programming, Tutorial, VSCode
(3, 1), (3, 3);  -- Web app post: Programming, Tutorial

-- Sample comments
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'Great theme! The neon colors are amazing!'),
(1, 3, 'Thanks for sharing. Just installed it and loving it!'),
(2, 3, 'Very useful list. I use half of these already!');

-- Useful queries

-- Get all published posts with author information
SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.view_count,
    p.published_at,
    u.username,
    u.display_name
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC;

-- Get posts with their tags
SELECT 
    p.title,
    GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
GROUP BY p.id, p.title;

-- Get posts with comment count
SELECT 
    p.title,
    COUNT(c.id) AS comment_count,
    u.display_name AS author
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
JOIN users u ON p.user_id = u.id
WHERE p.status = 'published'
GROUP BY p.id, p.title, u.display_name
ORDER BY comment_count DESC;

-- Get most popular posts by view count
SELECT 
    title,
    view_count,
    published_at
FROM posts
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;

-- Get user statistics
SELECT 
    u.username,
    u.display_name,
    COUNT(DISTINCT p.id) AS post_count,
    COUNT(DISTINCT c.id) AS comment_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
GROUP BY u.id, u.username, u.display_name;

-- Search posts by keyword (full-text search)
SELECT 
    title,
    excerpt,
    MATCH(title, content) AGAINST('theme VSCode' IN NATURAL LANGUAGE MODE) AS relevance
FROM posts
WHERE MATCH(title, content) AGAINST('theme VSCode' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC;

-- Get recent activity (posts and comments)
SELECT 
    'post' AS type,
    p.title AS content,
    u.display_name AS author,
    p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
UNION ALL
SELECT 
    'comment' AS type,
    SUBSTRING(c.content, 1, 50) AS content,
    u.display_name AS author,
    c.created_at
FROM comments c
JOIN users u ON c.user_id = u.id
ORDER BY created_at DESC
LIMIT 20;

