import React, { useEffect, useRef, useState } from "react";

/** Minimal JSONP helper */
function jsonp<T>(baseUrl: string, params: Record<string, string | number>, timeoutMs = 6000): Promise<T> {
  return new Promise((resolve, reject) => {
    const cbName = `__jsonp_cb_${Math.random().toString(36).slice(2)}`;
    (window as any)[cbName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), callback: cbName });
    const script = document.createElement("script");
    script.src = `${baseUrl}?${qs.toString()}`;
    script.async = true;

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("JSONP timeout"));
    }, timeoutMs);

    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP network error"));
    };

    function cleanup() {
      try { delete (window as any)[cbName]; } catch {}
      window.clearTimeout(timer);
      script.remove();
    }

    document.body.appendChild(script);
  });
}

type Suggestion = { id: string; title: string };

type Props = {
  /** Language code, e.g. "en", "es". */
  hl?: string;
  /** Country/region code, e.g. "us", "gb". */
  gl?: string;
  /**
   * Vertical selector:
   *  - omit/ds="" for Web
   *  - "yt" for YouTube, "news" for News, "books" for Books, etc.
   */
  ds?: string;
  placeholder?: string;
  minChars?: number;
  limit?: number;
  onSelect?: (s: Suggestion) => void;
};

/**
 * Google Suggest via JSONP.
 * Uses: https://suggestqueries.google.com/complete/search
 * Typical return for client=chrome/firefox: ["query", ["s1","s2",...], ...]
 */
export const SearchBar: React.FC<Props> = ({
  hl = "en",
  gl = "us",
  ds = "",              // empty => web
  placeholder = "Search…",
  minChars = 1,
  limit = 8,
  onSelect,
}) => {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    const q = value.trim();
    setErrorText(null);

    if (q.length < minChars) {
      setItems([]); setOpen(false); setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Primary endpoint; JSONP callback provided via "callback"
        const endpoint = "https://suggestqueries.google.com/complete/search";

        // client=chrome/firefox both work. You can also pass 'client=youtube' when ds=yt,
        // but using 'client=chrome' + ds works broadly.
        const params: Record<string, string | number> = {
          client: "chrome",
          q,
          hl,
          gl,
        };
        if (ds) params["ds"] = ds;

        type GoogleSuggest = [string, string[]] | any;

        const data = await jsonp<GoogleSuggest>(endpoint, params);
        // Parse common shape: [query, [suggestions...]]
        let suggestions: string[] = [];
        if (Array.isArray(data) && Array.isArray(data[1])) {
          suggestions = data[1] as string[];
        } else {
          // Some variants return objects; try a few fallbacks
          if (data?.suggestions && Array.isArray(data.suggestions)) {
            suggestions = data.suggestions.map((s: any) => (typeof s === "string" ? s : s?.phrase)).filter(Boolean);
          }
        }

        const sliced = suggestions.slice(0, Math.max(1, Math.min(15, limit)));
        const mapped: Suggestion[] = sliced.map((s, i) => ({ id: `${s}-${i}`, title: s }));
        setItems(mapped);
        setHighlight(mapped.length ? 0 : -1);
        setErrorText(mapped.length ? null : "No results");
      } catch (err: any) {
        console.error("suggest error:", err);
        setItems([]);
        setHighlight(-1);
        setErrorText(err?.message || "Couldn’t fetch suggestions");
      } finally {
        setLoading(false);
        setOpen(true);
      }
    }, 180); // debounce
  }, [value, hl, gl, ds, limit, minChars]);

  const handleSelect = (idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    const s = items[idx];
    setValue(s.title);
    setOpen(false);
    onSelect?.(s);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, Math.max(items.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { if (open && items.length > 0) { e.preventDefault(); handleSelect(highlight >= 0 ? highlight : 0); } }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div style={{ position: "relative", maxWidth: 480 }}>
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setHighlight(-1); }}
        onFocus={() => { if (items.length || loading || errorText) setOpen(true); }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="autosuggest-list"
        style={{
          width: "100%", padding: "10px 12px",
          border: "1px solid #ccc", borderRadius: 8,
          outline: "none", fontSize: 14
        }}
      />
      {open && (
        <ul
          id="autosuggest-list"
          role="listbox"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6,
            background: "#fff", border: "1px solid #ddd", borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)", listStyle: "none",
            padding: 6, maxHeight: 260, overflowY: "auto", zIndex: 1000
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading && <li style={{ padding: "8px 10px", color: "#666" }}>Loading…</li>}
          {!loading && errorText && <li style={{ padding: "8px 10px", color: "#a00" }}>{errorText}</li>}
          {!loading && !errorText && items.map((it, i) => (
            <li
              key={it.id}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => handleSelect(i)}
              style={{
                padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                background: i === highlight ? "#f2f4f7" : "transparent"
              }}
              title={it.title}
            >
              {it.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
