import React, { Component } from 'react';

class Test extends Component {


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

  reverseStuff(name) {
    return name.split('').reverse().join('');
  }

  render() {
    const x = this.getStuff();
    const a = this.reverseStuff('unodostres');
    return (
      <div>
        <span>This is my test = {a}</span>
        <span>This is my other test = {x}</span>
      </div>
    );
  }
}

export default Test;
