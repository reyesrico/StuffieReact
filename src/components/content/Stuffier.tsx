import React from 'react';
import { TextField } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import State from '../../redux/State';
import { useNavigate } from 'react-router-dom';

const Stuffier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useSelector((state: State) => state.user);
  const [firstName, setFirstName] = React.useState(user.first_name);
  const [lastName, setLastName] = React.useState(user.last_name);
  const [picture, setPicture] = React.useState(user.picture);
  const [password, setPassword] = React.useState();
  const [password2, setPassword2] = React.useState();
  const [error, setError] = React.useState<string>("");

  const onSubmit = (e: any) => {
    if (password !== password2) {
      setError("Passwords Do Not Match");
    } else {
      navigate('/');
    }
  }

  return (
    <div>
      <div>
        {picture && (<img src={user.picture} alt="User Pic"></img>)}
        <h2>{firstName} {lastName}</h2>
      </div>
      <form onSubmit={onSubmit}>
        <div className="add-category__row">
          <label>{t("FirstName")}</label>
          <TextField name="firstName" type="text" onChange={(e: any) => setFirstName(e.target.value)} />
        </div>
        <div className="add-category__row">
          <label>{t("LastName")}</label>
          <TextField name="lastName" type="text" onChange={(e: any) => setLastName(e.target.value)} />
        </div>
        <div className="add-category__row">
          <label>{t("Change Password")}</label>
          <TextField name="password" type="password" onChange={(e: any) => setPassword(e.target.value)} />
        </div>
        {password && <div className="add-category__row">
            <label>{t("Confirm Password")}</label>
            <TextField name="password" type="password" onChange={(e: any) => setPassword2(e.target.value)} />
          </div>
        }
        {error && <div>{error}</div>}
        <button type="submit">{t('Submit')}</button>
      </form>
    </div>
  );
}

export default Stuffier;
