export interface User {
  _id: string;
  email: string;
  fullname: string;
  profilePic: string;
  createdAt: string;
}

export interface UserSignUp {
  email: string;
  fullname: string;
  password: string;
}

export interface UserLogIn {
  email: string;
  password: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image: string;
}
