class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}

class Blogger extends Person {
    constructor(name, age, category) {
        super(name, age);
        this.category = category;
    }
}

class Stringer extends String {
    constructor(value) {
        super(value);
        this.value = value;
    }

    toString() {
        return this.value;
    }

    capitalize() {
        return this.value.slice(0, 1).toUpperCase() + this.value.slice(1).toLowerCase();
    }
}

if (!String.prototype.capi) {
    String.prototype.capi = function() {
        return this.slice(0, 1).toUpperCase() + this.slice(1).toLowerCase();
    }
}

console.log("jonas".capi());

name = new Stringer('guts').capitalize();
console.log(name)

person = new Person('Abhishek', 20);
console.log(Object.entries(person));

blogger = new Blogger('Dylan', 18, 'Fashion');
console.log(blogger);