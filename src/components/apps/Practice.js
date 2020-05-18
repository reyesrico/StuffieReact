/**
 * Practice JS
 * http://hangar.runway7.net/javascript/difference-call-apply
 */

var person1 = {name: 'Marvin', age: 42, size: '2xM'};
var person2 = {name: 'Zaphod', age: 42000000000, size: '1xS'};

var update = function(name, age, size) {
  this.name = name;
  this.age = age;
  this.size = size;
};

update.call(person1, 'Merol', 3, 15);
console.log(person1);

var say = function(greeting){
  console.log(greeting + ', ' + this.name);
};


var dispatch = function(person, method, args){
  method.apply(person, args);
};

// Apply is for unknown args and receives array of args.
dispatch(person1, say, ['Hello']);
dispatch(person2, update, ['Slarty', 200, '1xM']);
console.log(person2);

// OOOOTHER
const animal = {
  name: 'animal',
  execute: function () {console.log('eats')}
};

let dog = {
  __proto__: animal,
  name: 'dog'
}

let cat = {
  __proto__: animal,
  execute: function () {console.log('nothing')}
};

let mimoso = {
  __proto__: cat,
  // name: 'Mimoso Cat',
  sleeps: function () { console.log('sleeping') }
};

// console.log(dog.name);
// console.log(cat.name);

//dog.execute();
//cat.execute();

//console.log(mimoso.name);
//mimoso.execute();
//mimoso.sleeps();


function setter(name, age) {
  this.name = name;
  this.age = age;
}

const p = new setter('Reyes', 35);
// console.log(p);

const hero = {
  heroName: "Batman",
  dialogue() {
    console.log(`I am ${this.heroName}!`);
  }
};

//hero.dialogue();

const saying = hero.dialogue;
const a = saying.bind(hero);
// a();
// merol

class Hero {
  constructor(heroName) {
    this.heroName = heroName;
  }
  dialogue() {
    console.log(`I am ${this.heroName}`)
  }
}
const batman = new Hero("Batman");
const robin = batman.dialogue.bind(batman);
robin();
