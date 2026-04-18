/* Investment School Arabic Wordmark — recreated from brand guidelines
   Uses Arabic type with signature circular dots & tiny "7" (٧) below
   This is a stylized representation using IBM Plex Arabic + geometric shapes */

window.Logo = function Logo({ color = 'currentColor', accent, size = 120, tagline = false, style = {} }) {
  accent = accent || color;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, ...style }}>
      <svg viewBox="0 0 240 160" width={size} height={size * 160/240} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        {/* top line: مَدرَسة */}
        <g fill={color}>
          {/* stylized Arabic: we replicate the geometric abstraction from the brand */}
          <text x="120" y="70" textAnchor="middle"
                fontFamily="IBM Plex Sans Arabic, sans-serif"
                fontWeight="700" fontSize="56" direction="rtl">مَدرَسة</text>
          {/* bottom line: الاستثمار */}
          <text x="120" y="130" textAnchor="middle"
                fontFamily="IBM Plex Sans Arabic, sans-serif"
                fontWeight="700" fontSize="52" direction="rtl">الاستثمار</text>
        </g>
        {/* signature dots */}
        <circle cx="64" cy="38" r="7" fill={accent}/>
        <circle cx="170" cy="98" r="8" fill={accent}/>
        <circle cx="198" cy="40" r="5" fill={color}/>
        {/* tiny ٧ mark */}
        <text x="30" y="112" fontFamily="IBM Plex Sans Arabic, sans-serif" fontWeight="700" fontSize="22" fill={color}>٧</text>
      </svg>
      {tagline && (
        <div className="ar" style={{ fontSize: 12, color: accent, fontWeight: 600, letterSpacing: 0.3 }}>
          مُقدم من <span style={{ fontFamily: 'Mont, sans-serif', fontWeight: 900 }}>TRENDZ</span>
        </div>
      )}
    </div>
  );
};

/* Simplified monogram (iconmark) for tight spaces - chart-like bars */
window.LogoMark = function LogoMark({ color = 'currentColor', size = 48 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <rect x="6"  y="24" width="6" height="18" fill={color}/>
      <rect x="15" y="18" width="6" height="24" fill={color}/>
      <rect x="24" y="10" width="6" height="32" fill={color}/>
      <rect x="33" y="4"  width="6" height="38" fill={color}/>
      <circle cx="9"  cy="20" r="3" fill={color}/>
      <circle cx="36" cy="44" r="3" fill={color}/>
    </svg>
  );
};

/* Trendz wordmark */
window.TrendzMark = function TrendzMark({ color = 'currentColor', size = 16 }) {
  return (
    <span style={{
      fontFamily: 'Mont, sans-serif',
      fontWeight: 900,
      fontSize: size,
      letterSpacing: '-0.02em',
      color,
      fontStyle: 'italic',
      textTransform: 'uppercase'
    }}>TRENDZ</span>
  );
};

/* Background pattern (from brand spec): grid of stylized ش glyphs with accents */
window.BrandPattern = function BrandPattern({ color = '#273773', bg = 'transparent', opacity = 1, scale = 1 }) {
  const tile = 80 * scale;
  const id = 'pat-' + Math.random().toString(36).slice(2,7);
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
      <defs>
        <pattern id={id} x="0" y="0" width={tile} height={tile} patternUnits="userSpaceOnUse">
          {bg !== 'transparent' && <rect width={tile} height={tile} fill={bg}/>}
          {/* ش-like motif */}
          <g fill={color} transform={`translate(${tile*0.18}, ${tile*0.22})`}>
            <rect x="0" y="10" width="4" height="22"/>
            <rect x="10" y="10" width="4" height="22"/>
            <rect x="20" y="10" width="4" height="22"/>
            <rect x="0" y="30" width="24" height="4"/>
            <circle cx="6" cy="4" r="2"/>
            <circle cx="12" cy="4" r="2"/>
            <circle cx="18" cy="4" r="2"/>
          </g>
          {/* slash */}
          <rect x={tile*0.7} y={tile*0.3} width="18" height="4" fill={color} transform={`rotate(-30 ${tile*0.7+9} ${tile*0.3+2})`}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
};

/* Little floating brand shapes used across video/social */
window.BrandShapes = function BrandShapes({ style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <div style={{ position:'absolute', top:'12%', left:'8%', width:24, height:24, borderRadius:'50%', background:'var(--accent)'}}/>
      <div style={{ position:'absolute', top:'22%', right:'14%', width:40, height:8, background:'var(--accent)', transform:'rotate(-25deg)', borderRadius:4}}/>
      <div style={{ position:'absolute', bottom:'18%', left:'20%', width:14, height:14, borderRadius:'50%', background:'var(--accent-2)'}}/>
      <div style={{ position:'absolute', bottom:'30%', right:'8%', width:10, height:10, borderRadius:'50%', background:'#fff'}}/>
      <div style={{ position:'absolute', top:'55%', left:'48%', color:'var(--accent)', fontFamily:'Mont', fontWeight:900, fontSize:28 }}>٧</div>
    </div>
  );
};

Object.assign(window, { Logo: window.Logo, LogoMark: window.LogoMark, TrendzMark: window.TrendzMark, BrandPattern: window.BrandPattern, BrandShapes: window.BrandShapes });
