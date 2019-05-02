import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { forEach, map } from 'lodash';

import { getListStuff } from '../../services/stuff';
import './Products.css';

class Products extends Component {
  state = {
    objects: [],
    objectsMap: null,
  };

  componentDidMount() {
    this.loadStuffObjects();
  }

  componentDidUpdate() {
    const { categories } = this.props;
    const { objects } = this.state;

    if (this.state.objectsMap) return;
    if (!categories) return;
    if (objects.length === 0) return;

    // Setting objectsMap by category
    let objectsMap = {};
    categories.forEach(category => {
      objectsMap = {
        ...objectsMap,
        [category.id]: [],
      };
    });

    // Filling objectsMap per category
    forEach(objects, object => {
      objectsMap[object.category].push(object);
    });

    this.setState({ objectsMap });
  }

  loadStuffObjects = async () => {
    const { stuff } = this.props;

    if (!stuff) return;

    const ids = map(stuff, object => {
      return {
        id: object.id_stuff
      };
    });

    getListStuff(ids).then(res => {
      this.setState({ objects: res.data });
    });
  }

  generateReport = event => {
    event.preventDefault();
    alert("finished");
  }

  render() {
    const { categories, user } = this.props;
    const { objects, objectsMap } = this.state;

    if (!objects || !objectsMap) {
      return (
        <div>
          <ReactLoading type={"spinningBubbles"} color={"FF0000"} height={50} width={50} />
        </div>
      );
    }

    if (objects.length === 0) {
      return <div>No Stuff! Add Products!</div>
    }

    return (
      <div>
        <h3>{user.first_name} Stuff</h3>
        <div>
          <input type="submit" value="Generate Report" onClick={this.generateReport} />
        </div>
        {
          categories.map(category => {

            if (!objectsMap[category.id] || !objectsMap[category.id].length) return (<div key={category.id}></div>);

            return (
              <div key={category.id}>
                <h4>{category.name}</h4>
                <ul>
                  {objectsMap[category.id].map(object => {
                    return (
                      <li key={object.id}>{object.name}</li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        }
      </div>
    );
  }
};

export default Products;
