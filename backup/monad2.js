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

// CSV Parsing Code
// ---------------------------------------------------------------------------------

/**
 * Split a row string into an array of fields.
 *
 * Note: Don't do this. Use a CSV parsing library
 * like Neat CSV instead.
 * https://github.com/sindresorhus/neat-csv
 */
function splitFields(row) {
    return row.replace(/"(.*)"/, '$1').split('","');
}

/**
 * Zip Row data with header fields to create an object.
 */
function zipRow(headerFields) {
    return function zipRowWithHeaderFields(fieldData) {
        const lengthMatch = (headerFields.length == fieldData.length);
        return (!lengthMatch)
            ? left(new Error("Row has an unexpected number of fields"))
            : right(_.zipObject(headerFields, fieldData));
    };
}

/**
 * Add a human-readable date string to a message object.
 */
function addDateStr(messageObj) {
    const errMsg = 'Unable to parse date stamp in message object';
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];
    const d = new Date(messageObj.datestamp);
    if (isNaN(d)) { return left(new Error(errMsg));  }

    const datestr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    return right({datestr, ...messageObj});
}


const rowToMessage = _.template(`<li class="Message Message--<%= viewed %>">
  <a href="<%= href %>" class="Message-link"><%= content %></a>
  <time datetime="<%= datestamp %>"><%= datestr %></time>
<li>`);

const showError = _.template(`<li class="Error"><%= message %></li>`);

/**
 * Process a row of CSV data an return a list item
 * HTML string.
 */
function processRow(headerFields, row) {
    const rowObjWithDate = right(row)
        .map(splitFields)
        .chain(zipRow(headerFields))
        .chain(addDateStr);
    return either(showError, rowToMessage, rowObjWithDate);
}


/**
 * Split a CSV string into rows.
 *
 * Note: Don't do this. Use a CSV parsing library
 * like Neat CSV instead.
 * https://github.com/sindresorhus/neat-csv
 */
function splitCSVToRows(csvData) {
    // There should always be a header row... so if there's no
    // newline character, something is wrong.
    return (csvData.indexOf('\n') < 0)
        ? left(new Error('No header row found in CSV data'))
        : right(csvData.split('\n'));
}

/**
 * Process rows.
 */
function processRows(headerFields) {
    return function processRowsWithHeaderFields(dataRows) {
        // Note this is Array map, not Either map.
        return dataRows.map(row => processRow(headerFields, row));
    }
}

/**
 * Take an array of messages HTML list items and create an
 * unordered list string.
 */
function showMessages(messages) {
    return `<ul class="Messages">${messages.join('\n')}</ul>`;
}

/**
 * Our main function. Take CSV data and convert it to an
 * HTML string of formatted list items.
 */
function csvToMessages(csvData) {
    const csvRows      = splitCSVToRows(csvData);
    const headerFields = csvRows.map(_.head).map(splitFields);
    const dataRows     = csvRows.map(_.tail);
    const processRowsA = liftA2(processRows);
    const messagesArr  = processRowsA(headerFields, dataRows);
    return either(showError, showMessages, messagesArr);
}

// Data and Main code.
// ---------------------------------------------------------------------------------

const csvData = `"datestamp","content","viewed","href"
"2018-10-27T05:33:34+00:00","@madhatter invited you to tea","unread","https://example.com/invite/tea/3801"
"2018-10-26T13:47:12+00:00","@queenofhearts mentioned you in 'Croquet Tournament' discussion","viewed","https://example.com/discussions/croquet/1168"
"2018-10-25T03:50:08+00:00","@cheshirecat sent you a grin","unread","https://example.com/interactions/grin/88"`;



document.querySelector('#messages').innerHTML = csvToMessages(csvData);