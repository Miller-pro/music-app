import { useState } from 'react';

const TOKEN_RULES = [
  { type: 'comment', pattern: /^\/\/.*$/ },
  { type: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
  { type: 'comment', pattern: /^#.*$/ },
  { type: 'string', pattern: /^"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /^'(?:[^'\\]|\\.)*'/ },
  { type: 'string', pattern: /^`(?:[^`\\]|\\.)*`/ },
  { type: 'number', pattern: /^\b\d+\.?\d*\b/ },
  { type: 'keyword', pattern: /^\b(import|export|from|const|let|var|function|return|if|else|new|class|extends|async|await|try|catch|throw|switch|case|default|break|continue|for|while|do|of|in|typeof|instanceof|void|null|undefined|true|false|this|super|static|get|set|yield|struct|func|val|var|override|fun|private|public|internal|open|companion|object|data|sealed|suspend|protocol|extension|guard|self|init|deinit|weak|strong|lazy|optional|required|convenience|final|mutating|nonmutating|fileprivate|typealias|associatedtype|where|some|any|enum|interface|implements|abstract|package|annotation)\b/ },
  { type: 'builtin', pattern: /^\b(console|window|document|Math|Promise|Array|Object|String|Number|Boolean|Map|Set|Error|JSON|fetch|setTimeout|setInterval|UIView|UILabel|NSObject|DispatchQueue|URLSession|Bundle|UserDefaults|NotificationCenter|View|Text|Button|HStack|VStack|ZStack|State|Published|ObservableObject|Activity|Context|Intent|Log|Toast|SharedPreferences|CoroutineScope|Dispatchers|launch|withContext|AudioManager|MediaPlayer)\b/ },
  { type: 'function', pattern: /^\b[a-zA-Z_]\w*(?=\s*\()/ },
  { type: 'punctuation', pattern: /^[{}()\[\];,.:?!<>=+\-*/&|^~%@#]/ },
  { type: 'plain', pattern: /^[a-zA-Z_]\w*/ },
  { type: 'space', pattern: /^\s+/ },
];

function tokenizeLine(line) {
  const tokens = [];
  let remaining = line;
  while (remaining.length > 0) {
    let matched = false;
    for (const rule of TOKEN_RULES) {
      const match = remaining.match(rule.pattern);
      if (match) {
        tokens.push({ type: rule.type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

const TOKEN_COLORS = {
  keyword: 'text-orange-400',
  string: 'text-green-400',
  number: 'text-amber-400',
  comment: 'text-gray-500 italic',
  builtin: 'text-amber-400',
  function: 'text-[#FFB4A2]',
  punctuation: 'text-gray-400',
  plain: 'text-gray-200',
  space: '',
};

export default function CodeBlock({ code, language = 'javascript', filename }) {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08]">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[rgba(22,33,62,0.9)] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {filename && (
            <span className="text-xs text-gray-500 ml-2 font-mono">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto bg-[rgba(26,26,46,0.95)] p-4">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-8 text-right mr-4 text-gray-600 text-xs select-none shrink-0 leading-relaxed">
                {i + 1}
              </span>
              <span>
                {tokenizeLine(line).map((token, j) => (
                  <span key={j} className={TOKEN_COLORS[token.type] || ''}>
                    {token.value}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
