import { EventEmitter } from 'events';

/**
 * Represents a message in the chat system
 */
interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
  reactions: Map<string, string[]>;
}

/**
 * Represents a user in the chat system
 */
interface User {
  id: string;
  username: string;
  displayName: string;
  status: 'online' | 'away' | 'offline';
  avatar?: string;
}

/**
 * Chat room with real-time messaging capabilities
 */
class ChatRoom extends EventEmitter {
  private users: Map<string, User>;
  private messages: Message[];
  private readonly maxMessages: number;

  constructor(maxMessages: number = 1000) {
    super();
    this.users = new Map();
    this.messages = [];
    this.maxMessages = maxMessages;
  }

  /**
   * Add a user to the chat room
   */
  public addUser(user: User): void {
    if (this.users.has(user.id)) {
      throw new Error(`User ${user.id} already exists`);
    }
    this.users.set(user.id, user);
    this.emit('userJoined', user);
  }

  /**
   * Remove a user from the chat room
   */
  public removeUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    this.users.delete(userId);
    this.emit('userLeft', user);
    return true;
  }

  /**
   * Send a message to the chat room
   */
  public sendMessage(userId: string, content: string): Message {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const message: Message = {
      id: this.generateMessageId(),
      userId,
      content,
      timestamp: new Date(),
      reactions: new Map(),
    };

    this.messages.push(message);
    
    // Keep only the last maxMessages
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    this.emit('messageSent', message, user);
    return message;
  }

  /**
   * Add a reaction to a message
   */
  public addReaction(messageId: string, userId: string, emoji: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, []);
    }

    const reactors = message.reactions.get(emoji)!;
    if (!reactors.includes(userId)) {
      reactors.push(userId);
      this.emit('reactionAdded', message, userId, emoji);
    }
  }

  /**
   * Edit an existing message
   */
  public editMessage(messageId: string, userId: string, newContent: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (message.userId !== userId) {
      throw new Error('Cannot edit messages from other users');
    }

    message.content = newContent;
    message.edited = true;
    this.emit('messageEdited', message);
  }

  /**
   * Get recent messages
   */
  public getRecentMessages(count: number = 50): Message[] {
    return this.messages.slice(-count);
  }

  /**
   * Get online users
   */
  public getOnlineUsers(): User[] {
    return Array.from(this.users.values()).filter(
      user => user.status === 'online'
    );
  }

  /**
   * Search messages by content
   */
  public searchMessages(query: string): Message[] {
    const lowerQuery = query.toLowerCase();
    return this.messages.filter(msg =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Demo usage
const chatRoom = new ChatRoom();

// Add event listeners
chatRoom.on('userJoined', (user: User) => {
  console.log(`✓ ${user.displayName} joined the chat`);
});

chatRoom.on('messageSent', (message: Message, user: User) => {
  console.log(`[${message.timestamp.toISOString()}] ${user.displayName}: ${message.content}`);
});

// Create users
const alice: User = {
  id: 'user1',
  username: 'alice',
  displayName: 'Alice Johnson',
  status: 'online',
};

const bob: User = {
  id: 'user2',
  username: 'bob',
  displayName: 'Bob Smith',
  status: 'online',
};

// Add users and send messages
chatRoom.addUser(alice);
chatRoom.addUser(bob);

const msg1 = chatRoom.sendMessage('user1', 'Hey everyone! 👋');
const msg2 = chatRoom.sendMessage('user2', 'Hi Alice! How are you?');
chatRoom.addReaction(msg1.id, 'user2', '👋');

console.log(`\nOnline users: ${chatRoom.getOnlineUsers().length}`);
console.log(`Recent messages: ${chatRoom.getRecentMessages(10).length}`);

export { ChatRoom, User, Message };

