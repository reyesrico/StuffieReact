// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import { getStuff } from '../services/stuff';
import './Content.css';

class Content extends Component {
  state = {
    objects: null,
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
    if (!objects) return;

    // Setting objectsMap by category
    let objectsMap = {};
    categories.forEach(category => {
      objectsMap = {
        ...objectsMap,
        [category.id]: [],
      };
    });

    // Filling objectsMap per category
    objects.forEach(object => {
      objectsMap[object.category].push(object);
    });

    this.setState({ objectsMap });
  }

  loadStuffObjects = () => {
    const { stuff } = this.props;
    const { objects } = this.state;

    if (!stuff) return;

    if (!objects) {
      stuff.forEach(object => {
        getStuff(object.id).then(res => {
          this.setState({ objects: res.data });
        });
      });  
    }
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

    return (
      <div>
        <h3>{user.first_name} Stuff</h3>
        {
          categories.map(category => {
            
            if (!objectsMap[category.id]  || !objectsMap[category.id].length) return (<div key={category.id}></div>);

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

export default Content;
