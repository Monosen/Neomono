using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace NeonomoDemo
{
    /// <summary>
    /// Represents a bank account
    /// </summary>
    public class BankAccount
    {
        public string AccountNumber { get; private set; }
        public string Owner { get; set; }
        public decimal Balance { get; private set; }
        public AccountType Type { get; set; }
        public DateTime CreatedAt { get; private set; }
        public List<Transaction> Transactions { get; private set; }

        public enum AccountType
        {
            Checking,
            Savings,
            Investment
        }

        public BankAccount(string accountNumber, string owner, AccountType type)
        {
            AccountNumber = accountNumber;
            Owner = owner;
            Type = type;
            Balance = 0;
            CreatedAt = DateTime.Now;
            Transactions = new List<Transaction>();
        }

        /// <summary>
        /// Deposit money into the account
        /// </summary>
        public void Deposit(decimal amount, string description = "Deposit")
        {
            if (amount <= 0)
                throw new ArgumentException("Deposit amount must be positive");

            Balance += amount;
            AddTransaction(TransactionType.Deposit, amount, description);
        }

        /// <summary>
        /// Withdraw money from the account
        /// </summary>
        public bool Withdraw(decimal amount, string description = "Withdrawal")
        {
            if (amount <= 0)
                throw new ArgumentException("Withdrawal amount must be positive");

            if (Balance < amount)
                return false;

            Balance -= amount;
            AddTransaction(TransactionType.Withdrawal, amount, description);
            return true;
        }

        /// <summary>
        /// Transfer money to another account
        /// </summary>
        public bool Transfer(BankAccount toAccount, decimal amount)
        {
            if (this.Withdraw(amount, $"Transfer to {toAccount.AccountNumber}"))
            {
                toAccount.Deposit(amount, $"Transfer from {this.AccountNumber}");
                return true;
            }
            return false;
        }

        private void AddTransaction(TransactionType type, decimal amount, string description)
        {
            var transaction = new Transaction
            {
                Type = type,
                Amount = amount,
                Description = description,
                Date = DateTime.Now,
                BalanceAfter = Balance
            };
            Transactions.Add(transaction);
        }

        public IEnumerable<Transaction> GetTransactionHistory(int count = 10)
        {
            return Transactions.OrderByDescending(t => t.Date).Take(count);
        }
    }

    public enum TransactionType
    {
        Deposit,
        Withdrawal,
        Transfer
    }

    public class Transaction
    {
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public decimal BalanceAfter { get; set; }

        public override string ToString()
        {
            return $"[{Date:yyyy-MM-dd HH:mm:ss}] {Type}: ${Amount:F2} - {Description} (Balance: ${BalanceAfter:F2})";
        }
    }

    /// <summary>
    /// Banking system demo
    /// </summary>
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Neomono Banking System Demo ===\n");

            // Create accounts
            var aliceAccount = new BankAccount("ACC001", "Alice Johnson", BankAccount.AccountType.Checking);
            var bobAccount = new BankAccount("ACC002", "Bob Smith", BankAccount.AccountType.Savings);

            // Perform transactions
            aliceAccount.Deposit(1000, "Initial deposit");
            aliceAccount.Deposit(500, "Paycheck");
            bobAccount.Deposit(2000, "Initial deposit");

            // Transfer money
            if (aliceAccount.Transfer(bobAccount, 200))
            {
                Console.WriteLine("✓ Transfer successful");
            }

            // Withdraw money
            if (bobAccount.Withdraw(300, "ATM withdrawal"))
            {
                Console.WriteLine("✓ Withdrawal successful");
            }

            // Display account information
            DisplayAccountInfo(aliceAccount);
            DisplayAccountInfo(bobAccount);

            // Simulate async operation
            await ProcessMonthlyInterest(bobAccount);
        }

        private static void DisplayAccountInfo(BankAccount account)
        {
            Console.WriteLine($"\n--- {account.Owner}'s Account ---");
            Console.WriteLine($"Account Number: {account.AccountNumber}");
            Console.WriteLine($"Type: {account.Type}");
            Console.WriteLine($"Balance: ${account.Balance:F2}");
            Console.WriteLine($"Created: {account.CreatedAt:yyyy-MM-dd}");
            
            Console.WriteLine("\nRecent Transactions:");
            foreach (var transaction in account.GetTransactionHistory(5))
            {
                Console.WriteLine($"  {transaction}");
            }
        }

        private static async Task ProcessMonthlyInterest(BankAccount account)
        {
            Console.WriteLine("\n🔄 Processing monthly interest...");
            await Task.Delay(1000); // Simulate async work
            
            if (account.Type == BankAccount.AccountType.Savings)
            {
                decimal interest = account.Balance * 0.02m;
                account.Deposit(interest, "Monthly interest");
                Console.WriteLine($"✓ Interest applied: ${interest:F2}");
            }
        }
    }
}

