import React from "react";

import Language from "./Language";
import Theme from "./Theme";

import "./Settings.scss";

const Settings = () => {
  return (
    <div className="settings">
      <div className="settings__title">Settings</div>
      <div className="settings__item">
        <Language />
      </div>
      <div className="settings__item">
        <Theme />
      </div>
    </div>
  );
};

export default Settings;
