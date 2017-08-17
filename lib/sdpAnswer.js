const SemanticSDP = require("semantic-sdp");
const SDPInfo = SemanticSDP.SDPInfo;
const DTLSInfo = SemanticSDP.DTLSInfo;
const ICEInfo = SemanticSDP.ICEInfo;
const Setup = SemanticSDP.Setup;
const MediaInfo = SemanticSDP.MediaInfo;
const CandidateInfo = SemanticSDP.CandidateInfo;
const StreamInfo    = SemanticSDP.StreamInfo;
const TrackInfo     = SemanticSDP.TrackInfo;


function createAnswer(answer, peer) {
    // console.log(answer)
    let offer = peer.remoteDescription.sdp;
    let fingerPrint = peer._pems.fingerprint;
    // console.log('fingerPrint', fingerPrint);
    let username = peer._iceAgent.localUsername;
    let password = peer._iceAgent.localPassword;
    let candidates = peer._iceAgent.candidates;
    // console.log('candidates', candidates);
    // if (answer) {
        // console.log(answer, SemanticSDP.SDPInfo.process(answer.toString()));
        // answer = SemanticSDP.SDPInfo.process(answer.toString());
        offer = SemanticSDP.SDPInfo.process(offer);
    // }
    // console.log(offer);
    //Set the local DTLS and ICE info 
    const dtls = new DTLSInfo(Setup.PASSIVE, fingerPrint.type, fingerPrint.hash);
    const ice = new ICEInfo(username, password);

    answer = new SDPInfo();

    // candidates.forEach((candidate, index) => {
    //     // console.log(index)
    //     //Get local candidte 
    //     let value = new CandidateInfo(candidate.foundation, 1, candidate.protocol, candidate.priority, candidate.ip, candidate.port, candidate.type);
    //     answer.addCandidate(value);
    // })
    // //Get local candidte 
    // const candidate = new CandidateInfo(0, 1, "udp", 2113929472, "10.69.106.52", 57751, "host");

    //Create local SDP info 
    // answer = new SDPInfo();


    //Add ice and dtls info 
    answer.setDTLS(dtls);
    answer.setICE(ice);
    // answer.addCandidate(candidate);

    //Get remote audio m-line info  
    let audioOffer = offer.getMedia("audio");
    console.log('candidates', candidates)
    // //If we have audio 
    if (audioOffer) {
        let candidate = candidates[1]
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
          //Get local candidte 
        // let value = new CandidateInfo(candidate.foundation, 1, candidate.protocol, candidate.priority, candidate.ip, candidate.port, candidate.type);
        // answer.addCandidate(value);
    }

    //Get remote video m-line info  
    let videoOffer = offer.getMedia("video");

    //If offer had video 
    if (videoOffer) {
        let candidate = candidates[1];
        //Create video media 
        let video = new MediaInfo("video", "video");
        //Get codec types 
        let h264 = videoOffer.getCodec("h264");
        // let fec = videoOffer.getCodec("flexfec-03");
        //Add video codecs 
        video.addCodec(h264);
        // if (fec)
            // video.addCodec(fec);
        //Limit incoming bitrate 
        video.setBitrate(1024);

        //Add video extensions 
        for (let extension of videoOffer.getExtensions().entries())
            //Add it 
            video.addExtension(extension[0], extension[1]);

        //Add it to answer 
        answer.addMedia(video);
        // let value = new CandidateInfo(candidate.foundation, 1, candidate.protocol, candidate.priority, candidate.ip, candidate.port, candidate.type);
        // answer.addCandidate(value);
    }
    console.log(answer.toString())
    return answer.toString();

}

module.exports = {
    createAnswer: createAnswer
}