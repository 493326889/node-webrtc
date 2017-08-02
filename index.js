const ws = require('ws');
const SemanticSDP = require("semantic-sdp");
const iceParse = require('wrtc-ice-cand-parse');
const RtpSession = require('rtp-rtcp').RtpSession;
const RtpPacket = require('rtp-rtcp').RtpPacket;

const serverSDP = require('./sdp');
const localCandidate = require('./candidate');

const socketPort = 9001;

let globalConfig = {
	remoteSDP: null,
	remoteCandidate: []
};

//rtp服务器设置
const rtpConfig = {
	ip: '127.0.0.1',
	port: 3000
};

//let serverSDPObj = SemanticSDP.SDPInfo.process(serverSDP.sdp);

function createWebsocket() {
	const wss = new ws.Server({
		'port': socketPort
	});

	wss.on('connection', (ws) => {
		console.log('websocket is starting');

		ws.on('message', (data) => {

			//解析json字符串
			try {
				data = JSON.parse(data);
			} catch (e) {
				console.log('Error parsing JSON');
				data = {};
			}

			switch (data.type) {
				case 'offer':
					//  let sdpObj = SemanticSDP.SDPInfo.process(data.sdp).plain();
					console.log('offer', data.sdp);
					globalConfig.remoteSDP = data.sdp;

					// send  answer
					ws.send(JSON.stringify({
						type: 'answer',
						sdp: serverSDP.sdp
					}));
					//   console.log(sdpObj);
					break;

				case 'candidate':
					console.log('candidate', data.candidate);

					let candidate = iceParse.parse(data.candidate.candidate);
					candidate.localIP = rtpConfig.ip;
					candidate.localPort = rtpConfig.port;
					data.candidate.candidate = iceParse.stringify(candidate);

					ws.send(JSON.stringify(data));
					break;

				default:
					console.log('not match');
					break;
			}
		});
	});
}

function createRtpServer() {
	let rtp = new RtpSession(rtpConfig.port);

	rtp.on('listening', () => {
		console.log('rtp server is starting');
	});

	rtp.on('message', (msg, info) => {
		console.log(msg);
		let rtpPacket = new RtpPacket(msg);
		console.log(rtpPacket.getSeqNumber().toString() + " from " + info.address + " " + info.port);

		var payload=new Buffer('hello world');
		rtp.sendPayload(payload);
	});

	// setInterval(function(){
	// 	rtp.sendPayload(payload);
	// 	console.log('send');
	// },1000);
}

function init(){
	createWebsocket();
	createRtpServer();
}

init();