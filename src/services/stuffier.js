import axios from 'axios';
import routes from './routes';
import config from './config';
import crypto from '../config/crypto';

export const getStuffier = email => (
  axios.get(routes.user.detail(email), { headers: config.headers })
);

export const getStuffiers = ids => {
  if (ids.length > 0) {
    return axios.get(routes.user.listDetail(ids), { headers: config.headers })
  }

  return Promise.resolve({});
}

export const getFriends = email => (
  axios.get(routes.user.friends(email), { headers: config.headers })
);

export const loginStuffier = (email, password) => (
  axios.get(routes.user.loginUser(email, crypto.encrypt(password)), { headers: config.headers })
);

export const getLastStuffierId = () => (
  axios.get(routes.user.lastId(), { headers: config.headers })
);

export const registerStuffier = (user) => {
  const password = crypto.encrypt(user.password);
  return getLastStuffierId().then(res => {
    const id = Object.values(res.data)[0] + 1;
    return axios.post(routes.user.registerUser(), { ...user, password, id, request: true }, { headers: config.headers });
  });
};

export const getFriendsRequests = (email) => (
  axios.get(routes.user.friendsRequest(email), { headers: config.headers })
);

export const requestToBeFriend = (email_friend, id_user) => (
  axios.post(routes.user.requestToBeFriend(), { email_stuffier: email_friend, id_friend: id_user }, { headers: config.headers })
);

export const deleteRequest = (email_stuffier, id_friend) => {
  return axios.get(routes.user.friendRequestDetail(email_stuffier, id_friend), { headers: config.headers })
    .then(res => axios.delete(routes.user.deleteFriendRequest(res.data[0]._id), { headers: config.headers }));
}

export const addFriend = (email_stuffier, id_friend) => (
  axios.post(routes.user.friend(), { email_stuffier, id_friend }, { headers: config.headers })
);

export const getUserRequests = () => (
  axios.get(routes.user.userRequests(), { headers: config.headers })
);

export const deleteUserRequest = user => (
  axios.put(routes.user.deleteUserRequest(user._id), { ...user, request: false }, { headers: config.headers })
);