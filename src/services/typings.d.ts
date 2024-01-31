export interface User {
  uuid: string;
  username: string;
  encryptType: string;
  encryptKey: string;
  meta: {
    nickname: string;
    avatar: string; // uri
  };
}
