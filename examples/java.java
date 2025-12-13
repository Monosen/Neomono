import java.util.*;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Represents a product in an e-commerce system
 */
public class Product {
    private String id;
    private String name;
    private double price;
    private int stock;
    private Category category;
    private List<String> tags;

    public enum Category {
        ELECTRONICS, CLOTHING, BOOKS, FOOD, TOYS
    }

    public Product(String id, String name, double price, int stock, Category category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.tags = new ArrayList<>();
    }

    // Getters and setters
    public String getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public Category getCategory() { return category; }

    public void addTag(String tag) {
        if (!tags.contains(tag)) {
            tags.add(tag);
        }
    }

    public boolean isInStock() {
        return stock > 0;
    }

    public void decreaseStock(int amount) throws IllegalArgumentException {
        if (amount > stock) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        stock -= amount;
    }

    @Override
    public String toString() {
        return String.format("Product{id='%s', name='%s', price=%.2f, stock=%d}", 
                           id, name, price, stock);
    }
}

/**
 * Shopping cart implementation
 */
class ShoppingCart {
    private Map<String, Integer> items;
    private String userId;
    private LocalDateTime createdAt;

    public ShoppingCart(String userId) {
        this.userId = userId;
        this.items = new HashMap<>();
        this.createdAt = LocalDateTime.now();
    }

    public void addItem(String productId, int quantity) {
        items.merge(productId, quantity, Integer::sum);
    }

    public void removeItem(String productId) {
        items.remove(productId);
    }

    public int getItemCount() {
        return items.values().stream()
                   .mapToInt(Integer::intValue)
                   .sum();
    }

    public double calculateTotal(Map<String, Product> products) {
        return items.entrySet().stream()
                   .mapToDouble(entry -> {
                       Product product = products.get(entry.getKey());
                       return product != null ? product.getPrice() * entry.getValue() : 0;
                   })
                   .sum();
    }

    public void clear() {
        items.clear();
    }
}

/**
 * Main application class demonstrating the Neomono theme
 */
class ECommerceDemo {
    public static void main(String[] args) {
        // Create product catalog
        Map<String, Product> catalog = new HashMap<>();
        
        Product laptop = new Product("LAPTOP-001", "Gaming Laptop", 1299.99, 15, 
                                    Product.Category.ELECTRONICS);
        laptop.addTag("gaming");
        laptop.addTag("high-performance");
        
        Product book = new Product("BOOK-001", "Java Programming", 49.99, 50, 
                                  Product.Category.BOOKS);
        book.addTag("programming");
        
        catalog.put(laptop.getId(), laptop);
        catalog.put(book.getId(), book);

        // Create shopping cart
        ShoppingCart cart = new ShoppingCart("user123");
        cart.addItem(laptop.getId(), 1);
        cart.addItem(book.getId(), 2);

        // Calculate total
        double total = cart.calculateTotal(catalog);
        
        System.out.println("Shopping Cart Summary:");
        System.out.println("Items: " + cart.getItemCount());
        System.out.printf("Total: $%.2f%n", total);
        
        // Display products
        System.out.println("\nAvailable Products:");
        catalog.values().forEach(System.out::println);
    }
}

