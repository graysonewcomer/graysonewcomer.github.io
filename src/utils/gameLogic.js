import { format } from 'date-fns';

// Collection of code snippets for different languages
const codeSnippets = [
  {
    language: 'JavaScript',
    code: `// Simple React component using hooks
import React, { useState, useEffect } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  }, [count]);
  
  return (
    '<div>' +
      '<p>You clicked ' + count + ' times</p>' +
      '<button onClick="setCount(count + 1)">' +
        'Click me' +
      '</button>' +
    '</div>'
  );
};

export default Counter;`
  },
  {
    language: 'Python',
    code: `# A simple class definition in Python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
        
    @classmethod
    def from_birth_year(cls, name, birth_year):
        age = 2025 - birth_year
        return cls(name, age)
        
# Create a new person
person = Person("Alice", 30)
print(person.greet())

# Create a person using the class method
person2 = Person.from_birth_year("Bob", 1995)
print(person2.greet())`
  },
  {
    language: 'Java',
    code: `// A simple Java program
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        
        System.out.println("Fruits available:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // Using streams (Java 8+)
        fruits.stream()
              .filter(f -> f.startsWith("A"))
              .map(String::toUpperCase)
              .forEach(System.out::println);
    }
}`
  },
  {
    language: 'TypeScript',
    code: `// TypeScript interface and class implementation
interface Vehicle {
  brand: string;
  year: number;
  start(): void;
  stop(): void;
}

class Car implements Vehicle {
  brand: string;
  year: number;
  model: string;
  
  constructor(brand: string, year: number, model: string) {
    this.brand = brand;
    this.year = year;
    this.model = model;
  }
  
  start(): void {
    console.log(\`Starting \${this.brand} \${this.model}...\`);
  }
  
  stop(): void {
    console.log(\`Stopping \${this.brand} \${this.model}...\`);
  }
  
  getInfo(): string {
    return \`\${this.year} \${this.brand} \${this.model}\`;
  }
}

const myCar: Car = new Car("Toyota", 2022, "Corolla");
myCar.start();
console.log(myCar.getInfo());
myCar.stop();`
  },
  {
    language: 'C#',
    code: `// C# LINQ example
using System;
using System.Collections.Generic;
using System.Linq;

namespace LinqExample
{
    class Program
    {
        static void Main(string[] args)
        {
            List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
            
            // Using LINQ to filter even numbers and square them
            var result = numbers
                .Where(n => n % 2 == 0)
                .Select(n => n * n)
                .ToList();
                
            Console.WriteLine("Squares of even numbers:");
            foreach (var num in result)
            {
                Console.WriteLine(num);
            }
            
            // Using LINQ query syntax
            var query = from n in numbers
                        where n % 2 == 0
                        select n * n;
                        
            Console.WriteLine("Same result using query syntax:");
            foreach (var num in query)
            {
                Console.WriteLine(num);
            }
        }
    }
}`
  },
  {
    language: 'PHP',
    code: `<?php
// PHP class with constructor and methods
class Database {
    private $host;
    private $username;
    private $password;
    private $connection;
    
    public function __construct($host, $username, $password) {
        $this->host = $host;
        $this->username = $username;
        $this->password = $password;
    }
    
    public function connect() {
        try {
            $this->connection = new PDO(
                "mysql:host={$this->host};dbname=test", 
                $this->username, 
                $this->password
            );
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "Connected successfully";
        } catch(PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
        }
    }
    
    public function query($sql) {
        return $this->connection->query($sql);
    }
}

// Usage
$db = new Database("localhost", "root", "password");
$db->connect();
$users = $db->query("SELECT * FROM users");
?>`
  },
  {
    language: 'Ruby',
    code: `# Ruby class with inheritance
class Animal
  attr_reader :name
  
  def initialize(name)
    @name = name
  end
  
  def speak
    "Some generic animal sound"
  end
end

class Dog < Animal
  def initialize(name, breed)
    super(name)
    @breed = breed
  end
  
  def speak
    "Woof! I'm #{@name}, a #{@breed}"
  end
  
  def fetch(item)
    "#{@name} is fetching #{item}"
  end
end

# Create instances
fido = Dog.new("Fido", "Labrador")
puts fido.speak
puts fido.fetch("ball")

# Using blocks
5.times do |i|
  puts "Ruby iteration #{i+1}"
end

# Array manipulation with map
numbers = [1, 2, 3, 4, 5]
squares = numbers.map { |n| n * n }
puts squares.inspect`
  },
  {
    language: 'Go',
    code: `// Go concurrency example
package main

import (
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Printf("Worker %d started job %d\\n", id, j)
		time.Sleep(time.Second)
		fmt.Printf("Worker %d finished job %d\\n", id, j)
		results <- j * 2
	}
}

func main() {
	jobs := make(chan int, 5)
	results := make(chan int, 5)

	// Start three worker goroutines
	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	// Send 5 jobs
	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	// Collect results
	for a := 1; a <= 5; a++ {
		<-results
	}
}

// A simple struct
type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() string {
	return fmt.Sprintf("Hello, my name is %s and I am %d years old", p.Name, p.Age)
}`
  },
  {
    language: 'Swift',
    code: `// Swift protocol and extension example
import Foundation

protocol Vehicle {
    var brand: String { get }
    var year: Int { get }
    
    func start()
    func stop()
}

extension Vehicle {
    func getInfo() -> String {
        return "\\(year) \\(brand)"
    }
}

class Car: Vehicle {
    let brand: String
    let year: Int
    let model: String
    
    init(brand: String, year: Int, model: String) {
        self.brand = brand
        self.year = year
        self.model = model
    }
    
    func start() {
        print("Starting \\(brand) \\(model)...")
    }
    
    func stop() {
        print("Stopping \\(brand) \\(model)...")
    }
    
    func getDetailedInfo() -> String {
        return "\\(year) \\(brand) \\(model)"
    }
}

// Using optionals
var myCar: Car? = Car(brand: "Tesla", year: 2023, model: "Model 3")

if let car = myCar {
    car.start()
    print(car.getDetailedInfo())
    car.stop()
} else {
    print("Car is nil")
}

// Swift array and closure
let numbers = [1, 2, 3, 4, 5]
let squares = numbers.map { $0 * $0 }
print(squares)`
  },
  {
    language: 'Rust',
    code: `// Rust ownership and borrowing example
use std::collections::HashMap;

fn main() {
    // String ownership
    let s1 = String::from("hello");
    let s2 = s1.clone(); // Clone to avoid ownership transfer
    
    println!("s1: {}, s2: {}", s1, s2);
    
    // Borrowing
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Red"), 50);
    
    // Immutable borrow
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
    
    // Mutable borrow
    let team_name = String::from("Blue");
    let score = scores.get_mut(&team_name);
    
    match score {
        Some(s) => *s += 5,
        None => println!("Team not found"),
    }
    
    // Structs and implementation
    struct Rectangle {
        width: u32,
        height: u32,
    }
    
    impl Rectangle {
        fn area(&self) -> u32 {
            self.width * self.height
        }
        
        fn can_hold(&self, other: &Rectangle) -> bool {
            self.width > other.width && self.height > other.height
        }
    }
    
    let rect1 = Rectangle { width: 30, height: 50 };
    println!("Area: {}", rect1.area());
}`
  },
  {
    language: 'Kotlin',
    code: `// Kotlin data class and extension function
package com.example

data class Person(val name: String, val age: Int)

fun Person.canVote(): Boolean {
    return age >= 18
}

fun main() {
    val people = listOf(
        Person("Alice", 25),
        Person("Bob", 17),
        Person("Charlie", 30)
    )
    
    // Using higher-order functions
    val adults = people.filter { it.age >= 18 }
                       .sortedBy { it.name }
    
    println("Adults:")
    adults.forEach { println("\${it.name}, \${it.age}") }
    
    // Using extension function
    people.forEach {
        val status = if (it.canVote()) "can vote" else "cannot vote"
        println("\${it.name} \${status}")
    }
    
    // Null safety
    val nullablePerson: Person? = null
    val name = nullablePerson?.name ?: "Unknown"
    println("Name: \${name}")
    
    // When expression
    val x = 5
    val result = when {
        x < 0 -> "Negative"
        x == 0 -> "Zero"
        x < 10 -> "Small positive"
        else -> "Large positive"
    }
    println("Result: \${result}")
}`
  }
];

// Function to get a deterministic code snippet based on the date
export const getCodeSnippetForDay = () => {
  const today = new Date();
  const dateString = format(today, 'yyyy-MM-dd');

  // Use the date string to deterministically select a snippet
  // This ensures the same snippet is shown for all users on the same day
  const dateSum = dateString.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const snippetIndex = dateSum % codeSnippets.length;

  return codeSnippets[snippetIndex];
};

// Function to get a specific code snippet by language (for testing)
export const getCodeSnippetByLanguage = (language) => {
  return codeSnippets.find(snippet => snippet.language === language);
};

// Function to get all available languages
export const getAvailableLanguages = () => {
  return codeSnippets.map(snippet => snippet.language);
};
