CREATE database StoryGrid;
USE StoryGrid;

-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    display_name VARCHAR(100),
    location VARCHAR(100),
    website VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Stories Table
CREATE TABLE Stories (
    story_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    story_type ENUM('text', 'mixed-media') NOT NULL,
    content TEXT,
    cover_image VARCHAR(255),
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- StoryMedia Table
CREATE TABLE StoryMedia (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT,
    media_type ENUM('image', 'video', 'audio') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    caption TEXT,
    order_position INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    story_id INT,
    parent_comment_id INT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(comment_id) ON DELETE SET NULL
);

-- Moderation Table
CREATE TABLE Moderation (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT NULL,
    comment_id INT NULL,
    user_id INT,
    reported_by INT,
    report_reason TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    moderator_notes TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- NEW: Likes Table
CREATE TABLE Likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    story_id INT NULL,
    comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_story_like (user_id, story_id),
    UNIQUE KEY unique_comment_like (user_id, comment_id)
);

-- NEW: Followers Table
CREATE TABLE Followers (
    follower_id INT,
    following_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- NEW: Tags Table
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: StoryTags Table (Many-to-Many relationship)
CREATE TABLE StoryTags (
    story_id INT,
    tag_id INT,
    PRIMARY KEY (story_id, tag_id),
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- NEW: Notifications Table
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    sender_id INT,
    notification_type ENUM('like', 'comment', 'follow', 'mention', 'system') NOT NULL,
    content TEXT,
    story_id INT NULL,
    comment_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE
);

-- NEW: Messages Table
CREATE TABLE Messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT,
    receiver_id INT,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- NEW: UserSessions Table
CREATE TABLE UserSessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

