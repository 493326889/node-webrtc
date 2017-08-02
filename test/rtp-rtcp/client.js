var RtpSession=require("rtp-rtcp").RtpSession;
var RtpPacket=require("rtp-rtcp").RtpPacket;

//client
 
var r2=new RtpSession(3001);
 
r2.setRemoteAddress(3000,"localhost");
 
r2.on("error",function(err){
    console.log(err)
});
 
var payload=new Buffer("helloworld");
 
setInterval(function(){
    
    //send your payload, rtpsession will generate a rtppacket automatically with its private member named _rtpPacket.
    r2.sendPayload(payload);
    
    console.log("send");
},3000);