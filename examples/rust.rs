use std::collections::HashMap;
use std::fmt;

/// Represents a task with a title and completion status
#[derive(Debug, Clone)]
pub struct Task {
    id: u32,
    title: String,
    completed: bool,
    tags: Vec<String>,
}

impl Task {
    /// Creates a new task with the given title
    pub fn new(id: u32, title: String) -> Self {
        Task {
            id,
            title,
            completed: false,
            tags: Vec::new(),
        }
    }

    /// Marks the task as completed
    pub fn complete(&mut self) {
        self.completed = true;
    }

    /// Adds a tag to the task
    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
        }
    }
}

impl fmt::Display for Task {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let status = if self.completed { "✓" } else { "○" };
        write!(f, "[{}] {} - {}", status, self.id, self.title)
    }
}

/// Manages a collection of tasks
pub struct TaskManager {
    tasks: HashMap<u32, Task>,
    next_id: u32,
}

impl TaskManager {
    pub fn new() -> Self {
        TaskManager {
            tasks: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn add_task(&mut self, title: String) -> &Task {
        let id = self.next_id;
        let task = Task::new(id, title);
        self.tasks.insert(id, task);
        self.next_id += 1;
        self.tasks.get(&id).unwrap()
    }

    pub fn get_task(&self, id: u32) -> Option<&Task> {
        self.tasks.get(&id)
    }

    pub fn complete_task(&mut self, id: u32) -> Result<(), String> {
        match self.tasks.get_mut(&id) {
            Some(task) => {
                task.complete();
                Ok(())
            }
            None => Err(format!("Task with id {} not found", id)),
        }
    }

    pub fn list_tasks(&self) -> Vec<&Task> {
        let mut tasks: Vec<&Task> = self.tasks.values().collect();
        tasks.sort_by_key(|t| t.id);
        tasks
    }
}

fn main() {
    let mut manager = TaskManager::new();

    // Add some tasks
    manager.add_task(String::from("Learn Rust"));
    manager.add_task(String::from("Build a web server"));
    manager.add_task(String::from("Try Neomono theme"));

    // Complete a task
    if let Err(e) = manager.complete_task(1) {
        eprintln!("Error: {}", e);
    }

    // List all tasks
    println!("Tasks:");
    for task in manager.list_tasks() {
        println!("{}", task);
    }
}

