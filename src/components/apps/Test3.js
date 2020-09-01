/*
{
  "name": "root",
  "nodes": [{
    "name": "a",
    "nodes": [{
      "name": "b",
      "nodes": [{
        "name": "c", "nodes": []
      }]
    }]
  },{
    "name": "a", "nodes": []
  },{
    "name": "a", "nodes": []
  },{
    "name": "a",
    "nodes": [{
      "name": "b",
      "nodes": [{
        "name": "c",
        "nodes": [{
          "name": "d",
          "nodes": [{
            "name": "e", "nodes": []
          },{
            "name": "f", "nodes": []
          },{
            "name": "a", "nodes": []
          }]
        }]
      }, {
        "name": "c",
        "nodes": [{
          "name": "d", "nodes": []
        }]
      }]
    }]
  }]
}
*/

class Node {
  static from(...names) {
      return [...names].map(name => ({ name }))
  }

  constructor({ name, nodes, parent }) {
      this._name = name
      this._nodes = this.nodes(nodes)
      this._parent = parent
  }

  nodes(nodes) {
      if (nodes != null) {
          this._nodes = nodes.map(
              ({ name, nodes }) => new Node({ name, nodes, parent: this }),
          )
      }
      return this._nodes || []
  }

  parent() {
      return this._parent
  }

  find(query) {

    let nodesFound = [];
    //let nodesFound2 = [];

    // Handle the query
    let queryNodes = query.split('>').map(s => s.trim()).reverse();
    
    // Here we know that node pos[0] should be the parent of node pos[1] ...
    // b > c > d
    let nameToBeFound = queryNodes.shift();
        
    this.findTemp(nameToBeFound, nodesFound) //gives us all the ndoes with name LastNode
    
    
    let nodesFound2 = nodesFound.filter(found => {
      let node = found;
      return queryNodes.reverse().every(name => {
        const tmp = node;
        node = node.parent();
        return tmp.name() === name;
        
      })
    })
    
    //https://studio.patreon.com/
    
    /*
    queryNodes.forEach(nameParent => {
      let found = nodesFound.filter(node => node.parent() === nameParent);
      nodesFound2 = [...nodesFound2, ...found];
    });
    */
          
    // this.findTemp(nameToBeFound, nodesFound);
      
    return nodesFound2;
  }

  findTemp(nameToBeFound, nodesFound) {
    this.nodes().forEach(node => {
      if (node.name() === nameToBeFound) {
        nodesFound.push(node);
      }
      
      if (node.nodes().length > 0) {
        node.findTemp(nameToBeFound, nodesFound);
      }
    });
  }

  name() {
      return this._name
  }
}

// Tree definition
const root = new Node(Node.from('root'))
const [a1, a2, a3, a4] = root.nodes(Node.from('a', 'a', 'a', 'a'))
const [b1] = a1.nodes(Node.from('b'))
const [c1] = b1.nodes(Node.from('c'))
const [b2] = a4.nodes(Node.from('b'))
const [c2, c3] = b2.nodes(Node.from('c', 'c'))
const [d1] = c2.nodes(Node.from('d'))
const [e1, f1, a5] = d1.nodes(Node.from('e', 'f', 'a'))
const [d2] = c3.nodes(Node.from('d'))

const failed = []
const passed = []

const test = (node, selector, length, description) => {
  const found = node.find(selector)

  found.length === length
      ? passed.push(description)
      : failed.push(description)
}

// Part 1 - Test cases
/*
test(root, 'a', 5, 'root find a') //assert(root.find('a').length, 5)
test(root, 'b', 2, 'root find b')
test(root, 'c', 3, 'root find c')
test(root, 'd', 2, 'root find d')
test(root, 'e', 1, 'root find e')
test(root, 'f', 1, 'root find f')

test(a1, 'a', 0, 'a1 find a')
test(a2, 'a', 0, 'a2 find a')
test(a3, 'a', 0, 'a3 find a')
test(a4, 'a', 1, 'a4 find a')

test(a1, 'c', 1, 'a1 find c')
test(a2, 'c', 0, 'a2 find c')
test(a3, 'c', 0, 'a3 find c')
test(a4, 'c', 2, 'a4 find c')

test(b1, 'c', 1, 'b1 find c')
test(b1, 'd', 0, 'b1 find d')
*/

// Part 2 - Test cases
test(root, 'c > d', 2, 'root find c > d');   // How many d's have the parent c
test(root, 'a > b > c > d > e', 1, 'root find a > b > c > d > e');
test(root, 'b > c > d > e', 1, 'root find b > c > d > e');
test(root, 'b > c', 3, 'root find b > c');
test(root, 'a > c > d', 0, 'root find a > c > d');
test(root, '  b  >  c  ', 3, 'root find   b  >  c  ');


/*
// Part 3 - Test cases
test(root, 'a c', 3, 'root find a c');
test(root, 'a     c', 3, 'root find a c');
test(root, 'a d', 2, 'root find a d');
test(root, 'b a', 1, 'root find b a');
test(root, 'e a', 0, 'root find e a');
*/

/*
// Part 3a - Test cases
test(root, 'a c > d', 2, 'root find a c > d')
*/

console.log(`Failed ${failed.length} Tests`)
console.log(`Passed ${passed.length} Tests`)

failed.forEach(f => console.log(`Failed "${f}"`))