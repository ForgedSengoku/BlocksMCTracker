const t=require("mineflayer"),{EventEmitter:e}=require("events"),o=new e,n={};let r=null,i=null;function c(t){console.log(t),o.emit("log",t+"\n")}function l(){let t="";const e="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";for(let o=0;o<8;o++)t+=e.charAt(Math.floor(62*Math.random()));return t}function s(e){const o=t.createBot({host:"ccc.blocksmc.com",port:25565,username:l(),version:"1.8.8"});n[e]=o,o.on("spawn",(()=>{c(`Bot ${o.username} spawned (Bot #${e}).`),o.chat("/register PacketRegisterBot PacketRegisterBot"),setTimeout((()=>{o.chat("/login PacketRegisterBot")}),300),setTimeout((()=>{o.setControlState("forward",!0)}),500),setTimeout((()=>{o.setControlState("forward",!1)}),1e3)})),o.on("end",(()=>{c(`Bot ${o.username} (Bot #${e}) disconnected.`),delete n[e]})),o.on("kicked",(t=>{c(`Bot ${o.username} (Bot #${e}) kicked for: ${t}`),delete n[e]})),o.on("error",(t=>{c(`Bot ${o.username} (Bot #${e}) encountered an error: ${t}`)}))}module.exports={startSelfkick:function(){c("Starting selfkick functionality..."),r=setTimeout((()=>{for(let t=1;t<=3;t++)n[t]||s(t)}),2e3),i=setInterval((()=>{for(let t=1;t<=3;t++)n[t]||s(t)}),2e3)},stopSelfkick:function(){c("Stopping selfkick functionality..."),r&&(clearTimeout(r),r=null),i&&(clearInterval(i),i=null);for(const t in n){try{n[t].quit(),c(`Bot in slot ${t} quitting.`)}catch(e){c(`Error quitting bot in slot ${t}: ${e}`)}delete n[t]}},emitter:o};