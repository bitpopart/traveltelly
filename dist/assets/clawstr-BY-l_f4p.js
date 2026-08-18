const m=[{id:"travel",name:"Travel",url:"https://clawstr.com/c/travel",description:"Travel experiences, tips, and photography",icon:"🌍"},{id:"photography",name:"Photography",url:"https://clawstr.com/c/photography",description:"Photography discussion and showcases",icon:"📸"},{id:"nostr",name:"Nostr",url:"https://clawstr.com/c/nostr",description:"Nostr protocol and applications",icon:"🟣"},{id:"bitcoin",name:"Bitcoin",url:"https://clawstr.com/c/bitcoin",description:"Bitcoin and Lightning Network",icon:"₿"},{id:"ai-freedom",name:"AI Freedom",url:"https://clawstr.com/c/ai-freedom",description:"AI independence and agency",icon:"🤖"},{id:"introductions",name:"Introductions",url:"https://clawstr.com/c/introductions",description:"Welcome new members",icon:"👋"}];function $(t){return[["I",t],["K","web"],["i",t],["k","web"],["L","agent"],["l","ai","agent"],["client","traveltelly"],["t","traveltelly"]]}function h(t,c,i=[]){return{kind:1111,content:t,tags:[...$(c),...i]}}function v(t,c="travel"){var e,f,y,n;const i=((e=t.tags.find(([a])=>a==="title"))==null?void 0:e[1])||"Untitled",o=((f=t.tags.find(([a])=>a==="rating"))==null?void 0:f[1])||"0",s=((y=t.tags.find(([a])=>a==="location"))==null?void 0:y[1])||"",g=((n=t.tags.find(([a])=>a==="category"))==null?void 0:n[1])||"",l="⭐".repeat(parseInt(o)),r=`📍 ${i}

${l} ${o}/5 ${g?`• ${g}`:""}
${s}

${t.content}

#travel #review #traveltelly`,p=m.find(a=>a.id===c),d=(p==null?void 0:p.url)||m[0].url;return h(r,d,[["e",t.id],["t","review"],["t","travel"]])}function w(t,c="travel"){var p,d;const i=((p=t.tags.find(([e])=>e==="title"))==null?void 0:p[1])||"Untitled",s=((d=t.tags.find(([e])=>e==="summary"))==null?void 0:d[1])||""||t.content.substring(0,280)+"...",g=`📝 ${i}

${s}

Read more on Traveltelly ✈️

#travel #story #traveltelly`,l=m.find(e=>e.id===c),r=(l==null?void 0:l.url)||m[0].url;return h(g,r,[["e",t.id],["t","story"],["t","travel"],["t","writing"]])}function C(t,c="travel"){var f,y,n,a;const i=((f=t.tags.find(([u])=>u==="title"))==null?void 0:f[1])||"Untitled",o=((y=t.tags.find(([u])=>u==="category"))==null?void 0:y[1])||"",s=((n=t.tags.find(([u])=>u==="distance"))==null?void 0:n[1])||"",g=((a=t.tags.find(([u])=>u==="distance_unit"))==null?void 0:a[1])||"km",l=t.tags.filter(([u])=>u==="image").length,p=`✈️ ${i}

${o==="hike"?"🥾":o==="cycling"?"🚴":"🚶"} ${o}${s?` • ${s} ${g}`:""}
📸 ${l} photos with GPS route

${t.content}

#travel #trip #traveltelly`,d=m.find(u=>u.id===c),e=(d==null?void 0:d.url)||m[0].url;return h(p,e,[["e",t.id],["t","trip"],["t","travel"],["t",o]])}function U(t,c="photography"){var d,e,f,y;const i=((d=t.tags.find(([n])=>n==="title"))==null?void 0:d[1])||"Untitled",o=((e=t.tags.find(([n])=>n==="summary"))==null?void 0:e[1])||"",s=(f=t.tags.find(([n])=>n==="price"))==null?void 0:f[1],g=((y=t.tags.find(([n])=>n==="currency"))==null?void 0:y[1])||"USD",l=`📸 ${i}

${o}

${s?`💰 ${s} ${g}`:""}

Available on Traveltelly Marketplace ⚡

#photography #stockphoto #traveltelly #bitcoin`,r=m.find(n=>n.id===c),p=(r==null?void 0:r.url)||m[0].url;return h(l,p,[["e",t.id],["t","photography"],["t","stockphoto"],["t","marketplace"]])}function k(t,c,i=[]){const o=m.find(r=>r.id===c),s=(o==null?void 0:o.url)||m[0].url,g=i.map(r=>`#${r}`).join(" "),l=`${t}

${g}`;return h(l,s,i.map(r=>["t",r]))}export{m as C,C as a,w as b,h as c,v as d,k as e,U as f};
