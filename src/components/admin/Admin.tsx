import React, { Component } from 'react';
import { connect } from 'react-redux';

import Button from '../shared/Button';
import User from '../types/User';
import { Link } from 'react-router-dom';
import { fetchUserRequests, deleteRequest } from '../../redux/user-requests/actions';
import './Admin.scss';

class Admin extends Component<any, any> {
  state = {
    userRequests: []
  };

  componentDidMount() {
    const { fetchUserRequests } = this.props;
    fetchUserRequests().then((res: any) => this.setState({ userRequests: res }));
  }

  executeRequest = (user: User, isAccepted = false) => {
    const { deleteRequest } = this.props;
  
    if (isAccepted) {
      deleteRequest(user).then((res: User) => {
        alert('Request Accepted and Deleted');
        const userRequests = this.state.userRequests.filter((request: User) => {
          return request._id !== res._id;
        });

        this.setState({ userRequests });
      });
    }
  }

  renderRequests = () => {
    const { userRequests } = this.state;

    return (
      <div className="admin__requests">
        <hr />
        <h3 className="admin__title">
          <div>Requests</div>
          <div className="admin__warning">{userRequests.length}</div>
        </h3>
        <ul>
          {userRequests.map((user: User, index: number) => {
            return (
              <li className="admin__request" key={index}>
                <div className="admin__request-text">
                  {user.first_name} {user.last_name} ({user.email})
                </div>
                <div className="admin__request-button">
                  <Button onClick={() => this.executeRequest(user, true)} text="Accept"></Button>
                </div>
              </li>
            )}
          )}
        </ul>
      </div>
    )
  }

  render() {
    const { userRequests } = this.state;

    return (
      <div className="admin">
        {userRequests.length > 0 && this.renderRequests()}
        <div className="admin__link"><Link to={`/category/add`}>Add Category</Link></div>
        <hr />
        <div className="admin__link"><Link to={`/subcategory/add`}>Add SubCategory</Link></div>
        <hr />
      </div>
    );
  }
}

const mapDispatchProps = {
  fetchUserRequests,
  deleteRequest
};

export default connect(null, mapDispatchProps)(Admin);
