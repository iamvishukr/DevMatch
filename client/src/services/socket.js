import { io } from "socket.io-client";

const SOCKET_URL = "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;