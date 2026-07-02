import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { Navigation } from '@/components/Navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';

import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ─── Admin guard ────────────────────────────────────────────────────────────
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX  = nip19.decode(ADMIN_NPUB).data as string;

// ─── Styles (TellyMedia dark theme) ─────────────────────────────────────────
const tellyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .tellymedia-wrap * { box-sizing: border-box; }
  .tellymedia-wrap { background: #0a0f0d; border-radius: 12px; color: #e8f0eb; font-family: 'DM Sans', sans-serif; padding: 32px 24px 48px; }
  .tm-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 36px; border-bottom: 1px solid #1e2e26; padding-bottom: 20px; }
  .tm-logo { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; color: #00e5a0; letter-spacing: -0.5px; }
  .tm-logo-sub { font-size: 12px; color: #4a6657; font-family: 'Space Mono', monospace; letter-spacing: 2px; text-transform: uppercase; }
  .tm-drop-zone { border: 1.5px dashed #1e2e26; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: #111916; margin-bottom: 24px; }
  .tm-drop-zone:hover, .tm-drop-zone.drag-over { border-color: #00e5a0; background: #0d1a12; }
  .tm-drop-icon { font-size: 28px; margin-bottom: 8px; }
  .tm-drop-text { font-size: 14px; color: #4a6657; }
  .tm-drop-text strong { color: #00e5a0; font-weight: 500; }
  .tm-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .tm-preview-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #1e2e26; cursor: pointer; }
  .tm-preview-item.active { border-color: #00e5a0; box-shadow: 0 0 0 2px #00e5a033; }
  .tm-preview-item img { width: 100%; height: 100%; object-fit: cover; }
  .tm-preview-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); border: none; color: #fff; width: 20px; height: 20px; border-radius: 50%; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .tm-active-preview { width: 100%; max-height: 300px; object-fit: contain; border-radius: 10px; margin-bottom: 24px; border: 1px solid #1e2e26; background: #050a07; }
  .tm-field-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #00e5a0; margin-bottom: 8px; display: block; }
  .tm-textarea, .tm-input { width: 100%; background: #111916; border: 1px solid #1e2e26; border-radius: 8px; color: #e8f0eb; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 12px 14px; outline: none; transition: border-color 0.2s; margin-bottom: 20px; }
  .tm-textarea:focus, .tm-input:focus { border-color: #00e5a066; }
  .tm-textarea { min-height: 70px; resize: vertical; }
  .tm-generate-btn { width: 100%; padding: 14px; background: #00e5a0; color: #0a0f0d; border: none; border-radius: 8px; font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.15s; margin-bottom: 32px; }
  .tm-generate-btn:hover:not(:disabled) { background: #00ffb3; transform: translateY(-1px); }
  .tm-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .tm-loading { display: flex; align-items: center; gap: 10px; justify-content: center; color: #4a6657; font-size: 13px; margin-bottom: 32px; }
  .tm-dot-pulse { display: flex; gap: 4px; }
  .tm-dot-pulse span { width: 6px; height: 6px; border-radius: 50%; background: #00e5a0; animation: tm-pulse 1.2s ease-in-out infinite; }
  .tm-dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
  .tm-dot-pulse span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tm-pulse { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  .tm-result-section { background: #111916; border: 1px solid #1e2e26; border-radius: 12px; padding: 24px; margin-bottom: 16px; animation: tm-fadeIn 0.3s ease; }
  @keyframes tm-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .tm-result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .tm-result-label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #00e5a0; }
  .tm-copy-btn { background: transparent; border: 1px solid #1e2e26; color: #4a6657; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-family: 'Space Mono', monospace; cursor: pointer; transition: all 0.15s; }
  .tm-copy-btn:hover, .tm-copy-btn.copied { border-color: #00e5a0; color: #00e5a0; }
  .tm-result-text { font-size: 14px; line-height: 1.6; color: #c8dcd0; }
  .tm-keyword-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
  .tm-keyword-tag { background: #0d1a12; border: 1px solid #1e3028; color: #7db89a; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-family: 'Space Mono', monospace; }
  .tm-editorial-badge { display: inline-flex; align-items: center; gap: 6px; background: #2a1a08; border: 1px solid #5a3a10; color: #e8a050; padding: 8px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; }
  .tm-platform-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .tm-platform-pill { background: #0d1a12; border: 1px solid #1e3028; color: #4a8c68; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-family: 'Space Mono', monospace; }
  .tm-divider { border: none; border-top: 1px solid #1e2e26; margin: 8px 0 20px; }
  .tm-keyword-count { font-size: 11px; color: #4a6657; font-family: 'Space Mono', monospace; }
  .tm-download-btn { width: 100%; padding: 14px 20px; background: transparent; color: #00e5a0; border: 1.5px solid #00e5a0; border-radius: 8px; font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.15s; margin-top: 4px; display: flex; align-items: center; justify-content: space-between; }
  .tm-download-btn:hover { background: #00e5a015; transform: translateY(-1px); }
  .tm-dl-filename { font-weight: 400; font-size: 11px; opacity: 0.5; letter-spacing: 0; }
  .tm-dl-error { background: #1a0a08; border: 1px solid #5a2010; color: #e87a50; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
`;

// ─── XMP helpers ─────────────────────────────────────────────────────────────
function buildXMP(title: string, desc: string, keywords: string[]): string {
  const e = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const kw = (keywords || []).map(k => '<rdf:li>' + e(k) + '</rdf:li>').join('');
  return (
    '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>' +
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">' +
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
    '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">' +
    '<dc:title><rdf:Alt><rdf:li xml:lang="x-default">' + e(title) + '</rdf:li></rdf:Alt></dc:title>' +
    '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">' + e(desc) + '</rdf:li></rdf:Alt></dc:description>' +
    '<dc:subject><rdf:Bag>' + kw + '</rdf:Bag></dc:subject>' +
    '<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">TravelTelly - All Rights Reserved</rdf:li></rdf:Alt></dc:rights>' +
    '<dc:creator><rdf:Seq><rdf:li>TravelTelly</rdf:li></rdf:Seq></dc:creator>' +
    '<photoshop:Headline>' + e(title) + '</photoshop:Headline>' +
    '</rdf:Description></rdf:RDF></x:xmpmeta>' +
    '<?xpacket end="w"?>'
  );
}

function injectXMP(buffer: ArrayBuffer, xmpStr: string): Uint8Array | null {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const enc   = new TextEncoder();
  const ns    = enc.encode('http://ns.adobe.com/xap/1.0/\0');
  const xmp   = enc.encode(xmpStr);
  const payLen = ns.length + xmp.length;
  const segLen = payLen + 2;
  if (segLen > 65533) return null;
  const seg = new Uint8Array(4 + payLen);
  seg[0] = 0xff; seg[1] = 0xe1;
  seg[2] = (segLen >> 8) & 0xff; seg[3] = segLen & 0xff;
  seg.set(ns, 4); seg.set(xmp, 4 + ns.length);
  let insertAt = 2, repStart = -1, repLen = 0, i = 2;
  while (i + 3 < bytes.length) {
    if (bytes[i] !== 0xff) break;
    const mk = bytes[i + 1];
    if (mk === 0xd9 || mk === 0xda) break;
    const sl = (bytes[i + 2] << 8) | bytes[i + 3];
    if (mk === 0xe1) {
      const cand = bytes.slice(i + 4, i + 4 + ns.length);
      if (cand.every((v, j) => v === ns[j])) { repStart = i; repLen = 2 + sl; break; }
      insertAt = i + 2 + sl;
    } else if (mk === 0xe0) {
      insertAt = i + 2 + sl;
    }
    i += 2 + sl;
  }
  const before = repStart >= 0 ? bytes.slice(0, repStart)       : bytes.slice(0, insertAt);
  const after  = repStart >= 0 ? bytes.slice(repStart + repLen) : bytes.slice(insertAt);
  const out = new Uint8Array(before.length + seg.length + after.length);
  out.set(before, 0); out.set(seg, before.length); out.set(after, before.length + seg.length);
  return out;
}

interface TaggerResult {
  title: string;
  description: string;
  keywords: string[];
  editorial: boolean;
  editorialNote: string | null;
  category: string;
  platforms: string[];
  error?: string;
}

interface TaggerPhoto {
  url: string;
  name: string;
  base64: string;
  type: string;
  buffer: ArrayBuffer;
}

function triggerDownload(photo: TaggerPhoto, result: TaggerResult, onError: (e: string | null) => void) {
  try {
    const xmp    = buildXMP(result.title, result.description, result.keywords);
    const tagged = injectXMP(photo.buffer, xmp);
    if (!tagged) { onError('Could not embed metadata.'); return; }
    const blob = new Blob([tagged], { type: photo.type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = photo.name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onError(null);
  } catch (err) {
    onError('Download failed: ' + (err as Error).message);
  }
}

// ─── CopyBtn ─────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const go = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={'tm-copy-btn' + (copied ? ' copied' : '')} onClick={go}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

// ─── API key storage (shared with old recognizer) ────────────────────────────
const STORAGE_KEY = 'traveltelly_anthropic_key';
const getStoredApiKey = () => localStorage.getItem(STORAGE_KEY) ?? '';
const setStoredApiKey = (k: string) => localStorage.setItem(STORAGE_KEY, k);

// ─── TellyTagger core ─────────────────────────────────────────────────────────
function TellyTagger() {
  const [photos, setPhotos]       = useState<TaggerPhoto[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [desc, setDesc]           = useState('');
  const [rawKw, setRawKw]         = useState('');
  const [result, setResult]       = useState<TaggerResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [dlErr, setDlErr]         = useState<string | null>(null);
  const [apiKey, setApiKey]       = useState(getStoredApiKey);
  const [keySaved, setKeySaved]   = useState(() => !!getStoredApiKey());
  const [showKey, setShowKey]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const r1 = new FileReader();
      r1.onload = (e1) => {
        const dataUrl = (e1.target as FileReader).result as string;
        const r2 = new FileReader();
        r2.onload = (e2) => {
          setPhotos(prev => [...prev, {
            url: dataUrl,
            name: file.name,
            base64: dataUrl.split(',')[1],
            type: file.type,
            buffer: (e2.target as FileReader).result as ArrayBuffer,
          }]);
        };
        r2.readAsArrayBuffer(file);
      };
      r1.readAsDataURL(file);
    });
  }, []);

  const removePhoto = (idx: number) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
    if (activeIdx >= idx && activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  const generate = async () => {
    if (!desc.trim()) return;
    if (!apiKey.trim()) {
      setResult({ error: 'Please enter and save your Anthropic API key first.' } as TaggerResult);
      return;
    }
    setLoading(true); setResult(null); setDlErr(null);
    const ap = photos[activeIdx];

    const getCompressedBase64 = (photo: TaggerPhoto): Promise<string> =>
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1024;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else       { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
        };
        img.src = photo.url;
      });

    const system = `You are TellyMedia, a stock photography metadata specialist.
Respond ONLY with a valid JSON object — no markdown, no extra text.
{"title":"short stock title max 60 chars always shorter than description","description":"stay close to what user wrote minimal cleanup max 160 chars","keywords":["35 to 45 relevant keywords"],"editorial":false,"editorialNote":null,"category":"primary stock category","platforms":["Shutterstock","Adobe Stock","Pond5","TravelTelly"]}
Title must always be shorter than description.`;

    const content: Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }> = [];
    if (ap) {
      const smallBase64 = await getCompressedBase64(ap);
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: smallBase64 } });
    }
    content.push({ type: 'text', text: 'Description: ' + desc + '\nBase keywords: ' + (rawKw || 'none') + '\n\nRespond with JSON only.' });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, system, messages: [{ role: 'user', content }] }),
      });
      const data = await res.json() as { error?: { message: string }; content?: Array<{ type: string; text?: string }> };
      if (data.error) { setResult({ error: 'API: ' + data.error.message } as TaggerResult); setLoading(false); return; }
      const raw = data.content?.find(b => b.type === 'text')?.text ?? '';
      let txt = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const start = txt.indexOf('{');
      const end   = txt.lastIndexOf('}');
      if (start !== -1 && end !== -1) txt = txt.slice(start, end + 1);
      if (!txt) { setResult({ error: 'Empty response. Please try again.' } as TaggerResult); setLoading(false); return; }
      setResult(JSON.parse(txt) as TaggerResult);
    } catch (err) {
      setResult({ error: 'Error: ' + (err as Error).message } as TaggerResult);
    }
    setLoading(false);
  };

  const ap = photos[activeIdx];

  return (
    <div className="tellymedia-wrap">
      <div className="tm-header">
        <span className="tm-logo">TellyMedia</span>
        <span className="tm-logo-sub">stock tagger</span>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: 24 }}>
        <label className="tm-field-label">Anthropic API Key</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="tm-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setKeySaved(false); }}
              placeholder="sk-ant-..."
              style={{ marginBottom: 0, paddingRight: 40, fontFamily: 'monospace', fontSize: 13 }}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a6657', cursor: 'pointer', fontSize: 14 }}
            >{showKey ? '🙈' : '👁'}</button>
          </div>
          <button
            onClick={() => { setStoredApiKey(apiKey.trim()); setKeySaved(true); }}
            style={{ padding: '10px 18px', background: keySaved ? 'transparent' : '#00e5a0', color: keySaved ? '#00e5a0' : '#0a0f0d', border: '1.5px solid #00e5a0', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >{keySaved ? '✓ Saved' : 'Save Key'}</button>
        </div>
        {!apiKey && (
          <p style={{ fontSize: 11, color: '#e8a050', marginTop: 6 }}>⚠ No API key — add your Anthropic key to enable AI tagging.</p>
        )}
      </div>

      <div
        className={'tm-drop-zone' + (dragOver ? ' drag-over' : '')}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="tm-drop-icon">📷</div>
        <div className="tm-drop-text"><strong>Click to upload</strong> or drag photos here</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)} />
      </div>

      {photos.length > 0 && (
        <div className="tm-preview-grid">
          {photos.map((p, i) => (
            <div key={i} className={'tm-preview-item' + (i === activeIdx ? ' active' : '')}
              onClick={() => { setActiveIdx(i); setResult(null); setDlErr(null); }}>
              <img src={p.url} alt={p.name} />
              <button className="tm-preview-remove"
                onClick={ev => { ev.stopPropagation(); removePhoto(i); }}>×</button>
            </div>
          ))}
        </div>
      )}

      {ap && <img src={ap.url} alt="active" className="tm-active-preview" />}

      <label className="tm-field-label">Description</label>
      <textarea className="tm-textarea"
        placeholder="Describe the photo — location, subject, context..."
        value={desc} onChange={e => setDesc(e.target.value)} />

      <label className="tm-field-label">Your base keywords</label>
      <input className="tm-input" type="text"
        placeholder="Palace of culture, Warsaw, Poland, Europe..."
        value={rawKw} onChange={e => setRawKw(e.target.value)} />

      <button className="tm-generate-btn" onClick={generate} disabled={!desc.trim() || loading}>
        {loading ? 'GENERATING...' : 'GENERATE TAGS →'}
      </button>

      {loading && (
        <div className="tm-loading">
          <div className="tm-dot-pulse"><span /><span /><span /></div>
          Analyzing and building metadata...
        </div>
      )}

      {result && !result.error && (
        <>
          {result.editorial && (
            <div className="tm-editorial-badge">⚠ Editorial use — tick Editorial checkbox on upload</div>
          )}
          <div className="tm-result-section">
            <div className="tm-result-header">
              <span className="tm-result-label">Title</span>
              <CopyBtn text={result.title} />
            </div>
            <div className="tm-result-text" style={{ fontWeight: 500, fontSize: 16 }}>{result.title}</div>
          </div>
          <div className="tm-result-section">
            <div className="tm-result-header">
              <span className="tm-result-label">Description</span>
              <CopyBtn text={result.description} />
            </div>
            <div className="tm-result-text">{result.description}</div>
          </div>
          <div className="tm-result-section">
            <div className="tm-result-header">
              <div>
                <span className="tm-result-label">Keywords</span>
                <span className="tm-keyword-count" style={{ marginLeft: 10 }}>{result.keywords?.length} tags</span>
              </div>
              <CopyBtn text={result.keywords?.join(', ')} />
            </div>
            <div className="tm-keyword-cloud">
              {result.keywords?.map((k, i) => <span key={i} className="tm-keyword-tag">{k}</span>)}
            </div>
          </div>
          <div className="tm-result-section">
            <div className="tm-result-header"><span className="tm-result-label">Submit to</span></div>
            <div className="tm-platform-row">
              {result.platforms?.map((p, i) => <span key={i} className="tm-platform-pill">{p}</span>)}
            </div>
            <hr className="tm-divider" />
            <div className="tm-result-text" style={{ fontSize: 12, color: '#4a6657' }}>
              {result.category}{result.editorialNote ? ' · ' + result.editorialNote : ''}
            </div>
          </div>
          {ap && (
            <>
              <button className="tm-download-btn" onClick={() => triggerDownload(ap, result, setDlErr)}>
                <span>↓ DOWNLOAD TAGGED PHOTO</span>
                <span className="tm-dl-filename">{ap.name}</span>
              </button>
              {dlErr && <div className="tm-dl-error">{dlErr}</div>}
            </>
          )}
        </>
      )}

      {result?.error && (
        <div className="tm-result-section" style={{ color: '#e87a50' }}>{result.error}</div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminImageRecognition() {
  const { user }                          = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const navigate                          = useNavigate();

  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  if (isCheckingPermission) return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
        <p>Checking permissions…</p>
      </div>
    </div>
  );

  if (!isAdmin || !isTraveltellyAdmin) return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-6">Admin only.</p>
            <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0f0d' }}>
      <style>{tellyStyles}</style>
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/admin')}
          className="mb-4 text-[#4a6657] hover:text-[#00e5a0] hover:bg-[#111916]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
        </Button>
        <TellyTagger />
      </div>
    </div>
  );
}
