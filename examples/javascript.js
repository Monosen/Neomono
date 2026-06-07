/**
 * JavaScript Sample for Neomono Theme
 */

import { Component } from 'react';

// Constants
const MAX_COUNT = 100;
const API_URL = "https://api.example.com";

// Class definition
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  // Method
  increment() {
    if (this.state.count < MAX_COUNT) {
      this.setState({ count: this.state.count + 1 });
    }
  }

  render() {
    const { count } = this.state;
    return (
      <div>
        <h1>Count: {count}</h1>
        <button onClick={() => this.increment()}>Increment</button>
      </div>
    );
  }
}

// Function
function calculateTotal(items) {
  return items.reduce((acc, item) => acc + item.price, 0);
}

const items = [{ name: "Item 1", price: 10 }, { name: "Item 2", price: 20 }];
console.log(`Total: ${calculateTotal(items)}`);
