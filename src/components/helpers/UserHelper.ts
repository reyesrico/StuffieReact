import { map } from 'lodash';

export function mapFriends(friends: any) {
  return map(friends, friend => {
    return { id: friend.id_friend };
  });
}

export function mapIds(collection: any) {
  return map(collection, collection => {
    return { id: collection.id_friend };
  });
}
