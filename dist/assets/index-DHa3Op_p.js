import{o as a,h as m,bc as g,k as f,ba as y,r as d}from"./index-9oFfl1dr.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=a("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=a("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=a("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);function S(){const{nostr:r}=m(),{logins:e,setLogin:h,removeLogin:p}=g(),{data:o=[]}=f({queryKey:["logins",e.map(t=>t.id).join(";")],queryFn:async({signal:t})=>{const c=await r.query([{kinds:[0],authors:e.map(s=>s.pubkey)}],{signal:AbortSignal.any([t,AbortSignal.timeout(1500)])});return e.map(({id:s,pubkey:u})=>{const n=c.find(i=>i.pubkey===u);try{const i=y.json().pipe(y.metadata()).parse(n==null?void 0:n.content);return{id:s,pubkey:u,metadata:i,event:n}}catch{return{id:s,pubkey:u,metadata:{},event:n}}})},retry:3}),l=(()=>{const t=e[0];if(!t)return;const c=o.find(s=>s.id===t.id);return{metadata:{},...c,id:t.id,pubkey:t.pubkey}})(),k=(o||[]).slice(1);return{authors:o,currentUser:l,otherUsers:k,setLogin:h,removeLogin:p}}function L(r){const e=d.useRef({value:r,previous:r});return d.useMemo(()=>(e.current.value!==r&&(e.current.previous=e.current.value,e.current.value=r),e.current.previous),[r])}export{x as C,b as P,q as S,P as U,S as a,L as u};
