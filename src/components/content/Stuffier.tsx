import React, { useContext, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { existImage, userImageUrl } from '../../lib/cloudinary';
import crypto from '../../lib/crypto';
import { updateUser } from '../../api/users.api';
import Button from '../shared/Button';
import TextField from '../shared/TextField';
import Loading from '../shared/Loading';
import MapView from '../shared/MapView';
import UserContext from '../../context/UserContext';
import config from '../../config/api';

import './Stuffier.scss';

const geocodeZip = async (zip: string): Promise<{ lat: number; lng: number } | null> => {
  const key = import.meta.env.VITE_AZURE_MAPS_KEY;
  if (!key) return null;
  try {
    const url = `https://atlas.microsoft.com/search/address/json?api-version=1.0&query=${encodeURIComponent(zip)}&countrySet=US&subscription-key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    const first = data?.results?.[0];
    if (!first) return null;
    return { lat: first.position.lat, lng: first.position.lon };
  } catch {
    return null;
  }
};

const Stuffier = () => {
  const { t } = useTranslation();
  const { user, setUser, loginUser: loginCtx } = useContext(UserContext);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [zipCode, setZipCode] = useState(user?.zip_code || '');
  const [zipLoading, setZipLoading] = useState(false);
  const [mapLat, setMapLat] = useState<number | undefined>(user?.lat);
  const [mapLng, setMapLng] = useState<number | undefined>(user?.lng);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [picture, setPicture] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      existImage(user.id, 'stuffiers/')
        .then(() => setPicture(userImageUrl(user.id)))
        .catch(() => setPicture(undefined));
    }
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(undefined);
    }
  };

  const onRefreshZip = async () => {
    if (!zipCode.trim()) return;
    setZipLoading(true);
    try {
      const coords = await geocodeZip(zipCode.trim());
      if (coords) {
        setMapLat(coords.lat);
        setMapLng(coords.lng);
        // persist to DB immediately
        const updates = { ...user, zip_code: zipCode.trim(), lat: coords.lat, lng: coords.lng };
        const updated = await updateUser(String(user._id), updates);
        const merged = { ...user, ...updated };
        setUser(merged);
        loginCtx(merged);
      }
    } finally {
      setZipLoading(false);
    }
  };

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

      if (zipCode !== (user?.zip_code || '')) {
        if (zipCode.trim()) {
          const coords = await geocodeZip(zipCode.trim());
          if (coords) {
            updates.zip_code = zipCode.trim();
            updates.lat = coords.lat;
            updates.lng = coords.lng;
          } else {
            updates.zip_code = zipCode.trim();
            updates.lat = undefined;
            updates.lng = undefined;
          }
        } else {
          updates.zip_code = '';
          updates.lat = undefined;
          updates.lng = undefined;
        }
      }

      if (password) {
        updates.password_hash = await crypto.pbkdf2(password, user.email);
      }

      const photoUrl = await uploadPhoto();
      if (photoUrl) {
        updates.picture = photoUrl;
        setPicture(photoUrl);
        setPreview(undefined);
        setFile(null);
      }

      const updated = await updateUser(String(user._id), updates);
      const merged = { ...user, ...updated };
      setUser(merged);
      loginCtx(merged);

      setMessage(t('stuffier.saveSuccess'));
      setPassword('');
      setPassword2('');
    } catch {
      setError(t('stuffier.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  // The image to show in the avatar circle: new preview > saved cloudinary > initials placeholder
  const avatarSrc = preview || picture;

  if (isLoading) return <Loading size="xl" message={t('common.loading')} />;

  const hasLocation = typeof mapLat === 'number' && typeof mapLng === 'number';

  return (
    <div className="stuffier">
      {/* ── Avatar + name header ── */}
      <div className="stuffier__header">
        <div
          className="stuffier__avatar"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label={t('register.photoLabel')}
        >
          {avatarSrc
            ? <img src={avatarSrc} className="stuffier__avatar-img" alt="Profile" />
            : <span className="stuffier__avatar-initials">
                {(user?.first_name?.[0] || '').toUpperCase()}{(user?.last_name?.[0] || '').toUpperCase()}
              </span>
          }
          <div className="stuffier__avatar-overlay">&#9998;</div>
        </div>
        <div className="stuffier__header-info">
          <h2 className="stuffier__name">{user.first_name} {user.last_name}</h2>
          <p className="stuffier__email">{user.email}</p>
          <label className="stuffier__avatar-label" htmlFor="stuffier-photo">
            {preview ? t('register.changePhoto') : picture ? t('register.changePhoto') : t('register.addPhoto')}
          </label>
        </div>
        <input
          id="stuffier-photo"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="stuffier__file-input"
          onChange={handleFileChange}
        />
      </div>

      {/* ── Form ── */}
      <form className="stuffier__form" onSubmit={(e) => e.preventDefault()}>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('FirstName')}</label>
          <TextField name="firstName" type="text"
            value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('LastName')}</label>
          <TextField name="lastName" type="text"
            value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
        </div>
        <div className="stuffier__row">
          <label className="stuffier__label">{t('Change Password')}</label>
          <TextField name="password" type="password"
            value={password} onChange={(e: any) => setPassword(e.target.value)} />
        </div>
        {password && (
          <div className="stuffier__row">
            <label className="stuffier__label">{t('Confirm Password')}</label>
            <TextField name="password2" type="password"
              value={password2} onChange={(e: any) => setPassword2(e.target.value)} />
          </div>
        )}
        <div className="stuffier__row">
          <label className="stuffier__label">{t('stuffier.zipCode')}</label>
          <div className="stuffier__zip-row">
            <TextField name="zipCode" type="text"
              value={zipCode} onChange={(e: any) => setZipCode(e.target.value)} />
            <Button
              text={zipLoading ? '…' : '↻'}
              onClick={onRefreshZip}
              size="sm"
              disabled={zipLoading || !zipCode.trim()}
            />
          </div>
        </div>
        {error && <p className="stuffier__error">{error}</p>}
        {message && <p className="stuffier__success">{message}</p>}
        <Button text={t('Submit')} onClick={onSubmit} />
      </form>

      {hasLocation && (
        <MapView lat={mapLat!} lng={mapLng!} />
      )}
    </div>
  );
};

export default Stuffier;
