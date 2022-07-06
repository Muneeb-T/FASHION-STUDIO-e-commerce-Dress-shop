# MonoDB

> :warning: Use it only with Node V12


## Install

`npm i monodb --save`

## About

MonoDB is an extremely simple serialization system. It allows to store objects in JSON files, and this via a very simple and intuitive class interface.

All objects are store in differente file, it's esay to view them inside file browser. The database are very simple structure :
```
+-- dbname
    +-- class1
        +-- object1_id.json
        +-- object2_id.json
    +-- class2
        +-- object1_id.json
```

If you know the id of your object it is very simple to find your file.

## Performances

MonoDB performance depends directly on the machine on which you use it. If your server uses an SSD the performance will be better than with an HDD.

Furthermore, the number of objects you can store and the maximum size of each object depends on the formatting of your storage device.

But in general, MonoDB should not be used for intensive and sensitive training purposes. Its use is suitable for the not very critical service and whose simplicity of development is important.

| Format | Max object size | Max collection size |
| :----:|:----:|:----:|
| FAT32 | 2 GiB | 2^16 - 1 (65,535) |
| NTFS | 16 TiB  | 2^32 (4,294,967,295) |
| ext4 | 16 TiB | Unlimited |

## How to use

### Declare class
```js
const MonoDB = require("monodb");

// Create your own class
class Person extends MonoDB {
    constructor(name, age) {
        super();
        this.name = name;
        this.age = age;
    }

    isLegalAge() {
        return age >= 18;
    }
}
```

### Create and save object

```js
let bob = new Person("Bob", 17);

// Promise behavior
bob.save().then(handle).catch(errHandle);

// or within async/await function

try {
    await bob.save();
} catch(err) {
    console.error(err);
}
```

### Retrieve object

```js
Person.get(bob.id).then(function (pers) {
    console.log(pers);
    // {
    //     _id: "Some random id",
    //     name: "Bob",
    //     age: 17,
    //     _creationDate: "the date of call new operator",
    //     _lastUpdateDate: "the date of the last save"
    // }
});

// Or within async/await function

try {
    let bob = await Person.get(bob_id);
} catch(err) {
    console.error(err);
}
```

### Delete object

```js
bob.delete().then(handle).catch(errHandle);

// Or within async/await function

try {
    await bob.delete();
} catch(err) {
    console.error(err);
}
```

### Test equality between two objects

```js
let alice = new Person("Alice", 19);

bob.equals(alice); // False

bob.equals(bob); // True
```

By default `equals` return true if the id's are the same, but you can override it.

### Change database path

```js
MonoDB.dbPath = "/path/to/db";
```
Use this once in program to not change the destination storage and retrieve.

### Set custom id

You can save yours objects with custom key with the method `setKeyName`.
Do not edit this field after and be shure the values inside are unique.
The field `id` are the same as you custom field.

Or you can override the field `id`, but you loose the meaning.

```js
class User extends MonoDB {
    constructor(pseudo) {
        super(pseudo);
        this.pseudo = pseudo

        this.setKeyName("pseudo");
        // Now this.id === this.pseudo
        // The both field exist
    }
}

let user = new User("Hagatopaxi");

// To retrieve you can do
User.get("Hagatopaxi").then(handle).catch(errHandle);

// Or within async/await function
try {
    await User.get("Hagatopaxi");
} catch(err) {
    console.error(err);
}
```

### Make index

The index feature is very minimal.
Having one or more indexes slows down save and delete feature. Getting object by `id` or by index are the same cost as without index.

```js
class Student extends MonoDB {
    constructor(classroom, level, school) {
        super();
        this.classroom = classroom;
        this.level = level;
        this.school = school;

        this.setIndex(["classroom", "school"]);
    }
}

// Getting is almost same
Student.getByIndex("classroom", "value").then(handle).catch(errHandle);

// Or within async/await function
try {
    await Student.getByIndex("classroom", "value");
} catch(err) {
    console.error(err);
}
```

Here we store the index relation with symbolic links. So we have this structur (`@` represente symbolic links):

```
+-- dbname
    +-- class1
        +-- indexName1
            +-- value1
                +-- @object1_id.json
            +-- value2
                +-- @object2_id.json
        +-- object1_id.json
        +-- object2_id.json
```

Objects with the same value for the same index are store inside same directory (different value different directory). Behavior when updating fields which are indexes is not define.

Save and delete object which have index is same.

### Meta data

To debug, you can have a reading access of meta values. Change value of meta data does not have any effect.

```js
let student = await Student.get("key");
console.log(student.__meta);

// {
//     colDir: "/path/to/collection",
//     filePath: "/path/to/file/object.json",
//     name: "NameOfCollection",
//     keyName: "nameOfKeyMember",
//     index: ["index", "list"],
//     mutex: mutexObjectOfThisObject,
//     dbPath: "/path/to/db"
// }
```

### Transaction

Each MonoDB's object has his own lock. You can access to it with `object.__meta.mutex`.
You can use it for your own transactions.

```js
let mutex = student.__meta.mutex;

mutex.lock((unlock) => {
    // Your transaction's instructions
    unlock(); // Or mutex.unlock()
    // Do NOT forgot to call unlock.
});
```

For now, there is no async/await support of `mutex.lock` and `mutex.unlock` methods. But you can promisify it like that

```js
function transaction() {
    return new Promise((resolve, reject) => {
    let mutex = student.__meta.mutex;
        mutex.lock((unlock) => {
            // Unlock ALWAYS BEFORE resolve or reject
            unlock();
            resolve(); // Or reject()
        });
    });
}

async function main() {
    await transaction(); // Or transaction().then(handle).catch(errHandle)
}
```

### Inheritance

You simulate polymorphism behavior with the `setParent` method in constructor.

If you have `Student` and `Profesor` extends `Person`, itself extends `MonoDB`, you can search object with `Person.get`.

```js
class Person extends MonoDB {
    /* ... */
}

class Student extends Person {
    constructor() {
        super();

        this.setParent(Person);
    }
}

class Profesor extends Person {
    constructor() {
        super();

        this.setParent(Person);
    }
}

// Then you can retrieve object with Person class with no difference between Student and Profesor
// All fields are accessable
Person.get("student's or profesor's id").then((res) => {
    console.log(res instanceof Person); // true
});
```

It mandatory to call `this.setParent` inside all of your class you want activate polymophism search


## Not supported

* You can not update the key value or the the index value of an object, that can be provoque overloading memory
* **Node version < v12**
* TypeScript
* Complex transactions with rollback, checkpoint, etc...

## TODO

- [X] Index system.
- [X] Retrieve object from different keys.
- [X] Full inheritance system.
- [X] Isotalte the get, delete and the save methods
- [ ] Update index when values changed
- [ ] TypeScript support

## How to contribute

You can post a pull request or issue to help me. Else, you can send me an email with your suggestion.

### Run test

Mocha is require to launch tests

`npm run test`
