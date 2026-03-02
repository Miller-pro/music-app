import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FIELD_TOOLTIPS,
  HIGHLIGHT_CATEGORIES,
  KEY_FIELD_PATHS,
  hasKeyFieldDescendant,
  getActiveSection,
  SECTION_LABELS,
} from './bidRequestData';

// ── Color utils ─────────────────────────────────────────────

const HIGHLIGHT_COLORS = {
  yellow: { bg: 'bg-yellow-500/10', border: 'border-l-yellow-400', text: 'text-yellow-300' },
  blue: { bg: 'bg-[#FFB4A2]/10', border: 'border-l-[#FFB4A2]', text: 'text-[#FFB4A2]' },
  green: { bg: 'bg-emerald-500/10', border: 'border-l-emerald-400', text: 'text-emerald-300' },
  purple: { bg: 'bg-orange-500/10', border: 'border-l-orange-400', text: 'text-orange-300' },
  changed: { bg: 'bg-amber-500/15', border: 'border-l-amber-400', text: 'text-amber-300' },
};

const HIGHLIGHT_LEGEND = [
  { color: 'bg-yellow-400', label: 'Bid Floor' },
  { color: 'bg-[#FFB4A2]', label: 'Geo/Location' },
  { color: 'bg-emerald-400', label: 'Ad ID/Privacy' },
  { color: 'bg-orange-400', label: 'Audio/Banner Specs' },
];

// ── Tooltip component ───────────────────────────────────────

function FieldTooltip({ path, text }) {
  return (
    <div className="absolute left-4 bottom-full mb-1 z-50 pointer-events-none">
      <div className="bg-gray-800 border border-white/15 rounded-lg px-3 py-2 shadow-xl max-w-xs">
        <div className="text-[9px] text-primary-400 font-bold uppercase tracking-wider mb-0.5 font-mono">{path}</div>
        <div className="text-[11px] text-gray-300 leading-relaxed">{text}</div>
      </div>
      <div className="w-2 h-2 bg-gray-800 border-b border-r border-white/15 rotate-45 ml-6 -mt-1" />
    </div>
  );
}

// ── Inline primitive value rendering ────────────────────────

function JsonPrimitive({ value }) {
  if (value === null) return <span className="text-gray-500 italic">null</span>;
  if (typeof value === 'boolean') return <span className="text-amber-400">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-amber-400">{value}</span>;
  if (typeof value === 'string') return <span className="text-green-400">&quot;{value}&quot;</span>;
  return <span className="text-gray-400">{String(value)}</span>;
}

// ── Check if array should render inline ─────────────────────

function shouldInlineArray(arr) {
  if (arr.length > 6) return false;
  if (arr.length === 0) return true;
  return arr.every(v => v === null || typeof v !== 'object');
}

// ── Recursive JSON tree renderer ────────────────────────────

function JsonNode({
  data,
  path = '',
  depth = 0,
  isLast = true,
  keyName = null,
  keyFieldsOnly = false,
  collapsedPaths,
  onToggle,
  changedFields,
  activeSection,
}) {
  const fullPath = keyName ? (path ? `${path}.${keyName}` : keyName) : path;
  const tooltipText = FIELD_TOOLTIPS[fullPath];
  const highlightCat = HIGHLIGHT_CATEGORIES[fullPath];
  const isChanged = changedFields?.has(fullPath);
  const isActiveSection = activeSection && keyName === activeSection && depth === 1;
  const isCollapsed = collapsedPaths.has(fullPath);

  // Key fields filter
  if (keyFieldsOnly && fullPath && !hasKeyFieldDescendant(fullPath) && !KEY_FIELD_PATHS.has(fullPath)) {
    return null;
  }

  const comma = isLast ? '' : ',';
  const highlight = isChanged ? HIGHLIGHT_COLORS.changed : highlightCat ? HIGHLIGHT_COLORS[highlightCat] : null;

  // Null / Boolean / Number / String
  if (data === null || typeof data !== 'object') {
    return (
      <div
        className={`bid-json-line group/tip relative flex hover:bg-white/[0.04] transition-colors ${
          highlight ? `${highlight.bg} border-l-2 ${highlight.border}` : 'border-l-2 border-transparent'
        } ${isChanged ? 'animate-pulse' : ''}`}
      >
        <span className="bid-line-num" />
        <span className="flex-1 font-mono text-[11px] leading-5 py-px" style={{ paddingLeft: depth * 16 }}>
          {keyName != null && (
            <>
              <span className="text-orange-300">&quot;{keyName}&quot;</span>
              <span className="text-gray-500">: </span>
            </>
          )}
          <JsonPrimitive value={data} />
          <span className="text-gray-500">{comma}</span>
        </span>
        {tooltipText && (
          <span className="text-gray-600 text-[10px] ml-1 mr-2 opacity-0 group-hover/tip:opacity-100 transition-opacity cursor-help shrink-0 self-center">
            ?
          </span>
        )}
        {tooltipText && (
          <div className="hidden group-hover/tip:block">
            <FieldTooltip path={fullPath} text={tooltipText} />
          </div>
        )}
      </div>
    );
  }

  const isArray = Array.isArray(data);

  // Inline arrays (short primitive arrays)
  if (isArray && shouldInlineArray(data)) {
    return (
      <div
        className={`bid-json-line group/tip relative flex hover:bg-white/[0.04] transition-colors ${
          highlight ? `${highlight.bg} border-l-2 ${highlight.border}` : 'border-l-2 border-transparent'
        }`}
      >
        <span className="bid-line-num" />
        <span className="flex-1 font-mono text-[11px] leading-5 py-px" style={{ paddingLeft: depth * 16 }}>
          {keyName != null && (
            <>
              <span className="text-orange-300">&quot;{keyName}&quot;</span>
              <span className="text-gray-500">: </span>
            </>
          )}
          <span className="text-gray-400">[</span>
          {data.map((v, i) => (
            <span key={i}>
              <JsonPrimitive value={v} />
              {i < data.length - 1 && <span className="text-gray-500">, </span>}
            </span>
          ))}
          <span className="text-gray-400">]</span>
          <span className="text-gray-500">{comma}</span>
        </span>
        {tooltipText && (
          <span className="text-gray-600 text-[10px] ml-1 mr-2 opacity-0 group-hover/tip:opacity-100 transition-opacity cursor-help shrink-0 self-center">
            ?
          </span>
        )}
        {tooltipText && (
          <div className="hidden group-hover/tip:block">
            <FieldTooltip path={fullPath} text={tooltipText} />
          </div>
        )}
      </div>
    );
  }

  // Object or expanded array
  const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
  const openBrace = isArray ? '[' : '{';
  const closeBrace = isArray ? ']' : '}';
  const childCount = entries.length;

  // Filter entries for key fields mode
  const filteredEntries = keyFieldsOnly
    ? entries.filter(([key]) => {
        const childPath = isArray ? fullPath : (fullPath ? `${fullPath}.${key}` : key);
        return KEY_FIELD_PATHS.has(childPath) || hasKeyFieldDescendant(childPath);
      })
    : entries;

  return (
    <>
      {/* Opening line: "key": { or [ */}
      <div
        className={`bid-json-line group/tip relative flex hover:bg-white/[0.04] transition-colors ${
          highlight ? `${highlight.bg} border-l-2 ${highlight.border}` : 'border-l-2 border-transparent'
        } ${isActiveSection ? 'ring-1 ring-primary-500/40 bg-primary-500/5 rounded-sm' : ''}`}
      >
        <span className="bid-line-num" />
        <span className="flex-1 font-mono text-[11px] leading-5 py-px" style={{ paddingLeft: depth * 16 }}>
          {keyName != null && (
            <>
              <span className="text-orange-300">&quot;{keyName}&quot;</span>
              <span className="text-gray-500">: </span>
            </>
          )}
          <span className="text-gray-400">{openBrace}</span>
          {isCollapsed && (
            <>
              <span className="text-gray-600 text-[10px] mx-1">{childCount} {isArray ? 'items' : 'fields'}</span>
              <span className="text-gray-400">{closeBrace}</span>
              <span className="text-gray-500">{comma}</span>
            </>
          )}
        </span>
        {/* Collapse/expand toggle */}
        <button
          onClick={() => onToggle(fullPath)}
          className="text-gray-600 hover:text-gray-300 text-[10px] px-1.5 shrink-0 self-center transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '+' : '-'}
        </button>
        {tooltipText && (
          <span className="text-gray-600 text-[10px] mr-2 opacity-0 group-hover/tip:opacity-100 transition-opacity cursor-help shrink-0 self-center">
            ?
          </span>
        )}
        {tooltipText && (
          <div className="hidden group-hover/tip:block">
            <FieldTooltip path={fullPath} text={tooltipText} />
          </div>
        )}
      </div>

      {/* Children (if not collapsed) */}
      {!isCollapsed && filteredEntries.map(([key, value], i) => (
        <JsonNode
          key={isArray ? i : key}
          data={value}
          path={isArray ? fullPath : fullPath}
          depth={depth + 1}
          isLast={i === filteredEntries.length - 1}
          keyName={isArray ? null : key}
          keyFieldsOnly={keyFieldsOnly}
          collapsedPaths={collapsedPaths}
          onToggle={onToggle}
          changedFields={changedFields}
          activeSection={activeSection}
        />
      ))}

      {/* Closing brace */}
      {!isCollapsed && (
        <div className="bid-json-line flex border-l-2 border-transparent">
          <span className="bid-line-num" />
          <span className="flex-1 font-mono text-[11px] leading-5 py-px" style={{ paddingLeft: depth * 16 }}>
            <span className="text-gray-400">{closeBrace}</span>
            <span className="text-gray-500">{comma}</span>
          </span>
        </div>
      )}

      {/* Active section label */}
      {isActiveSection && !isCollapsed && (
        <div className="bid-json-line flex border-l-2 border-primary-500/50">
          <span className="bid-line-num" />
          <span className="text-[10px] text-primary-400 font-medium py-px animate-pulse" style={{ paddingLeft: depth * 16 }}>
            ^ {SECTION_LABELS[activeSection]}
          </span>
        </div>
      )}
    </>
  );
}

// ── Privacy badges ──────────────────────────────────────────

function PrivacyBadges({ bidRequest }) {
  const regs = bidRequest.regs || {};
  const gdpr = regs.gdpr === 1;
  const ccpa = !!regs.ext?.us_privacy;
  const coppa = regs.coppa === 1;
  const gpp = !!regs.ext?.gpp;

  return (
    <div className="flex flex-wrap gap-1.5">
      {gdpr && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFB4A2]/15 border border-[#FFB4A2]/25 text-[10px] font-bold text-[#FFB4A2]">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          GDPR
        </span>
      )}
      {ccpa && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          CCPA
        </span>
      )}
      {gpp && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/25 text-[10px] font-bold text-orange-400">
          GPP
        </span>
      )}
      {coppa && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400">
          COPPA
        </span>
      )}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/15 border border-green-500/25 text-[10px] font-bold text-green-400">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        Privacy Compliant
      </span>
    </div>
  );
}

// ── Request details summary ─────────────────────────────────

function RequestDetails({ bidRequest }) {
  const imp = bidRequest.imp?.[0] || {};
  const sizeBytes = new Blob([JSON.stringify(bidRequest)]).size;
  const sizeKB = (sizeBytes / 1024).toFixed(1);

  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-[10px]">
      <div>
        <span className="text-gray-500 block">Request ID</span>
        <span className="text-gray-300 font-mono truncate block">{bidRequest.id?.slice(0, 16)}...</span>
      </div>
      <div>
        <span className="text-gray-500 block">Bid Floor</span>
        <span className="text-yellow-400 font-bold">${imp.bidfloor?.toFixed(2)} {imp.bidfloorcur}</span>
      </div>
      <div>
        <span className="text-gray-500 block">Timeout</span>
        <span className="text-gray-300">{bidRequest.tmax}ms</span>
      </div>
      <div>
        <span className="text-gray-500 block">Auction</span>
        <span className="text-gray-300">{bidRequest.at === 1 ? '1st Price' : '2nd Price'}</span>
      </div>
      <div>
        <span className="text-gray-500 block">Currency</span>
        <span className="text-gray-300">{bidRequest.cur?.join(', ')}</span>
      </div>
      <div>
        <span className="text-gray-500 block">Size</span>
        <span className="text-gray-300">{sizeKB} KB</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPING ANIMATION — tokenizer + viewer
// ─────────────────────────────────────────────────────────────

function tokenizeLine(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    // Whitespace
    if (/\s/.test(text[i])) {
      let ws = '';
      while (i < text.length && /\s/.test(text[i])) ws += text[i++];
      tokens.push({ t: 'ws', s: ws });
      continue;
    }
    // String (key or value)
    if (text[i] === '"') {
      let str = '"';
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\') { str += text[i]; i++; }
        if (i < text.length) { str += text[i]; i++; }
      }
      if (i < text.length) { str += '"'; i++; }
      // Peek ahead: is next non-space char a colon? → key
      let j = i;
      while (j < text.length && text[j] === ' ') j++;
      tokens.push({ t: text[j] === ':' ? 'key' : 'str', s: str });
      continue;
    }
    // Number
    if (/[-\d]/.test(text[i]) && (tokens.length === 0 || tokens[tokens.length - 1].t !== 'key')) {
      let num = '';
      while (i < text.length && /[-\d.eE+]/.test(text[i])) num += text[i++];
      tokens.push({ t: 'num', s: num });
      continue;
    }
    // true / false / null
    if (text.slice(i, i + 4) === 'true')  { tokens.push({ t: 'bool', s: 'true'  }); i += 4; continue; }
    if (text.slice(i, i + 5) === 'false') { tokens.push({ t: 'bool', s: 'false' }); i += 5; continue; }
    if (text.slice(i, i + 4) === 'null')  { tokens.push({ t: 'null', s: 'null'  }); i += 4; continue; }
    // Punctuation / other
    tokens.push({ t: 'punct', s: text[i++] });
  }
  return tokens;
}

const TOKEN_CLASS = {
  key:   'text-orange-300',
  str:   'text-green-400',
  num:   'text-amber-400',
  bool:  'text-amber-400',
  null:  'text-gray-500',
  punct: 'text-gray-400',
  ws:    '',
};

function HighlightedLine({ text }) {
  const tokens = useMemo(() => tokenizeLine(text), [text]);
  return (
    <>
      {tokens.map((tok, idx) => (
        <span key={idx} className={TOKEN_CLASS[tok.t] || 'text-gray-300'}>{tok.s}</span>
      ))}
    </>
  );
}

// Cache highlighted complete lines so we don't re-tokenize on every frame
const lineCache = new Map();
function CachedHighlightedLine({ lineKey, text }) {
  if (!lineCache.has(lineKey)) {
    lineCache.set(lineKey, tokenizeLine(text));
  }
  const tokens = lineCache.get(lineKey);
  return (
    <>
      {tokens.map((tok, idx) => (
        <span key={idx} className={TOKEN_CLASS[tok.t] || 'text-gray-300'}>{tok.s}</span>
      ))}
    </>
  );
}

function TypingViewer({ bidRequest, progress }) {
  const scrollRef = useRef(null);

  const { fullJson, allLines, totalChars } = useMemo(() => {
    const json = JSON.stringify(bidRequest, null, 2);
    // Clear cache when bidRequest changes
    lineCache.clear();
    return { fullJson: json, allLines: json.split('\n'), totalChars: json.length };
  }, [bidRequest]);

  const revealedChars = Math.min(Math.floor(progress * totalChars), totalChars);
  const isFinished = revealedChars >= totalChars;

  // Determine visible lines
  const visibleLines = [];
  let accum = 0;
  let partialLineIdx = -1;
  let partialText = '';
  for (let i = 0; i < allLines.length; i++) {
    const lineLen = allLines[i].length + 1; // +1 for \n
    if (accum >= revealedChars) break;
    if (accum + lineLen <= revealedChars) {
      visibleLines.push({ lineNum: i + 1, text: allLines[i], complete: true });
      accum += lineLen;
    } else {
      const charsLeft = revealedChars - accum;
      partialLineIdx = i;
      partialText = allLines[i].slice(0, charsLeft);
      visibleLines.push({ lineNum: i + 1, text: partialText, complete: false });
      break;
    }
  }

  // Auto-scroll to keep the typing cursor in view
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines.length]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-h-0 py-2 bg-[#1A1A2E] font-mono text-[11px] leading-5">
      {/* Terminal header bar */}
      <div className="flex items-center gap-1.5 px-3 pb-2 border-b border-white/[0.06] mb-1 sticky top-0 bg-[#1A1A2E] z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[10px] text-gray-600 font-mono">bid_request.json</span>
        {!isFinished && (
          <span className="ml-auto text-[10px] text-primary-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            generating...
          </span>
        )}
        {isFinished && (
          <span className="ml-auto text-[10px] text-green-400 font-medium">✓ complete</span>
        )}
      </div>

      {/* Lines */}
      {visibleLines.map(({ lineNum, text, complete }) => (
        <div key={lineNum} className="flex hover:bg-white/[0.025] group/line">
          <span className="text-gray-700 select-none text-right pr-3 w-8 shrink-0 leading-5 text-[10px]">
            {lineNum}
          </span>
          <span className="flex-1 leading-5 whitespace-pre">
            {complete
              ? <CachedHighlightedLine lineKey={`${lineNum}:${text}`} text={text} />
              : <HighlightedLine text={text} />
            }
            {!complete && <span className="typing-cursor" />}
          </span>
        </div>
      ))}

      {/* Show cursor on empty start */}
      {visibleLines.length === 0 && (
        <div className="flex">
          <span className="text-gray-700 select-none text-right pr-3 w-8 shrink-0 leading-5 text-[10px]">1</span>
          <span className="typing-cursor" />
        </div>
      )}

      {/* Bottom padding so cursor isn't clipped */}
      <div className="h-4" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function BidRequestViewer({
  bidRequest,
  isPlaying = false,
  progress = 0,
  changedFields = null,
  formatLabel = 'Audio',
}) {
  const [keyFieldsOnly, setKeyFieldsOnly] = useState(false);
  const [collapsedPaths, setCollapsedPaths] = useState(() => new Set());
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Typing mode: active while playing or mid-playback (paused)
  const isTypingMode = isPlaying || (progress > 0 && progress < 1);

  const activeSection = useMemo(
    () => getActiveSection(progress, isPlaying),
    [isPlaying, progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3]
  );

  const toggleCollapse = useCallback((path) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(bidRequest, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [bidRequest]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(bidRequest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrtb-${formatLabel.toLowerCase().replace(/\s+/g, '-')}-bid-request.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bidRequest, formatLabel]);

  const collapseAll = useCallback(() => {
    const paths = new Set();
    function walk(obj, prefix = '') {
      if (typeof obj !== 'object' || obj === null) return;
      if (Array.isArray(obj)) {
        if (!shouldInlineArray(obj)) paths.add(prefix);
        obj.forEach((v, i) => walk(v, prefix));
      } else {
        if (prefix) paths.add(prefix);
        for (const [k, v] of Object.entries(obj)) {
          walk(v, prefix ? `${prefix}.${k}` : k);
        }
      }
    }
    walk(bidRequest);
    setCollapsedPaths(paths);
  }, [bidRequest]);

  const expandAll = useCallback(() => {
    setCollapsedPaths(new Set());
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1A1A2E] text-gray-300">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.08] bg-[#16213E] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-200">OpenRTB 2.5</span>
              <span className="text-[10px] text-gray-500 ml-1.5">Bid Request</span>
            </div>
          </div>
          {isTypingMode ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-500/15 border border-primary-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-[10px] text-primary-300 font-bold uppercase tracking-wider">Generating Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setKeyFieldsOnly(false)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  !keyFieldsOnly ? 'bg-primary-500/20 text-primary-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Full
              </button>
              <button
                onClick={() => setKeyFieldsOnly(true)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  keyFieldsOnly ? 'bg-primary-500/20 text-primary-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Key Fields
              </button>
            </div>
          )}
        </div>

        {/* Privacy badges */}
        <PrivacyBadges bidRequest={bidRequest} />
      </div>

      {/* Request details (collapsible) */}
      <div className="border-b border-white/[0.06] shrink-0">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:bg-white/[0.03] transition-colors"
        >
          <span>Request Details</span>
          <svg className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-2.5">
                <RequestDetails bidRequest={bidRequest} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active section indicator */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-3 py-1.5 bg-primary-500/10 border-b border-primary-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-[10px] text-primary-300 font-medium">{SECTION_LABELS[activeSection]}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color legend — hidden during typing (terminal has its own header) */}
      {!isTypingMode && (
        <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-3 shrink-0 flex-wrap">
          {HIGHLIGHT_LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${color}`} />
              <span className="text-[9px] text-gray-500">{label}</span>
            </div>
          ))}
          {changedFields && changedFields.size > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-amber-400" />
              <span className="text-[9px] text-amber-500">Changed</span>
            </div>
          )}
        </div>
      )}

      {/* Collapse/Expand controls — hidden during typing mode */}
      {!isTypingMode && (
        <div className="px-3 py-1 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
          <button onClick={expandAll} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            Expand All
          </button>
          <span className="text-gray-700">|</span>
          <button onClick={collapseAll} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            Collapse All
          </button>
        </div>
      )}

      {/* Typing animation while playing, tree viewer otherwise */}
      {isTypingMode ? (
        <TypingViewer bidRequest={bidRequest} progress={progress} />
      ) : (
        <div className="flex-1 overflow-auto bid-json-viewer min-h-0 py-1">
          <JsonNode
            data={bidRequest}
            depth={0}
            keyFieldsOnly={keyFieldsOnly}
            collapsedPaths={collapsedPaths}
            onToggle={toggleCollapse}
            changedFields={changedFields}
            activeSection={activeSection}
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/[0.08] bg-[#16213E] flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/[0.06]'
          }`}
        >
          {copied ? (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ) : (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-400 border border-white/[0.06] transition-all"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Download
        </button>
        <span className="ml-auto text-[10px] text-gray-600 font-mono">
          {(new Blob([JSON.stringify(bidRequest)]).size / 1024).toFixed(1)} KB
        </span>
      </div>
    </div>
  );
}
