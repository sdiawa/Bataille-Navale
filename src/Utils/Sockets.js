import io from 'socket.io-client';
//http://localhost:8000
export default io('https://uvsq-bataille-navale-back.herokuapp.com', {path: "/sockets"});