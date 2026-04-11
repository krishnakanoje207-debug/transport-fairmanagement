import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function LocationAutocomplete({ value, onChange, placeholder, icon = '📍' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handleClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/places/autocomplete?q=${encodeURIComponent(q)}&limit=6`);
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([]); }
    setLoading(false);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShow(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const select = (s) => {
    setQuery(s.name);
    setShow(false);
    onChange({ name: s.name, lat: s.lat, lng: s.lng });
  };

  return (
    <div className="autocomplete-wrap" ref={wrapRef}>
      <div className="input-icon-wrapper">
        <span className="input-icon">{icon}</span>
        <input className="input-field" value={query} onChange={handleInput}
          onFocus={() => { if (suggestions.length) setShow(true); }}
          placeholder={placeholder || 'Search location...'} autoComplete="off" />
      </div>
      {show && suggestions.length > 0 && (
        <div className="autocomplete-list">
          {loading && <div style={{ padding: 12, textAlign: 'center' }}><span className="spinner" /></div>}
          {suggestions.map((s, i) => (
            <div key={i} className="autocomplete-item" onClick={() => select(s)}>
              <span style={{ opacity: .5 }}>📍</span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
