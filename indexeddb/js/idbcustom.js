/*
 * Open IndexDB
 */
var idb;
document.addEventListener('DOMContentLoaded', function () {
  if (!window.indexedDB) {
    console.log('Your browser doesn\'t support indexedDB');
  }
  // Database
  idb = indexedDB.open('myDb', 1);
  idb.onupgradeneeded = function (e) {
    var db = e.target.result;

    // IndexedDB Table
    if (!db.objectStoreNames.contains('myTable')) {
      var costave = db.createObjectStore('myTable', { keyPath: 'id', autoIncrement: true });
    }
    costave.createIndex('name', 'name', { unique: false });
  };

  idb.onsuccess = function (e) {
    console.log('Open db');
    db = e.target.result;
    showComputation();
  };
  idb.onerror = function (e) {
    console.log('Error', event);
  };

});

/*
 * Add
 */
function enterCost(e) {
  e.preventDefault();
  var transaction = db.transaction(['myTable'], 'readwrite'),
    store = transaction.objectStore('myTable'),
    id = document.getElementById('id').value,
    name = document.getElementById('name').value.toUpperCase(),
    subject = document.getElementById('subject').value,
    score = Number(document.getElementById('score').value);

  if (name === '' || subject === '' || score === '') {
    alert('Please enter valid data');
    return;
  }

  var stockDetails = {
    name: name,
    score: score,
    subject: subject
  };

  if (!id) {
    //Store Add if there is no existing id
    request = store.add(stockDetails);
  } else {
    // Fetch matched ID from existing data
    request = store.get(Number(id));
  }

  request.onsuccess = function (e) {
    var data = e.target.result;

    for (var item in data) {
      switch (item) {
        case 'name':
          data.name = name;
        case 'score':
          data.score = score;
        case 'subject':
          data.subject = subject;
      }
    }

    (!id) ? console.log('Score added successfully') : store.put(data);

    // Reloads the page to see updated output
    window.location.href = '/';
  };
  request.onerror = function (e) {
    console.log("Error in store.add", e);
  };
}

/*
 * Read
 */
function showComputation() {
  var resultContainer = document.getElementById('result'),
      transaction     = db.transaction(['myTable'], 'readonly'),
      store           = transaction.objectStore('myTable'),
      index           = store.index('name'),
      tableOutput     = '';

  index.openCursor().onsuccess = function (e) {
    var cursor = e.target.result;
    if (cursor) {
      tableOutput += "<thead><tr class='highlight'><th class='codeItem mdl-data-table__cell--non-numeric'>Code: " + cursor.value.name + "</th>";
      tableOutput += "<td><a href='' onClick='deleteItem(" + cursor.value.id + ")'>Delete</a> <a href='' onClick='updateItem(" + cursor.value.id + ");return false'>Edit</a></td><tr></thead>";
      tableOutput += "<tr><td class='mdl-data-table__cell--non-numeric'>Subject: </td><td>" + cursor.value.subject + "</td></tr>";
      tableOutput += "<tr><td class='mdl-data-table__cell--non-numeric'>Score: </td><td>" +  cursor.value.score.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td></tr>";

      cursor.continue();
    }
    resultContainer.innerHTML = tableOutput;
  };
}

/*
 * Delete All IndexDB Entries
 */
function clearAllFx() {
  var deleteDB = indexedDB.deleteDatabase('myDb');
  deleteDB.onsuccess = function () {
    console.log('Database Deleted');
  };
  deleteDB.onerror = function () {
    console.log('Delete operation denied');
  };
}
var clearAll = document.getElementById('clearAll');
clearAll.addEventListener('click', clearAllFx);

/*
 * Delete Individual Entry
 */
function deleteItem(id) {
  var transaction = db.transaction(['myTable'], 'readwrite');
  var store       = transaction.objectStore('myTable');
  var request     = store.delete(id);

  request.onsuccess = function (e) {
    console.log('Successfully removed');
  };
}

/*
 * Update
 */
function updateItem(id) {
  var transaction = db.transaction(['myTable'], 'readwrite'),
      store       = transaction.objectStore('myTable'),
      request     = store.get(id),
      name        = document.getElementById('name'),
      codeId      = document.getElementById('id'),
      score       = document.getElementById('score'),
      subject     = document.getElementById('subject');

  request.onsuccess = function (e) {
    name.value      = e.target.result.name;
    codeId.value    = e.target.result.id;
    score.value  = e.target.result.score;
    subject.value    = e.target.result.subject;
  };
}

/*
 * Onsubmit Event
 */
var calcForm = document.getElementById('calcForm');
calcForm.addEventListener('submit', enterCost);