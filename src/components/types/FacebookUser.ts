export interface FacebookPicture {
  data: {
    height: number,
    is_silhouette: boolean,
    url: string,
    width: number
  }
}

export default interface FacebookUser {
  name: string,
  email: string,
  picture: FacebookPicture,
  id: string
  accessToken: string,
  userID: string,
  expiresIn: number,
  signedRequest: string,
  graphDomain: string
  data_access_expiration_time: number
}
