# Python Sample for Neomono Theme

import os
from datetime import datetime

# Decorator
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Executing {func.__name__} at {datetime.now()}")
        return func(*args, **kwargs)
    return wrapper

class DataProcessor:
    """
    A class to process data.
    """
    def __init__(self, data):
        self.data = data
        self._processed = False

    @log_execution
    def process(self):
        # List comprehension
        results = [x * 2 for x in self.data if x > 0]
        self._processed = True
        return results

    def get_status(self):
        return "Processed" if self._processed else "Pending"

# Main execution
if __name__ == "__main__":
    data = [1, -2, 3, 4, -5]
    processor = DataProcessor(data)
    result = processor.process()
    print(f"Result: {result}")
