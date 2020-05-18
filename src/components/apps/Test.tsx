import React, { Component } from 'react';
import crypto from '../../config/crypto';

class Test extends Component<any, any> {

  componentDidMount() {
    document.getElementById("myButton")?.addEventListener('click', this.debounce(() => console.log('click'), 4000));
  }

  authenticate = () => {
    // TEST - ENCRYPT
    console.log(`secreto: ${crypto.encrypt("secreto")}`);
    console.log(`mario: ${crypto.encrypt("mario")}`);
    console.log(`doc: ${crypto.encrypt("secrdoceto")}`);
    console.log(`merol: ${crypto.encrypt("merol")}`);
  }

  getStuff = () => {
    let stuff = [
      { id: 1, name: 'Carlos Reyes 1' },
      { id: 2, name: 'Carlos Reyes 2' },
      { id: 1, name: 'Carlos Reyes 1' },
      { id: 3, name: 'Carlos Reyes 3' },
    ];

    console.log(stuff);

    let r = [1, 1, 2, 3, 4, 5];

    return r.filter((item, index) => {
      return r.indexOf(item) === index;
    });
  }

  reverseStuff(name: string) {
    return name.split('').reverse().join('');
  }

  flat(array: any[]) {
    return array.reduce((acc, value) => [...acc, ...value], []);
  }

  loop(value: number, test: Function, update: Function, body: Function) {
    for (let i = value; test(i); i = update(i)) {
      body(i);
    }
  }

  every(array: any[], test: Function) {
    let res = true;
    array.forEach(v => {
      if (!test(v)) {
        res = false;
        return;
      }
    });

    return res;
  }

  everySome(array: any[], test: Function) {
    return !array.some((v: any) => !test(v));
  }

  waysToDecode(message = '4123') {
    let counter = 0;
    let chars = message.split('');
    
    for(let i = 0; i < chars.length; i++) {
      if ((chars[i] === '1' || chars[i] === '2') && i+1 < chars.length) {
        counter++;
      }
    }

    return counter + 1;
  }

  getAnagrams(array = ["star", "rats", "car", "arc", "arts", "star", "stars"]) {
    let myMap:  { [key:string]: string[] } = { };

    array.forEach(word => {                                     // N
      let sortedWord = word.split('').sort().join('');          // K log K

      if (Object.keys(myMap).includes(sortedWord)) {
        if (!myMap[sortedWord].includes(word)) {
          myMap[sortedWord].push(word);
        }
      } else {
        myMap = { ...myMap, [sortedWord]: [word] };
      }
    });


    return Object.keys(myMap).map((key: string) => myMap[key]); // N
  }                                                             // N * K log K + N = O(N * K log K)

  // [1, 2, 3, 4].reduce((acc, value) => acc + value, 0)
  reduce(array: number[], callback: Function, initValue: number) {
    let acc = initValue;
    array.forEach(value => {
      acc = callback(acc, value);
    });

    return acc;
  }

  getRoman(decimal: number) {
    let roman = '';
    let currentVal = decimal;

    let thousands = Math.floor(currentVal / 1000);
    if (thousands) {
      roman += 'M'.repeat(thousands);
      currentVal -= thousands*1000;
    }

    let hundreds = Math.floor(currentVal / 100);
    if (hundreds) {
      roman += hundreds > 5 ? `D${'C'.repeat(hundreds-5)}` : hundreds === 5 ? 'D' : hundreds === 4 ? 'CD' : 'C'.repeat(hundreds);
      currentVal -= hundreds*100;
    }

    let decimals = Math.floor(currentVal / 10);
    if (decimals) {
      roman += decimals > 5 ? `L${'X'.repeat(decimals-5)}` : decimals === 5 ? 'L' : decimals === 4 ? 'XL' : 'X'.repeat(decimals);
      currentVal -= decimals*10;
    }

    roman += currentVal > 5 ? `V${'I'.repeat(currentVal-5)}` : currentVal === 5 ? 'V' : currentVal === 4 ? 'IV' : 'I'.repeat(currentVal);

    return roman;
  }

  proto = () => {
    let animal = {
      eats: true
    };
    
    let rabbit: any = {
      jumps: true,
      __proto__: animal
    };
    
    // Object.keys only returns own keys
    // alert(Object.keys(rabbit)); // jumps
    
    // for..in loops over both own and inherited keys
    // for(let prop in rabbit) alert(prop); // jumps, then eats
    
    const pa = rabbit.propertyIsEnumerable(rabbit?.__proto__?.hasOwnProperty);
    
    console.log(pa);    
  }

  myFlat = (array: Array<any>) => {
    let res: any = [];
    this.myFlatTemp(array, res);
    return res;
  }
                  
  myFlatTemp = (array: Array<any>, res: any) => {
    array.forEach(value => {
      if (!Array.isArray(value)) {
          res.push(value);
      }
      else {
        return this.myFlatTemp(value, res);
      }
    });
  }

  dom = () => {
    const spans = document.getElementsByTagName('span');
    if (spans && spans !== undefined) {
      console.log(spans);
      console.log(spans[0]);

      // console.log(spans.parentNode);
      // console.log(spans.parentElement);
    }
  }
 
  excludeItems() {
    // could be potentially more than 3 keys in the object above
    let items = [{color: 'red', type: 'tv', age: 18}, {color: 'silver', type: 'phone', age: 20}];
    let excludes = [{k: 'color', v: 'silver'}, {k: 'type', v: 'tv'}];

    excludes.forEach(pair => {
      items = items.filter(item => (item as any)[pair.k] === pair.v);
    });

    return items;
  }

  orderArray(){
    let array = ['a', 'b', 'c', 'd', 'e'];
    let indexes = [1, 3, 2, 4, 0];

    indexes.forEach((index: number, i: number) => {
      let value = array[i];
      array[i] = array[index];
      array[index] = value;
    });

    return array;
  }

  debounce = (callback: Function, time: number) => {
    let timeout: any = null;

    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          callback();
        }, time);
    }
  }
  
  render() {
    // console.log(this.myFlat([1, [2, [4, 5]], 3]));
    // console.log(this.flat([[1, 2, 3], [4, 5], [6]]));
    // this.loop(3, (n: any)=> n>0, (n: any)=> n-1, console.log);
    // console.log(this.every([1, 3, 5], (n: any) => n < 10));
    // console.log(this.everySome([1, 3, 5], (n: any) => n < 10));
    // console.log(this.waysToDecode());
    // console.log(this.getAnagrams());
    // console.log(this.reduce([1, 2, 3, 4, 5], (acc: number, value: number) => value, 0));
    // console.log([1, 2, 3, 4, 5].reduce((acc, val) => acc + val));

    // console.log(this.getRoman(3748));

    // this.authenticate();
    const x = this.getStuff();
    const a = this.reverseStuff('unodostres');
    this.dom();
    console.log(this.orderArray());

    return (
      <div>
        <span>This is my test = {a}</span>
        <span>This is my other test = {x}</span>
        <button id="myButton">Click</button>
      </div>
    );
  }
}

export default Test;
