import { useState, useRef, useCallback } from 'react';

const DELIMITERS = [
  '## STARTUP NAME',
  '## TAGLINE',
  '## MVP SPEC',
  '## BUSINESS MODEL',
  '## WHY IT\'LL FAIL (THE ROAST)',
];

const SECTION_KEYS = ['name', 'tagline', 'mvpSpec', 'businessModel', 'roast'];

function parseSections(buffer) {
  const sections = { name: '', tagline: '', mvpSpec: '', businessModel: '', roast: '' };

  for (let i = DELIMITERS.length - 1; i >= 0; i--) {
    const idx = buffer.indexOf(DELIMITERS[i]);
    if (idx !== -1) {
      sections[SECTION_KEYS[i]] = buffer.slice(idx + DELIMITERS[i].length).trim();
      buffer = buffer.slice(0, idx);
    }
  }

  return sections;
}

export function usePitchStream() {
  const [sections, setSections] = useState({
    name: '',
    tagline: '',
    mvpSpec: '',
    businessModel: '',
    roast: '',
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const startStream = useCallback(async (audience, problem, tech) => {
    setError(null);
    setSections({ name: '', tagline: '', mvpSpec: '', businessModel: '', roast: '' });
    setIsStreaming(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, problem, tech }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let detail = `Server error (${res.status})`;
        try {
          const json = await res.json();
          if (json.detail) detail = json.detail;
        } catch {}
        setError(detail);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        setSections(parseSections(buffer));
      }

      // Final decode flush
      buffer += decoder.decode();
      const final = parseSections(buffer);
      setSections(final);

      if (!final.name && !final.tagline && !final.roast) {
        setError('Something went wrong. The model returned an empty response.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError("Ollama isn't running or mistral:7b-instruct isn't loaded. Fire up Ollama and try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setSections({ name: '', tagline: '', mvpSpec: '', businessModel: '', roast: '' });
    setIsStreaming(false);
    setError(null);
  }, []);

  return { sections, isStreaming, error, startStream, reset };
}
