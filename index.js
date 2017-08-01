const ws = require('ws');
const socketPort = 9001;
const wss = new ws.Server({'port': socketPort});
let globalConfig = {};
let remoteIp = '127.0.0.1';
const SemanticSDP = require("semantic-sdp");
const serverSDP = require('./sdp');
console.log(serverSDP);

wss.on('connection', (ws) => {
	console.log('connection');
	ws.on('message', (data) => {
		data = JSON.parse(data);
		if('offer' === data.type) {
			 let sdpObj = SemanticSDP.SDPInfo.process(data.sdp);
			  globalConfig.remoteSDP = data.sdp;
			  
			  // send  answer
				ws.send(JSON.stringify({type: 'answer', sdp: serverSDP.sdp}));
			//   console.log(sdpObj);
		}
	})
})