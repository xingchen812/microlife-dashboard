export interface ImageType {
  type: 'uri' | 'png base64' | 'jpg base64' | 'jpeg base64' | 'none';
  data: string;
}

export interface User {
  uuid: string;
  host: string;
  username: string;
  encryptType: string;
  encryptKey: string;
  meta: {
    avatar: Image;
    nickname: string;
    description: string;
  };
}
