// Define the Either monad
class Either {
    constructor(value) {
      this.value = value;
    }
  
    static left(error) {
      return new Left(error);
    }
  
    static right(value) {
      return new Right(value);
    }
  
    // Bind function
    bind(fn) {
      if (this instanceof Left) {
        return this;
      }
      return fn(this.value);
    }
  }
  
  // Left side of Either, represents a failure
  class Left extends Either {
    constructor(value) {
      super(value);
    }
  
    bind() {
      return this;
    }
  }
  
  // Right side of Either, represents a success
  class Right extends Either {
    constructor(value) {
      super(value);
    }
  }
  
  // Example usage
  function divide(x, y) {
    if (y === 0) {
      return Either.left("Division by zero");
    } else {
      return Either.right(x / y);
    }
  }
  
  function squareRoot(x) {
    if (x < 0) {
      return Either.left("Square root of negative number");
    } else {
      return Either.right(Math.sqrt(x));
    }
  }
  
  // Compose the operations using bind
  const result = divide(10, 0).bind((value) => squareRoot(value));
  
  // Handle the result
  if (result instanceof Left) {
    console.error("Error:", result.value);
  } else {
    console.log("Result:", result.value);
  }