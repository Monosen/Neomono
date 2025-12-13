<?php

namespace App\Services;

use DateTime;
use Exception;

/**
 * User authentication and management service
 */
class AuthService
{
    private array $users = [];
    private ?string $currentUserId = null;
    private const PASSWORD_MIN_LENGTH = 8;

    /**
     * Register a new user
     * 
     * @param string $email User's email address
     * @param string $password User's password
     * @param string $name User's full name
     * @return array User data
     * @throws Exception
     */
    public function register(string $email, string $password, string $name): array
    {
        if ($this->userExists($email)) {
            throw new Exception("User with email {$email} already exists");
        }

        if (strlen($password) < self::PASSWORD_MIN_LENGTH) {
            throw new Exception("Password must be at least " . self::PASSWORD_MIN_LENGTH . " characters");
        }

        $user = [
            'id' => uniqid('user_'),
            'email' => $email,
            'name' => $name,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'created_at' => new DateTime(),
            'active' => true,
        ];

        $this->users[$user['id']] = $user;
        return $this->sanitizeUser($user);
    }

    /**
     * Authenticate a user
     * 
     * @param string $email User's email
     * @param string $password User's password
     * @return bool Authentication result
     */
    public function login(string $email, string $password): bool
    {
        foreach ($this->users as $user) {
            if ($user['email'] === $email && password_verify($password, $user['password'])) {
                if (!$user['active']) {
                    throw new Exception("User account is inactive");
                }
                $this->currentUserId = $user['id'];
                return true;
            }
        }
        return false;
    }

    /**
     * Get current logged-in user
     * 
     * @return array|null User data or null
     */
    public function getCurrentUser(): ?array
    {
        if ($this->currentUserId === null) {
            return null;
        }
        
        $user = $this->users[$this->currentUserId] ?? null;
        return $user ? $this->sanitizeUser($user) : null;
    }

    /**
     * Logout current user
     */
    public function logout(): void
    {
        $this->currentUserId = null;
    }

    /**
     * Check if user exists
     */
    private function userExists(string $email): bool
    {
        foreach ($this->users as $user) {
            if ($user['email'] === $email) {
                return true;
            }
        }
        return false;
    }

    /**
     * Remove sensitive data from user object
     */
    private function sanitizeUser(array $user): array
    {
        unset($user['password']);
        return $user;
    }

    /**
     * Get all users (admin only)
     */
    public function getAllUsers(): array
    {
        return array_map(fn($user) => $this->sanitizeUser($user), $this->users);
    }
}

// Demo usage
$auth = new AuthService();

try {
    // Register users
    $user1 = $auth->register('alice@example.com', 'SecurePass123', 'Alice Johnson');
    $user2 = $auth->register('bob@example.com', 'MyPassword456', 'Bob Smith');
    
    echo "✓ Users registered successfully\n";
    
    // Login
    if ($auth->login('alice@example.com', 'SecurePass123')) {
        $currentUser = $auth->getCurrentUser();
        echo "✓ Logged in as: {$currentUser['name']}\n";
    }
    
    // List all users
    echo "\nRegistered Users:\n";
    foreach ($auth->getAllUsers() as $user) {
        echo "- {$user['name']} ({$user['email']})\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: {$e->getMessage()}\n";
}

?>

