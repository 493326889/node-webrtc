const ws = require('ws');
const SemanticSDP = require("semantic-sdp");
const SDPInfo = SemanticSDP.SDPInfo;
const DTLSInfo = SemanticSDP.DTLSInfo;
const CandidateInfo = SemanticSDP.CandidateInfo;

const iceParse=require('wrtc-ice-cand-parse');
const socketPort = 9001;
const wss = new ws.Server({'port': socketPort});

let globalConfig = {
	remoteSDP: null,
	remoteCandidate: []
};
let remoteIp = '127.0.0.1';

const RtpSession=require("rtp-rtcp").RtpSession;
const RtpPacket=require("rtp-rtcp").RtpPacket;
const rtpServer = new RtpSession(3001);

// const dtls = new DTLSInfo();

//Get local candidte 
// const candidate = new CandidateInfo(1, 1, "udp", 2122260223, "127.0.0.1", 9001, "host");
 

rtpServer.on("listening",function(){
    console.log("rtp server is listening...");
});
rtpServer.on("message",function(msg,info){
    // var rtpPacket=new RtpPacket(msg);
    console.log(rtpPacket.getSeqNumber().toString()+" from "+info.address+" "+info.port);
});
rtpServer.setRemoteAddress(80, remoteIp);

var payload=new Buffer("helloworld");
 
setInterval(function(){
    rtpServer.sendPayload(payload);
    console.log("send");
},3000);

const serverSDP = require('./sdp');

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
				console.log('offer',data.sdp);
				globalConfig.remoteSDP = data.sdp;
			  
			  	// send  answer
				ws.send(JSON.stringify({type: 'answer', sdp: serverSDP.sdp}));
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
