import { map } from 'lodash';

export function mapFriends(friends: any) {
  return map(friends, friend => {
    return { id: friend.id_friend };
  });
}
