import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { existImage, userImageUrl } from '../../lib/cloudinary';
import crypto from '../../lib/crypto';
import { updateUser } from '../../api/users.api';
import Button from '../shared/Button';
import TextField from '../shared/TextField';
import Loading from '../shared/Loading';
import UserContext from '../../context/UserContext';
import config from '../../config/api';

import './Stuffier.scss';

const Stuffier = () => {
  const { t } = useTranslation();
  const { user, setUser, loginUser: loginCtx } = useContext(UserContext);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [picture, setPicture] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      existImage(user.id, 'stuffiers/')
        .then(() => setPicture(userImageUrl(user.id)));
    }
  }, [user?.id]);

  const uploadPhoto = async (): Promise<string | undefined> => {
    if (!file) return undefined;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'stuffiers');
    formData.append('public_id', String(user.id));
    formData.append('upload_preset', config.cloudinary.uploadPreset);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
      formData,
      { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
    );
    return res.data?.secure_url;
  };

  const onSubmit = async () => {
    if (password && password !== password2) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (password && password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const updates: Record<string, any> = {
        ...user,
        first_name: firstName || user?.first_name,
        last_name: lastName || user?.last_name,
      };

      if (password) {
        updates.password = await crypto.pbkdf2(password, user.email);
      }

      const photoUrl = await uploadPhoto();
      if (photoUrl) {
        updates.picture = photoUrl;
        setPicture(photoUrl);
      }

      const updated = await updateUser(String(user._id), updates);

      // Sync UserContext + localStorage
      const merged = { ...user, ...updated };
      setUser(merged);
      loginCtx(merged);

      setMessage(t('stuffier.saveSuccess'));
      setPassword('');
      setPassword2('');
      setFile(null);
    } catch (err: any) {
      setError(t('stuffier.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading size="xl" message={t('common.loading')} />;

  return (
    <div className='stuffier'>
      <div className="stuffier__header">
        {picture && <img src={picture} className="stuffier__photo" alt="User Pic" />}
        <h2>{user.first_name} {user.last_name}</h2>
      </div>
      <form className="stuffier__form" onSubmit={(e) => e.preventDefault()}>
        <div>
          <input type="file" accept="image/*" onChange={(e: any) => setFile(e.target.files[0])} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('FirstName')}</label>
          <TextField containerStyle={styles.tfield} name="firstName" type="text"
            value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('LastName')}</label>
          <TextField containerStyle={styles.tfield} name="lastName" type="text"
            value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('Change Password')}</label>
          <TextField containerStyle={styles.tfield} name="password" type="password"
            value={password} onChange={(e: any) => setPassword(e.target.value)} />
        </div>
        {password && (
          <div className="stuffier__row">
            <label className="stuffier__label">{t('Confirm Password')}</label>
            <TextField containerStyle={styles.tfield} name="password2" type="password"
              value={password2} onChange={(e: any) => setPassword2(e.target.value)} />
          </div>
        )}
        {error && <div style={{ color: 'var(--color-error, red)' }}>{error}</div>}
        {message && <div style={{ color: 'var(--color-success, green)' }}>{message}</div>}
        <Button text={t('Submit')} onClick={onSubmit} />
      </form>
    </div>
  );
};

const styles = {
  tfield: { maxWidth: 300 },
};

export default Stuffier;
