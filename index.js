const ws = require('ws');
const SemanticSDP = require("semantic-sdp");
const iceParse=require('wrtc-ice-cand-parse');

const socketPort = 9001;
const wss = new ws.Server({'port': socketPort});

let globalConfig = {
	remoteSDP: null,
	remoteCandidate: []
};
let remoteIp = '127.0.0.1';
const serverSDP = require('./sdp');
let serverSDPObj = SemanticSDP.SDPInfo.process(serverSDP.sdp);

wss.on('connection', (ws) => {
	console.log('connection');
	ws.on('message', (data) => {

		//解析json字符串
		try{
			data = JSON.parse(data);
		}
		catch(e){
			console.log('Error parsing JSON');
			data={};
		}
		
		console.log(data.type);
		switch(data.type){
			case 'offer':
				//  let sdpObj = SemanticSDP.SDPInfo.process(data.sdp).plain();
				console.log('offer',data.sdp);
				globalConfig.remoteSDP = data.sdp;
			  
			  	// send  answer
				ws.send(JSON.stringify({type: 'answer', sdp: serverSDP.sdp}));
				//   console.log(sdpObj);
				break;
			
			case 'candidate':
				console.log('candidate',data.candidate);

				globalConfig.remoteCandidate.push(data.candidate);
				ws.send(JSON.stringify(data));
				break;
			
			default:
				console.log('not match');
				
				break;
		}
	});
});