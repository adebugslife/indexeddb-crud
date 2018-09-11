# IndexedDB API and IDB library (IndexedDB with Promise) CRUD
Comparison between native IndexedDB API and using IDB library in operating CRUD workaround
## Demo
1. [IndexedDb API](https://adebugslife.github.io/indexeddb-crud-demo/)
2. [IDB library](https://adebugslife.github.io/idb-promise-demo/)

## Coverage
1. [Create Database and Table](https://github.com/adebugslife/indexeddb-crud#create-database-and-table)
1. [Create](https://github.com/adebugslife/indexeddb-crud#create)
2. [Read](https://github.com/adebugslife/indexeddb-crud#read)
3. [Update](https://github.com/adebugslife/indexeddb-crud#update)
4. [Delete](https://github.com/adebugslife/indexeddb-crud#delete)

## Create Database and Table
**Native IndexedDB API**
```js
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
  };
  idb.onerror = function (e) {
    console.log('Error', event);
  };

});
```

**IndexedDB with Promise**
```html
 <script type="text/javascript" src="utilities/idb.js"></script>
```
```js
/*
 * Open IndexDB!
 */
var dbPromise = idb.open('myDb', 1, function (upgradeDb) {
  upgradeDb.createObjectStore('myTable', {
    keyPath: 'id',
    autoIncrement: true
  });
})
```

### Create
**Native IndexedDB API**
```js
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
```
**IndexedDB with Promise**
```js
function writeIDB(st, data) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readwrite').objectStore(st).put(data);
      return tx.complete;
    })
    .catch(function (er) {
      console.log('Error', er);
    });
}
```
### Read
**Native IndexedDB API**
```js
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
```

**IndexedDB with Promise**
```js
/*
 * Get Item ID
 */
function getId(st, id) {
  return dbPromise
    .then(function (dbItem) {
      var transaction = dbItem.transaction(st),
        store = transaction.objectStore(st);
      return store.get(id)
    });
}

/*
 * Get All Item
 */
function getAllData(st) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction(st, 'readonly');
      var store = tx.objectStore(st);
      return store.getAll();
    });
}

```
### Update
**Native IndexedDB API**
```js
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
    score.value     = e.target.result.score;
    subject.value   = e.target.result.subject;
  };
}

```

**IndexedDB with Promise**
```js
function updateItem(id) {
  return dbPromise
    .then(function (db) {
      let tx = db.transaction('myTable', 'readwrite'),
        store = tx.objectStore('myTable');
      store.get(id)
        .then(function (res) {
          var code = document.getElementById('maincode'),
            codeId = document.getElementById('id'),
            buyPrice = document.getElementById('buy-price'),
            sellPrice = document.getElementById('sell-price'),
            volume = document.getElementById('volume');

          code.value = res.code;
          codeId.value = res.id;
          buyPrice.value = res.buyPrice;
          sellPrice.value = res.sellPrice;
          volume.value = res.volume;
        });

      return tx.complete;
    })
}
```
### Delete
**Native IndexedDB API**
```js
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
```

**IndexedDB with Promise**
```js
/*
 * Delete Individual Entry
 */
function deleteItem(id) {
  return dbPromise
    .then(function (db) {
      var tx = db.transaction('myTable', 'readwrite');
      tx.objectStore('myTable').delete(id);
      return tx.complete;
    })
    .then(function () {
      console.log('Item deleted!');
    });
}
/*
 * Delete All IndexDB Entries
 */
function clearAllFx() {
  return dbPromise
    .then((db) => {
      const tx = db.transaction('myTable', 'readwrite');
      tx.objectStore('myTable').clear();
      return tx.complete;
    })
}
```

## Reference
* See [IndexedDB API - Web APIs| MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
* See [IndexedDB Promised](https://github.com/jakearchibald/idb)
* For UI: [Material Design Lite](https://getmdl.io/)


## Author
* **Ann G.** ⊂(・﹏・⊂) [Adebugslife](http://adebugslife.com)


License
----
GNU General Public License v3.0

**Free Reference, Hell Yeah! (￣▽￣)ゞ**
