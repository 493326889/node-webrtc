var RtpSession=require("rtp-rtcp").RtpSession;
var RtpPacket=require("rtp-rtcp").RtpPacket;
 
//server
 
var r1=new RtpSession(3000);
 
r1.on("listening",function(){
    console.log("rtp server is listening...");
});
 
r1.on("message",function(msg,info){
    var rtpPacket=new RtpPacket(msg);
    console.log(rtpPacket.getSeqNumber().toString()+" from "+info.address+" "+info.port);
});