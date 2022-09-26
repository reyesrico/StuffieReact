import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  apiKey,
  defaultImageUrl,
  existImage,
  signature,
  userImageUrl
} from '../../services/cloudinary-helper';
import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';

// import { updateUser, userUpdated } from '../../redux/user/actions';
// import { updateStuffier } from '../../services/stuffier';

import './Stuffier.scss';

const Stuffier = () => {
  const { t } = useTranslation();

  const user = useSelector((state: State) => state.user);
  const [firstName, setFirstName] = React.useState(user.first_name);
  const [lastName, setLastName] = React.useState(user.last_name);
  const [file, setFile] = React.useState<any>();
  const [picture, setPicture] = React.useState<string>();
  const [password, setPassword] = React.useState();
  const [password2, setPassword2] = React.useState();
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    existImage(user.id, "stuffiers/")
      .then(() => setPicture(userImageUrl(user.id)));
  }, []);


  // CAN'T UPDATE / REMOVE IMAGE FROM CLOUDINARY
  // NEED TO USE THEIR LIBARY BUT NOT WORKING WITH REACT  
  // OPTIONS TRIED: UNSIGNED AND SIGNED
  // NOW WE ARE USING UNSIGNED TO UPLOAD FIRST TIME.

  // THIS FUNCTION ONLY WORKS WHEN THE USER DOES NOT PICTURE
  // IN CLOUDINARY AND CAN UPLOAD FOR THE FIRST AND UNIQUE TIME
  const uploadImage = async () => {
    const formData = new FormData();
    const timestamp = new Date().toDateString().toLowerCase();
    formData.append("file", file);
    formData.append("folder", "stuffiers");
    formData.append("public_id", user.id?.toString() || "");
    formData.append("timestamp", timestamp);
    formData.append("upload_preset", "itzef221");
    formData.append("api_key", apiKey);

    existImage(user.id, "stuffiers/")
      .then(async (res) => {
        // Exist Image
        // THIS DOES NOT WORK
        console.log({ res });
        const sign = await signature("stuffiers", user.id, timestamp);
        console.log({ sign });
        const finalSign = sessionStorage.getItem("signature") || sign;

        formData.append("invalidate", "true");
        formData.append("signature", finalSign);
        formData.append("api_key", apiKey);
        axios.post("https://api.cloudinary.com/v1_1/reyesrico/image/destroy", formData)
          .catch(err => setError(err));
      })
      .catch(err => setError(error))
      .finally(() => {
        axios.post(
          `https://api.cloudinary.com/v1_1/reyesrico/image/upload`,
          formData,
          { headers: { "X-Requested-With": "XMLHttpRequest" } }
        )
          .then((res: any) => {
            const data = res.data;
            sessionStorage.setItem("signature", data.signature);
            setPicture(res.url);
          })
          .catch((err) => setError(err));
      });
  }

  const onClick = (e: any) => {
    if (file) {
      console.log({ firstName, lastName, password2 });
      uploadImage();
    }
  }

  return (
    <div className='stuffier'>
      <div className="stuffier__header">
        {picture && (
          <img src={picture} className="stuffier__photo" alt="User Pic" />)}
        <h2>{user.first_name} {user.last_name}</h2>
      </div>
      <form className="stuffier__form">
        <div>
          {!picture && <input type="file" onChange={(e: any) => setFile(e.target.files[0])} />}
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t("FirstName")}</label>
          <TextField containerStyle={styles.tfield} name="firstName" type="text" onChange={(e: any) => setFirstName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t("LastName")}</label>
          <TextField containerStyle={styles.tfield} name="lastName" type="text" onChange={(e: any) => setLastName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t("Change Password")}</label>
          <TextField containerStyle={styles.tfield} name="password" type="password" onChange={(e: any) => setPassword(e.target.value)} />
        </div>
        {password && <div className="stuffier__row">
          <label className="stuffier__label">{t("Confirm Password")}</label>
          <TextField containerStyle={styles.tfield} name="password" type="password" onChange={(e: any) => setPassword2(e.target.value)} />
        </div>
        }
        {error && <div style={{ color: "red" }}>{error}</div>}
        <Button text={t('Submit')} onClick={onClick} />
      </form>
    </div>
  );
}

const styles = {
  tfield: {
    maxWidth: 300
  }
}

export default Stuffier;
