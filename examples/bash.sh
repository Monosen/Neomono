#!/bin/bash

# Neomono Theme Demo Script
# A comprehensive bash script showing various features

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color codes for terminal output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/tmp/neomono_demo.log"
readonly MAX_RETRIES=3

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to log messages
log() {
    local level=$1
    shift
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
    echo "$message" >> "$LOG_FILE"
    
    case $level in
        ERROR)
            print_color "$RED" "✗ $*"
            ;;
        SUCCESS)
            print_color "$GREEN" "✓ $*"
            ;;
        INFO)
            print_color "$CYAN" "ℹ $*"
            ;;
        WARNING)
            print_color "$YELLOW" "⚠ $*"
            ;;
    esac
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    log INFO "Checking system requirements..."
    
    local required_commands=("git" "curl" "jq")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if command_exists "$cmd"; then
            log SUCCESS "$cmd is installed"
        else
            missing_commands+=("$cmd")
            log ERROR "$cmd is not installed"
        fi
    done
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        log ERROR "Missing required commands: ${missing_commands[*]}"
        return 1
    fi
    
    return 0
}

# Function to create backup
create_backup() {
    local source=$1
    local backup_dir="${source}.backup.$(date +%Y%m%d_%H%M%S)"
    
    log INFO "Creating backup: $backup_dir"
    
    if [ -e "$source" ]; then
        cp -r "$source" "$backup_dir"
        log SUCCESS "Backup created successfully"
        echo "$backup_dir"
    else
        log ERROR "Source not found: $source"
        return 1
    fi
}

# Function to download file with retries
download_with_retry() {
    local url=$1
    local output=$2
    local retry_count=0
    
    log INFO "Downloading from: $url"
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if curl -fsSL -o "$output" "$url"; then
            log SUCCESS "Download completed"
            return 0
        else
            retry_count=$((retry_count + 1))
            log WARNING "Download failed, retry $retry_count/$MAX_RETRIES"
            sleep 2
        fi
    done
    
    log ERROR "Download failed after $MAX_RETRIES attempts"
    return 1
}

# Function to process JSON data
process_json() {
    local json_file=$1
    
    if [ ! -f "$json_file" ]; then
        log ERROR "JSON file not found: $json_file"
        return 1
    fi
    
    log INFO "Processing JSON data..."
    
    # Extract and display data
    local name=$(jq -r '.name' "$json_file")
    local version=$(jq -r '.version' "$json_file")
    
    print_color "$PURPLE" "Name: $name"
    print_color "$PURPLE" "Version: $version"
}

# Function to setup environment
setup_environment() {
    log INFO "Setting up environment..."
    
    # Create necessary directories
    local dirs=("logs" "data" "tmp" "backups")
    
    for dir in "${dirs[@]}"; do
        if mkdir -p "$dir" 2>/dev/null; then
            log SUCCESS "Created directory: $dir"
        else
            log WARNING "Directory already exists: $dir"
        fi
    done
    
    # Set environment variables
    export NEOMONO_ENV="development"
    export NEOMONO_DEBUG="true"
    
    log SUCCESS "Environment setup complete"
}

# Function to cleanup
cleanup() {
    log INFO "Performing cleanup..."
    
    # Remove temporary files
    rm -f /tmp/neomono_*.tmp
    
    log SUCCESS "Cleanup complete"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Main function
main() {
    print_color "$CYAN" "╔═══════════════════════════════════╗"
    print_color "$CYAN" "║   Neomono Theme Demo Script      ║"
    print_color "$CYAN" "╚═══════════════════════════════════╝"
    echo
    
    # Initialize log file
    echo "=== New Session ===" >> "$LOG_FILE"
    
    # Check requirements
    if ! check_requirements; then
        log ERROR "Requirements check failed"
        exit 1
    fi
    
    # Setup environment
    setup_environment
    
    # Example operations
    log INFO "Script directory: $SCRIPT_DIR"
    log INFO "Log file: $LOG_FILE"
    
    # Display system info
    print_color "$BLUE" "\nSystem Information:"
    echo "  OS: $(uname -s)"
    echo "  Kernel: $(uname -r)"
    echo "  User: $USER"
    echo "  Shell: $SHELL"
    
    log SUCCESS "Demo script completed successfully!"
}

# Run main function
main "$@"

