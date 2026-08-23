import{r as i,j as b}from"./index-DGpPtIjz.js";import{L as d}from"./leaflet-src-DG4mPZJL.js";import{u as E}from"./useMapProvider-_EtD0HEy.js";import{g as C}from"./mapConfig-jMKUUHVu.js";const M=`data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.12 113.81">
  <defs>
    <style>
      .cls-1 {
        fill: #fc0;
      }
      .cls-2 {
        fill: #fff;
      }
      .cls-3 {
        fill: #27b0ff;
      }
    </style>
  </defs>
  <circle class="cls-2" cx="36.31" cy="49.53" r="19.75"/>
  <path class="cls-3" d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"/>
  <path class="cls-1" d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z"/>
</svg>`)}`,P=d.icon({iconUrl:M,iconSize:[42,62],iconAnchor:[21,62],popupAnchor:[0,-62],shadowUrl:void 0,shadowSize:void 0,shadowAnchor:void 0});console.log("🎯 Main marker icon created (inline SVG)");const f=l=>{const e=(l==null?void 0:l.color)||"#f59e0b",t=(l==null?void 0:l.icon)||"📍",n=(l==null?void 0:l.size)||"medium",c={small:"w-8 h-8 text-xl",medium:"w-10 h-10 text-2xl",large:"w-12 h-12 text-3xl"};return d.divIcon({html:`
      <div class="relative flex items-center justify-center ${c[n]}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <svg class="absolute w-full h-full" viewBox="0 0 24 36" fill="${e}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.6-5.4-12-12-12z"/>
        </svg>
        <span class="relative z-10 -mt-2" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${t}</span>
      </div>
    `,className:"custom-marker",iconSize:[40,40],iconAnchor:[20,40],popupAnchor:[0,-40]})},j={default:f({color:"#f59e0b",icon:"📍"}),photo:f({color:"#3b82f6",icon:"📷"}),location:f({color:"#10b981",icon:"📍"}),food:f({color:"#ef4444",icon:"🍽️"}),hotel:f({color:"#8b5cf6",icon:"🏨"}),activity:f({color:"#f59e0b",icon:"🎯"}),shop:f({color:"#ec4899",icon:"🛍️"}),nature:f({color:"#059669",icon:"🌲"}),culture:f({color:"#7c3aed",icon:"🏛️"}),selected:P},R=111320;function y(l,e,t,n){const c=R*Math.cos(t.lat*Math.PI/180),a=(l-t.lat)*R,g=(e-t.lng)*c,s=Math.hypot(a,g);if(s<=n)return{lat:l,lng:e};const u=n/s;return{lat:t.lat+(l-t.lat)*u,lng:t.lng+(e-t.lng)*u}}function k(l,e,t,n,c,a,g,s,u){e.current&&l.removeLayer(e.current);const r=d.marker([t,n],{icon:j.selected,draggable:c}).addTo(l).bindPopup(`📍 ${t.toFixed(6)}, ${n.toFixed(6)}`);return u&&r.openPopup(),c&&r.on("dragend",p=>{const m=p.latlng??{lat:0,lng:0},o=g&&a?y(m.lat,m.lng,g,a):{lat:m.lat,lng:m.lng};(o.lat!==m.lat||o.lng!==m.lng)&&r.setLatLng([o.lat,o.lng]),s(o.lat,o.lng)}),e.current=r,r}function Z({onLocationSelect:l,initialLocation:e,readonly:t=!1,zoom:n=15,radiusMeters:c,draggable:a=!1}){const g=i.useRef(null),s=i.useRef(null),u=i.useRef(null),r=i.useRef(e??null),{mapProvider:p}=E();return i.useEffect(()=>{e&&!r.current&&(r.current={lat:e.lat,lng:e.lng})},[e]),i.useEffect(()=>{if(!g.current)return;const v=r.current??{lat:54.526,lng:15.2551},m=r.current?n:4,o=d.map(g.current).setView([v.lat,v.lng],m);s.current=o;const w=C(p);return d.tileLayer(w.url,{attribution:w.attribution,maxZoom:w.maxZoom}).addTo(o),r.current&&k(o,u,r.current.lat,r.current.lng,!t&&a,c,r.current,l,!0),t||o.on("click",x=>{const h=c&&r.current?y(x.latlng.lat,x.latlng.lng,r.current,c):{lat:x.latlng.lat,lng:x.latlng.lng};k(o,u,h.lat,h.lng,!t&&a,c,r.current,l,!0),l(h.lat,h.lng)}),()=>{s.current&&(s.current.remove(),s.current=null),u.current=null}},[l,t,p,n,c,a]),i.useEffect(()=>{!s.current||!e||(k(s.current,u,e.lat,e.lng,!t&&a,c,r.current,l,!1),s.current.setView([e.lat,e.lng],n))},[e,n,t,a,c,l]),b.jsxs("div",{className:"relative w-full h-full",children:[b.jsx("div",{ref:g,className:"w-full h-full"}),!t&&b.jsx("div",{className:"absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm z-[1000]",children:c?"📍 Drag or click to fine-tune the pin (small radius)":"📍 Click on the map to select location"})]})}export{Z as L};
