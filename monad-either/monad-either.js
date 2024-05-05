/**
 * Left
 */
class Left {
    constructor(val) {
        this._value = val;
    }

    map() {
        // Left is the sad path
        // so we do nothing
        return this;
    }

    join() {
        // On the sad path, we don't
        // do anything with join
        return this;
    }

    /**
     * @returns {Right|Left} Sum of a and b or an array that contains a, b and the sum of a and b.
     */
     chain() {
        // Boring sad path,
        // do nothing.
        return this;
    }
    
    
    ap() {
        return this;
    }

    toString() {
        const str = this._value.toString();
        return `Left(${$str})`;
    }
    
    static of(val) {
        return new Left(val);
    }
}

/**
 * Right
 */
class Right {
    constructor(val) {
        this._value = val;
    }

    map(fn) {
        return new Right(
            fn(this._value)
        );
    }

    join() {
        if ((this._value instanceof Left)
            || (this._value instanceof Right)) {
            return this._value;
        }
        return this;
    }


    /**
     * @returns {Right|Left} Sum of a and b or an array that contains a, b and the sum of a and b.
     */
    chain(fn) {
        return fn(this._value);
    }
       
    ap(otherEither) {
        const functionToRun = otherEither._value;
        return this.map(functionToRun);
    }

    toString() {
        const str = this._value.toString();
        return `Right(${str})`;
    }
    
    static of(val) {
        return new Right(val);
    }
}

/**
 * Create a new Left
 */
function left(x) {
    return Left.of(x);
}

/**
 * Create a new Right
 */
function right(x) {
    return Right.of(x);
}

/**
 * Either.
 *
 * Run either leftFunc or rightFunc depending on whether or not
 * e is an instance of Left or Right.
 */
function either(leftFunc, rightFunc, e) {
        return (e instanceof Left) ? leftFunc(e._value) : rightFunc(e._value);
}


/**
 * LiftA2
 *
 * Take a function that works with regular values,
 * and make it work with any object that provides
 * .ap()
 */
function liftA2(func) {
    return function runApplicativeFunc(a, b) {
        return b.ap(a.map(func));
    };
}


export {
    Right,
    Left,
    left,
    right,
    either,
    liftA2
}