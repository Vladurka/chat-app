export interface User {
  _id: string;
  email: string;
  fullname: string;
  profilePic: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image: string;
}
