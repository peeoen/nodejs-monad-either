class Maybe {
    constructor(value) {
        this.value = value;
    }

    bind(func) {
        const newValue = func(this.value); // Applying the function to the current value
        return new Maybe(newValue); // Wrapping the resulting value in a new Maybe instance
    }
}

let result = new Maybe({obj: "test1"}).bind(value => "G2").bind(value => false).bind(value => 2)

console.log(result.value); // Output: "G2"