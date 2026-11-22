import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, BookOpen, Braces, Check, ChevronDown, CircleHelp, Clock3, Code2, Command, CornerDownLeft, Gauge, GitBranch, LayoutGrid, Lightbulb, List, Menu, MoreHorizontal, PanelLeftClose, Pause, Play, Plus, RotateCcw, Search, Settings2, SkipBack, SkipForward, Sparkles, SquareTerminal, Target, X } from 'lucide-react';
import { buildLinearSearchTrace, codeSamples } from './engine/trace';
import type { TraceState } from './engine/trace';

const groups = [
  { title: 'FOUNDATIONS', items: [{ name: 'Searching', icon: Search, children: ['Linear search', 'Binary search'] }, { name: 'Sorting', icon: Activity, children: ['Bubble sort', 'Selection sort', 'Insertion sort', 'Merge sort', 'Quick sort'] }] },
  { title: 'DATA STRUCTURES', items: [{ name: 'Linked lists', icon: GitBranch, children: ['Singly linked list', 'Doubly linked list', 'Circular linked list'] }, { name: 'Stacks & queues', icon: List, children: ['Stack', 'Queue', 'Circular queue', 'Priority queue'] }, { name: 'Trees', icon: LayoutGrid, children: ['Binary tree', 'Binary search tree', 'AVL tree'] }, { name: 'Graphs', icon: GitBranch, children: ['Graph basics', 'Breadth-first search', 'Depth-first search'] }, { name: 'Hashing', icon: Braces, children: ['Hash table'] }] },
];
const learning = [
  { title: 'What is linear search?', body: 'A simple method that checks each array element from left to right until it finds the key or reaches the end.' },
  { title: 'How it works', body: 'Start at index 0 → compare the current value with the key → return the index on a match → report -1 if the scan ends.' },
  { title: 'Common mistake', body: 'Remember that the first array position is index 0, while it is position 1 for a person reading the list.' },
];

export default function App() {
  const [selected, setSelected] = useState('Linear search');
  const [expanded, setExpanded] = useState('Searching');
  const [language, setLanguage] = useState<'C' | 'C++'>('C++');
  const [arrayInput, setArrayInput] = useState('12, 7, 24, 9, 31, 18');
  const [keyInput, setKeyInput] = useState('24');
  const [activeArray, setActiveArray] = useState([12, 7, 24, 9, 31, 18]);
  const [activeKey, setActiveKey] = useState(24);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<'learn' | 'notes'>('learn');
  const [toast, setToast] = useState('');
  const [inputError, setInputError] = useState('');
  const trace = useMemo(() => buildLinearSearchTrace(activeArray, activeKey), [activeArray, activeKey]);
  const state: TraceState = trace[Math.min(step, trace.length - 1)];
  const lines = codeSamples[language];

  useEffect(() => { if (!playing) return; const timer = window.setTimeout(() => setStep(s => { if (s >= trace.length - 1) { setPlaying(false); return s; } return s + 1; }), 1100 / speed); return () => window.clearTimeout(timer); }, [playing, step, trace.length, speed]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(t); }, [toast]);

  function runSearch() {
    const values = arrayInput.split(',').map(s => s.trim());
    if (!values.length || values.some(v => v === '' || !Number.isFinite(Number(v)))) { setInputError('Enter numbers separated by commas.'); return; }
    const parsedKey = Number(keyInput);
    if (keyInput.trim() === '' || !Number.isFinite(parsedKey)) { setInputError('Enter a valid number to search for.'); return; }
    setInputError(''); setPlaying(false); setActiveArray(values.map(Number)); setActiveKey(parsedKey); setStep(0);
  }
  function reset() { setPlaying(false); setStep(0); setActiveArray([12, 7, 24, 9, 31, 18]); setActiveKey(24); setArrayInput('12, 7, 24, 9, 31, 18'); setKeyInput('24'); setInputError(''); }
  const lineNumber = state.line;

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><span/><span/><span/><span/></div><span className="brand-name">algo<span>lab</span></span><span className="brand-divider"/><span className="brand-product">DSA Visualizer</span></div>
      <div className="topbar-center"><div className="breadcrumb">Learning path <ChevronDown size={13}/><span className="crumb-slash">/</span><b>Data structures & algorithms</b></div></div>
      <div className="topbar-actions"><button className="icon-button help" onClick={() => setToast('Pick an algorithm from the sidebar to explore.') } title="Help"><CircleHelp size={17}/></button><button className="avatar" onClick={() => setToast('Your learning space is ready.')}>A</button></div>
    </header>
    <div className="workspace">
      {sidebarOpen && <aside className="sidebar">
        <div className="sidebar-top"><div className="path-label">YOUR WORKSPACE</div><button className="collapse-button" onClick={() => setSidebarOpen(false)} title="Collapse sidebar"><PanelLeftClose size={16}/></button></div>
        <button className="workspace-card"><div className="workspace-icon"><Braces size={16}/></div><div><strong>DSA Fundamentals</strong><small>Learning path</small></div><ChevronDown size={14} className="workspace-chevron"/></button>
        <div className="sidebar-scroll">{groups.map(group => <section className="nav-group" key={group.title}><div className="group-title">{group.title}</div>{group.items.map(item => <div key={item.name}>
          <button className={`nav-item ${expanded === item.name ? 'nav-expanded' : ''}`} onClick={() => setExpanded(expanded === item.name ? '' : item.name)}><item.icon size={16}/><span>{item.name}</span><ChevronDown size={13} className={`nav-chevron ${expanded === item.name ? 'rotated' : ''}`}/></button>
          {expanded === item.name && <div className="subnav">{item.children.map((child, i) => <button key={child} onClick={() => { setSelected(child); if (child !== 'Linear search') setToast(`${child} is planned for a later build phase.`); }} className={`subnav-item ${selected === child ? 'active' : ''}`}><span className="subnav-marker">{selected === child ? <span className="marker-dot"/> : <span className="marker-hollow"/>}</span>{child}{child !== 'Linear search' && <span className="soon">SOON</span>}</button>)}</div>}
        </div>)}</section>)}</div>
        <div className="sidebar-bottom"><div className="progress-card"><div className="progress-heading"><span>YOUR PROGRESS</span><span>1 / 24</span></div><div className="progress-track"><i/></div><p>Every step counts. Keep going.</p></div><button className="settings-link" onClick={() => setToast('Settings are coming soon.')}><Settings2 size={15}/> Settings <MoreHorizontal size={17}/></button></div>
      </aside>}
      <main className="main-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> SEARCHING <span className="eyebrow-slash">/</span> LINEAR SEARCH</div><h1>Linear search <span className="level-pill">FOUNDATIONS</span></h1><p className="subtitle">Find a value by checking each element, one at a time.</p></div><div className="heading-actions"><button className="share-button" onClick={() => setToast('Shareable link copied to clipboard.')}><ArrowDown size={15}/> Export</button><button className="more-button" onClick={() => setToast('More algorithm options coming soon.')}><MoreHorizontal size={17}/></button></div></div>
        <div className="main-grid">
          <section className="panel code-panel">
            <div className="panel-header code-header"><div className="panel-heading"><div className="panel-icon code-icon"><Code2 size={15}/></div><div><strong>Source code</strong><small>Follow along, line by line</small></div></div><div className="language-toggle"><button onClick={() => setLanguage('C')} className={language === 'C' ? 'selected' : ''}>C</button><button onClick={() => setLanguage('C++')} className={language === 'C++' ? 'selected' : ''}>C++</button></div></div>
            <div className="code-meta"><span className="file-name"><span className="file-dot">●</span> linear_search.{language === 'C' ? 'c' : 'cpp'}</span><span className="code-status"><span/> In sync</span></div>
            <div className="code-scroll"><div className="code-lines">{lines.map((code, i) => {const n = i + 1; const active = n === lineNumber; return <div key={`${language}-${n}`} className={`code-line ${active ? 'current-line' : ''} ${[4,5,6,9].includes(n) ? 'logic-line' : ''}`}><span className="line-no">{String(n).padStart(2, '0')}</span><code>{colorize(code)}</code>{active && <span className="active-caret"/>}</div>;})}</div></div>
            <div className="code-footer"><span><span className="legend-dot current"/>Current line</span><span><span className="legend-dot logic"/>Logic</span><span className="footer-spacer"/><span className="footer-readonly"><Check size={12}/> Read only</span></div>
          </section>
          <section className="panel visual-panel">
            <div className="panel-header visual-header"><div className="panel-heading"><div className="panel-icon visual-icon"><Activity size={15}/></div><div><strong>Visualization</strong><small>Live execution state</small></div></div><button className="visual-menu" onClick={() => setToast('Visualization settings are ready for future modules.')}><MoreHorizontal size={18}/></button></div>
            <div className="visual-body"><div className="visual-status"><span className="live-badge"><span/> LIVE</span><span className="status-operation">{state.operation}</span><span className="state-count">{String(step + 1).padStart(2, '0')} <i>/</i> {String(trace.length).padStart(2, '0')}</span></div>
              <div className="array-stage"><div className="array-caption"><span>ARRAY <b>A</b></span><span className="array-length">N = {activeArray.length}</span></div><div className="array-wrap"><div className="array-indexes">{activeArray.map((_, i) => <span key={i} className={state.index === i ? 'index-current' : ''}>{i}</span>)}</div><div className="array-cells">{activeArray.map((value, i) => <div key={`${i}-${value}`} className={`array-cell ${state.index === i ? 'cell-current' : ''} ${state.checked.includes(i) ? 'cell-checked' : ''} ${state.result === i ? 'cell-found' : ''}`}><span>{value}</span>{state.index === i && <span className="cell-pointer"><i/>i</span>}{state.result === i && <span className="found-check"><Check size={11}/></span>}</div>)}</div><div className="array-target"><span className="target-arrow">↑</span><span className="target-key">key = <b>{activeKey}</b></span></div></div></div>
              <div className="variables"><div className="variables-head"><span>VARIABLES</span><span>Current state</span></div><div className="variable-row">{Object.entries(state.variables).map(([k,v]) => <div className="variable" key={k}><span>{k}</span><b>{v}</b></div>)}</div></div>
              <div className={`operation-note ${state.result !== null && state.result >= 0 ? 'success-note' : ''}`}><div className="note-icon">{state.result !== null && state.result >= 0 ? <Check size={15}/> : <Lightbulb size={15}/>}</div><div><strong>{state.operation}</strong><p>{state.explanation}</p></div></div>
            </div>
            <div className="player"><div className="player-top"><div className="step-label"><Clock3 size={14}/><span>STEP <b>{String(step + 1).padStart(2, '0')}</b> <i>OF</i> {String(trace.length).padStart(2, '0')}</span></div><div className="speed-picker"><Gauge size={14}/><select aria-label="Playback speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option></select><ChevronDown size={12}/></div></div><div className="scrubber" onClick={e => {const r = e.currentTarget.getBoundingClientRect(); setStep(Math.min(trace.length - 1, Math.max(0, Math.round(((e.clientX-r.left)/r.width)*(trace.length-1))))); setPlaying(false);}}><div style={{width: `${trace.length > 1 ? step/(trace.length-1)*100 : 0}%`}}/><i style={{left: `${trace.length > 1 ? step/(trace.length-1)*100 : 0}%`}}/></div><div className="control-buttons"><button className="control-plain" onClick={() => {setStep(0);setPlaying(false);}} title="Restart"><RotateCcw size={15}/></button><button className="control-plain" onClick={() => {setPlaying(false);setStep(s=>Math.max(0,s-1));}} title="Step backward"><SkipBack size={15}/></button><button className="play-button" onClick={() => { if (step === trace.length-1) setStep(0); setPlaying(!playing || step === trace.length-1); }} title={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}<span>{playing ? 'Pause' : 'Run'}</span></button><button className="control-plain" onClick={() => {setPlaying(false);setStep(s=>Math.min(trace.length-1,s+1));}} title="Step forward"><SkipForward size={15}/></button><span className="controls-hint">{playing ? 'Playing execution' : 'Step through manually'}</span></div></div>
          </section>
        </div>
        <div className="lower-grid"><section className="panel input-panel"><div className="lower-heading"><div className="panel-icon input-icon"><Target size={15}/></div><div><strong>Try it yourself</strong><small>Change the input and run the search</small></div><span className="sample-tag">SAMPLE DATA</span></div><div className="input-fields"><label>ARRAY VALUES<div className="input-with-icon"><span>[</span><input value={arrayInput} onChange={e=>setArrayInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runSearch()} aria-label="Array values"/><span>]</span><button title="Use sample array" onClick={()=>{setArrayInput('12, 7, 24, 9, 31, 18');setInputError('');}}><RotateCcw size={13}/></button></div></label><label>SEARCH FOR<div className="key-input"><input value={keyInput} onChange={e=>setKeyInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runSearch()} aria-label="Search key"/><span>⌘ ↵</span></div></label><button className="run-search" onClick={runSearch}><Play size={14} fill="currentColor"/> Run search</button></div>{inputError && <div className="input-error">{inputError}</div>}<div className="input-footnote"><Sparkles size={13}/> Try a value that isn’t in the array to see what happens.</div></section>
          <section className="panel learn-panel"><div className="learn-tabs"><button className={tab==='learn'?'active':''} onClick={()=>setTab('learn')}><BookOpen size={14}/> Learn</button><button className={tab==='notes'?'active':''} onClick={()=>setTab('notes')}><SquareTerminal size={14}/> Exam notes</button><span className="learn-spacer"/><button className="bookmark" onClick={()=>setToast('Saved to your study list.')}><Plus size={15}/> Save</button></div>{tab==='learn' ? <div className="learning-content">{learning.slice(0,2).map((item,i)=><div className="learn-item" key={item.title}><span className="learn-num">0{i+1}</span><div><strong>{item.title}</strong><p>{item.body}</p></div></div>)}<button className="mistake-row" onClick={()=>setToast('Tip: loop while i < n, so the final valid index is n - 1.')}><Lightbulb size={14}/><span>{learning[2].title}</span><ArrowRight size={13}/></button></div> : <div className="exam-note"><strong>Exam ready</strong><p>Compare each element with the key. If a match is found, return its index; otherwise return −1 after the loop.</p><span>Time: O(n) · Space: O(1)</span></div>}</section></div>
        <footer className="page-footer"><span>MADE FOR THE MOMENT IT CLICKS <span className="footer-star">✳</span></span><span>DSA LAB <i>·</i> LEARN BY RUNNING</span></footer>
      </main>
      {!sidebarOpen && <button className="open-sidebar" onClick={()=>setSidebarOpen(true)}><Menu size={17}/></button>}
    </div>
    {toast && <div className="toast"><Check size={15}/>{toast}<button onClick={()=>setToast('')}><X size={14}/></button></div>}
  </div>;
}

function colorize(code: string) {
  if (!code.trim()) return <>&nbsp;</>;
  const escaped = code;
  const parts = escaped.split(/(\b(?:int|return|for|if|include|using|namespace|void)\b|\b(?:printf|cout|endl|main|linearSearch)\b|(?:"[^"\\]*(?:\\.[^"\\]*)*"|<[^>]+>)|\b\d+\b|[{}()[\];])/g);
  return <>{parts.map((part, i) => {
    let cls = '';
    if (/^(int|return|for|if|include|using|namespace|void)$/.test(part)) cls = 'syntax-keyword';
    else if (/^(printf|cout|endl|main|linearSearch)$/.test(part)) cls = 'syntax-function';
    else if (/^(".*"|<.*>)$/.test(part)) cls = 'syntax-string';
    else if (/^\d+$/.test(part)) cls = 'syntax-number';
    else if (/^[{}()[\];]$/.test(part)) cls = 'syntax-punct';
    return cls ? <span className={cls} key={i}>{part}</span> : <span key={i}>{part}</span>;
  })}</>;
}
