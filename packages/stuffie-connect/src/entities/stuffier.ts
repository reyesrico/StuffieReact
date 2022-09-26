import axios from 'axios';
import routes from '../config/routes';
import config from '../config/config';
import { User } from '../types';
import crypto from "../config/crypto";

const Stuffier = () => {
  const getStuffier = (email: string) => (
    axios.get(routes.user.detail(email), { headers: config.headers })
  );

  const updateStuffier = (user: User) => (
    axios.put(
      routes.user.update(user.id),
      { ...user, request: false },
      { headers: config.headers }
    )
  );
  
  const getStuffiers = (ids: number[]) => {
    if (ids.length > 0) {
      return axios.get(routes.user.listDetail(ids), { headers: config.headers })
    }
  
    return Promise.resolve({});
  }
  
  const getFriends = (email: string) => (
    axios.get(routes.user.friends(email), { headers: config.headers })
  );
  
  const loginStuffier = (email: string, password: string) => (
    axios.get(routes.user.loginUser(email, crypto.encrypt(password)), { headers: config.headers })
  );
  
  const getLastStuffierId = () => (
    axios.get(routes.user.lastId(), { headers: config.headers })
  );
  
  const registerStuffier = (user: User) => (
    Promise.all([getLastStuffierId(), crypto.pbkdf2(user.password, user.email)])
      .then(values => {
        // @ts-ignore
        const id = Object.values(values[0].data)[0] + 1;
        const password = values[1];
        return axios.post(routes.user.registerUser(), { ...user, password, id, request: true }, { headers: config.headers });
      })
      .catch(err => Promise.reject(err))
  );
  
  const getFriendsRequests = (email: string) => (
    axios.get(routes.user.friendsRequest(email), { headers: config.headers })
  );
  
  const requestToBeFriend = (email_friend: string, id_user: number) => (
    axios.post(routes.user.requestToBeFriend(), { email_stuffier: email_friend, id_friend: id_user }, { headers: config.headers })
  );
  
  const deleteRequest = (email_stuffier: string, id_friend: number) => {
    return axios.get(routes.user.friendRequestDetail(email_stuffier, id_friend), { headers: config.headers })
      .then(res => axios.delete(routes.user.deleteFriendRequest(res.data[0]._id), { headers: config.headers }));
  }
  
  const addFriend = (email_stuffier: string, id_friend: number) => (
    axios.post(routes.user.friend(), { email_stuffier, id_friend }, { headers: config.headers })
  );
  
  const getUserRequests = () => (
    axios.get(routes.user.userRequests(), { headers: config.headers })
  );
  
  const deleteUserRequest = (user: User) => (
    axios.put(routes.user.deleteUserRequest(user.id), { ...user, request: false }, { headers: config.headers })
  );
  
  return {
    getStuffier,
    getStuffiers,
    getFriends,
    getFriendsRequests,
    getLastStuffierId,
    getUserRequests,
    deleteUserRequest,
    addFriend,
    deleteRequest,
    requestToBeFriend,
    registerStuffier,
    loginStuffier,
    updateStuffier
  }
}

export default Stuffier;
