const ws = require('ws');
const socketPort = 9001;
const wss = new ws.Server({'port': socketPort});
let globalConfig = {};
let remoteIp = '127.0.0.1';

const SemanticSDP = require("semantic-sdp");
const SDPInfo = SemanticSDP.SDPInfo;
const DTLSInfo = SemanticSDP.DTLSInfo;
const CandidateInfo = SemanticSDP.CandidateInfo;


// const serverSDP = require('./sdp');
const RtpSession=require("rtp-rtcp").RtpSession;
const RtpPacket=require("rtp-rtcp").RtpPacket;

const rtpServer = new RtpSession(3001);

const dtls = new DTLSInfo();

//Get local candidte 
const candidate = new CandidateInfo(1, 1, "udp", 2122260223, "127.0.0.1", 9001, "host");
 

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
    
    //send your payload, rtpsession will generate a rtppacket automatically with its private member named _rtpPacket.
    rtpServer.sendPayload(payload);
    
    console.log("send");
},3000);

wss.on('connection', (ws) => {
	console.log('connection');
	ws.on('message', (data) => {
		data = JSON.parse(data);
		// 接收到offer
		if('offer' === data.type) {
			// todo sdp setup active
			globalConfig.remoteSDP = data.sdp;
			// send  answer
			// ws.send(JSON.stringify({type: 'answer', sdp: serverSDP.sdp}));

		}
	})
})


function createAnswer(offer) {
	let answer = new SDPInfo();
}