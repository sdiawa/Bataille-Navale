import io from 'socket.io-client';
//https://uvsq-bataille-navale-back.herokuapp.com
export default io('https://uvsq-bataille-navale-back.herokuapp.com/sockets',{path:"/sockets"});