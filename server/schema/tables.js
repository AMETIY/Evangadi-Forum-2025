const DB_TYPE = process.env.DB_TYPE || "mysql";

// Helper function to get appropriate SQL based on database type
const getSQL = (mysql, postgres) => {
  return DB_TYPE === "postgres" ? postgres : mysql;
};

export const users = getSQL(
  // MySQL version
  `CREATE TABLE IF NOT EXISTS users(
        user_id INT AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL,
        last_password_reset DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        INDEX idx_email (email),
        INDEX idx_reset_token (reset_token),
        INDEX idx_reset_expires (reset_token_expires)
    )`,

  // PostgreSQL version
  `CREATE TABLE IF NOT EXISTS users(
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires TIMESTAMP DEFAULT NULL,
        last_password_reset TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_reset_token ON users(reset_token);
    CREATE INDEX IF NOT EXISTS idx_reset_expires ON users(reset_token_expires);`
);

export const profiles = getSQL(
  // MySQL
  `CREATE TABLE IF NOT EXISTS profiles(
        user_profile_id int AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        profile_picture VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY(user_profile_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS profiles(
        user_profile_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
        profile_picture VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
);

export const questions = getSQL(
  // MySQL
  `CREATE TABLE IF NOT EXISTS questions(
        question_id INT AUTO_INCREMENT, 
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        question VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        tag VARCHAR(100) DEFAULT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(question_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_tag (tag),
        INDEX idx_user_id (user_id),
        INDEX idx_time (time)
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS questions(
        question_id SERIAL PRIMARY KEY, 
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        title VARCHAR(100) NOT NULL,
        question VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        tag VARCHAR(100) DEFAULT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tag ON questions(tag);
    CREATE INDEX IF NOT EXISTS idx_user_id ON questions(user_id);
    CREATE INDEX IF NOT EXISTS idx_time ON questions(time);`
);

export const answers = getSQL(
  // MySQL
  `CREATE TABLE IF NOT EXISTS answers(
        answer_id INT AUTO_INCREMENT,
        question_id INT NOT NULL,
        user_id INT NOT NULL,
        answer TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(answer_id),
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_user_id (user_id)
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS answers(
        answer_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE ON UPDATE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        answer TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user_id ON answers(user_id);`
);

export const password_history = getSQL(
  // MySQL
  `CREATE TABLE password_history (
        id INT AUTO_INCREMENT,
        user_id INT NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS password_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user_id ON password_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_created_at ON password_history(created_at);`
);

export const question_views = getSQL(
  // MySQL
  `CREATE TABLE IF NOT EXISTS question_views (
        view_id INT AUTO_INCREMENT,
        question_id INT NOT NULL,
        user_id INT,
        ip_address VARCHAR(45),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (view_id),
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_question_id (question_id),
        INDEX idx_user_id (user_id),
        INDEX idx_viewed_at (viewed_at),
        UNIQUE KEY unique_view (question_id, user_id, ip_address, DATE(viewed_at))
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS question_views (
        view_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        ip_address VARCHAR(45),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_question_id ON question_views(question_id);
    CREATE INDEX IF NOT EXISTS idx_user_id ON question_views(user_id);
    CREATE INDEX IF NOT EXISTS idx_viewed_at ON question_views(viewed_at);
    CREATE UNIQUE INDEX IF NOT EXISTS unique_view ON question_views(question_id, user_id, ip_address, DATE(viewed_at));`
);

export const question_likes = getSQL(
  // MySQL
  `CREATE TABLE IF NOT EXISTS question_likes (
        like_id INT AUTO_INCREMENT,
        question_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (like_id),
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (question_id, user_id),
        INDEX idx_question_id (question_id),
        INDEX idx_user_id (user_id)
    )`,

  // PostgreSQL
  `CREATE TABLE IF NOT EXISTS question_likes (
        like_id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_question_id ON question_likes(question_id);
    CREATE INDEX IF NOT EXISTS idx_user_id ON question_likes(user_id);`
);
