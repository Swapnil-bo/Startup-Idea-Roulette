import { useState, useRef, useEffect, useCallback } from 'react';

export function useSpinWheel() {
  const [audiences, setAudiences] = useState([]);
  const [problems, setProblems] = useState([]);
  const [techs, setTechs] = useState([]);

  const [selected, setSelected] = useState({ audience: null, problem: null, tech: null });
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const timersRef = useRef([]);

  useEffect(() => {
    fetch('/api/constraints')
      .then((res) => res.json())
      .then((data) => {
        setAudiences(data.audiences);
        setProblems(data.problems);
        setTechs(data.techs);
      });
  }, []);

  const spin = useCallback(() => {
    if (audiences.length === 0 || problems.length === 0 || techs.length === 0) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setIsSpinning(true);
    setHasSpun(false);
    setSelected({ audience: null, problem: null, tech: null });

    const picks = {
      audience: audiences[Math.floor(Math.random() * audiences.length)],
      problem: problems[Math.floor(Math.random() * problems.length)],
      tech: techs[Math.floor(Math.random() * techs.length)],
    };

    const randomDuration = () => 1200 + Math.random() * 600;

    let settled = 0;
    const onSettle = () => {
      settled += 1;
      if (settled === 3) {
        setIsSpinning(false);
        setHasSpun(true);
      }
    };

    const audienceTimer = setTimeout(() => {
      setSelected((prev) => ({ ...prev, audience: picks.audience }));
      onSettle();
    }, randomDuration());

    const problemTimer = setTimeout(() => {
      setSelected((prev) => ({ ...prev, problem: picks.problem }));
      onSettle();
    }, randomDuration());

    const techTimer = setTimeout(() => {
      setSelected((prev) => ({ ...prev, tech: picks.tech }));
      onSettle();
    }, randomDuration());

    timersRef.current = [audienceTimer, problemTimer, techTimer];
  }, [audiences, problems, techs]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSelected({ audience: null, problem: null, tech: null });
    setIsSpinning(false);
    setHasSpun(false);
  }, []);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return { audiences, problems, techs, selected, isSpinning, hasSpun, spin, reset };
}
