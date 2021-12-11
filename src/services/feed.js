import { getListStuff, getStuffiersList } from '../services/stuff';
import { getFriendProducts, mapStuff } from '../components/helpers/StuffHelper';

export const setFriendsProducts = (friends) => {
  let stuffiers_stuff = null;
  if (friends && friends.length()) {
    return getStuffiersList(friends)
    .then(res => {
      stuffiers_stuff = res.data;
      return getListStuff(mapStuff(res.data));
    })
    .then(res => {
      const products = res.data;
      const friendsFilled = getFriendProducts(friends, products, stuffiers_stuff);
      return Promise.resolve(friendsFilled);
    });
  } else {
    return Promise.resolve([]);
  }
}