import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <hr />
        Stuffie&trade; is a platform coded and registered by &nbsp;
      <Link to={"/author"} target="_blank">Carlos Reyes-Rico</Link>.
  </div>

    );
  }
};

export default Footer;
