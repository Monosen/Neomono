package main

import (
	"fmt"
	"net/http"
	"time"
)

// User represents a user in the system
type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// UserService handles user-related operations
type UserService struct {
	users map[int]*User
}

// NewUserService creates a new user service instance
func NewUserService() *UserService {
	return &UserService{
		users: make(map[int]*User),
	}
}

// CreateUser adds a new user to the service
func (s *UserService) CreateUser(name, email string) *User {
	user := &User{
		ID:        len(s.users) + 1,
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
	}
	s.users[user.ID] = user
	return user
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(id int) (*User, error) {
	user, exists := s.users[id]
	if !exists {
		return nil, fmt.Errorf("user with ID %d not found", id)
	}
	return user, nil
}

func main() {
	service := NewUserService()
	
	// Create some users
	user1 := service.CreateUser("Alice Johnson", "alice@example.com")
	user2 := service.CreateUser("Bob Smith", "bob@example.com")
	
	fmt.Printf("Created users: %s and %s\n", user1.Name, user2.Name)
	
	// Start HTTP server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Welcome to Neomono Theme Demo!")
	})
	
	fmt.Println("Server starting on :8080...")
	http.ListenAndServe(":8080", nil)
}

