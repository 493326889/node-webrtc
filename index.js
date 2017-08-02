const ws = require('ws');
const SemanticSDP = require("semantic-sdp");
const SDPInfo = SemanticSDP.SDPInfo;
const DTLSInfo = SemanticSDP.DTLSInfo;
const ICEInfo = SemanticSDP.ICEInfo;
const Setup = SemanticSDP.Setup;
const MediaInfo = SemanticSDP.MediaInfo;
const CandidateInfo = SemanticSDP.CandidateInfo;
const iceParse = require('wrtc-ice-cand-parse');
const RtpSession = require('rtp-rtcp').RtpSession;
const RtpPacket = require('rtp-rtcp').RtpPacket;

// const serverSDP = require('./sdp');
const localCandidate = require('./candidate');
const socketPort = 9001;

let globalConfig = {
	remoteSDP: null,
	remoteCandidate: []
};

const rtpServer = new RtpSession(3001);

//rtp服务器设置
const rtpConfig = {
	ip: '127.0.0.1',
	port: 3888
};

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
					var answer = createAnswer(SemanticSDP.SDPInfo.process(data.sdp)).toString()
					console.log('answer', answer);
					// send  answer
					ws.send(JSON.stringify({
						type: 'answer',
						sdp: answer
					}));
					//   console.log(sdpObj);
					break;

				case 'candidate':
					console.log('candidate', data.candidate);

					let candidate = iceParse.parse(data.candidate.candidate);
					// candidate.localIP = rtpConfig.ip;
					// candidate.localPort = rtpConfig.port;
					// data.candidate.candidate = iceParse.stringify(candidate);

					data.candidate.candidate = "candidate:452042418 1 udp 2122260223 127.0.0.1 3888 typ host generation 0 ufrag af46F network-id 1 network-cost 10"

					ws.send(JSON.stringify(data));
					break;

				default:
					console.log('not match');
					break;
			}
		});
	});
}
function createAnswer(offer) {
// console.log(offer);
//Set the local DTLS and ICE info 
const dtls = new DTLSInfo(Setup.PASSIVE,"sha-256","F2:AA:0E:C3:22:59:5E:14:95:69:92:3D:13:B4:84:24:2C:C2:A2:C0:3E:FD:34:8E:5E:EA:6F:AF:52:CE:E6:0F");
const ice  = new ICEInfo("af46F","a34FasdS++jdfofdslkjsd/SDV");
 
//Get local candidte 
const candidate = new CandidateInfo(1,1, "udp", 2122260223, "127.0.0.1", 3888, "host");
 
//Create local SDP info 
let answer = new SDPInfo();
 
 
//Add ice and dtls info 
answer.setDTLS(dtls);
answer.setICE(ice);
answer.addCandidate(candidate);
 
//Get remote audio m-line info  
let audioOffer = offer.getMedia("audio");
 
//If we have audio 
if (audioOffer)
{
    //Create audio media 
    let audio = new MediaInfo("audio", "audio");
    
    //Get codec type 
    let opus = audioOffer.getCodec("opus");
    //Add opus codec 
    audio.addCodec(opus);
 
    //Add audio extensions 
    for (let extension of audioOffer.getExtensions().entries())
        //Add it 
        audio.addExtension(extension[0], extension[1]);
    //Add it to answer 
    answer.addMedia(audio);
}
 
//Get remote video m-line info  
let videoOffer = offer.getMedia("video");
 
//If offer had video 
if (videoOffer)
{
    //Create video media 
    let  video = new MediaInfo("video", "video");
    //Get codec types 
    let vp9 = videoOffer.getCodec("vp9");
    let fec = videoOffer.getCodec("flexfec-03");
    //Add video codecs 
    video.addCodec(vp9);
    if (fec)
        video.addCodec(fec);
    //Limit incoming bitrate 
    video.setBitrate(1024);
 
    //Add video extensions 
    for (let extension of videoOffer.getExtensions().entries())
        //Add it 
        video.addExtension(extension[0], extension[1]);
 
    //Add it to answer 
    answer.addMedia(video);
}
return answer;

 
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
