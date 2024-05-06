import {  right, left, either,liftA2 } from "./monad-either.js";
import _ from 'lodash'
import axios from 'axios'

function splitFields(row) {
    return row.replace(/"(.*)"/, '$1').split('","');
}

function zipRow(headerFields) {
    return function zipRowWithHeaderFields(fieldData) {
        const lengthMatch = (headerFields.length == fieldData.length);
        return (!lengthMatch)
            ? left(new Error("Row has an unexpected number of fields"))
            : right(_.zipObject(headerFields, fieldData));
    };
}

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

async function fetchData(rowObjWithDate) {
    const data = await axios.get(`https://reqres.in/api/users?page=1`)
    return right(data)
}
/**
 * Our main function. Take CSV data and convert it to an
 * HTML string of formatted list items.
 */
async function csvToMessages(csvData) {
    const csvRows      = splitCSVToRows(csvData);
    const headerFields = csvRows.map(_.head).map(splitFields);
    const dataRows     = csvRows.map(_.tail);
    const datax =  await dataRows.chain(fetchData)
    const processRowsA = liftA2(processRows);
    const messagesArr  = processRowsA(headerFields, dataRows);

    // const funcInEither = headerFields.map(processRows);
    // const messagesArr2  = dataRows.ap(funcInEither);


    return either(showError, showMessages, messagesArr);
}


// Data and Main code.
// ---------------------------------------------------------------------------------

const csvData = `"datestamp","content","viewed","href"
"2018-10-27T05:33:34+00:00","@madhatter invited you to tea","unread","https://example.com/invite/tea/3801"
"2018-10-26T13:47:12+00:00","@queenofhearts mentioned you in 'Croquet Tournament' discussion","viewed","https://example.com/discussions/croquet/1168"
"2018-10-25T03:50:08+00:00","@cheshirecat sent you a grin","unread","https://example.com/interactions/grin/88"`;

// const csvData =  ""

const data = await csvToMessages(csvData)
console.log(data);