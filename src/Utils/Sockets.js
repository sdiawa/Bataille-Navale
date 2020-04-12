import io from 'socket.io-client';
export default io('https://uvsq-bataille-navale-back.herokuapp.com/sockets',{path:"/sockets"});