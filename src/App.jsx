import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, setDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Deployment Version: 1.0.1 - Triggering Vercel Build
// --- Custom SVG Icons ---
const SvgIcon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const Trophy = (props) => <SvgIcon {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></SvgIcon>;
const BarChart3 = (props) => <SvgIcon {...props}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></SvgIcon>;
const PlayCircle = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></SvgIcon>;
const CheckCircle2 = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></SvgIcon>;
const ArrowLeft = (props) => <SvgIcon {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></SvgIcon>;
const Star = (props) => <SvgIcon {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>;
const TrendingUp = (props) => <SvgIcon {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></SvgIcon>;
const Presentation = (props) => <SvgIcon {...props}><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></SvgIcon>;
const Lightbulb = (props) => <SvgIcon {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></SvgIcon>;
const Trash2 = (props) => <SvgIcon {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></SvgIcon>;
const Plus = (props) => <SvgIcon {...props}><path d="M5 12h14"/><path d="M12 5v14"/></SvgIcon>;
const Download = (props) => <SvgIcon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></SvgIcon>;
const RefreshCw = (props) => <SvgIcon {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></SvgIcon>;
const AlertTriangle = (props) => <SvgIcon {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></SvgIcon>;
const Activity = (props) => <SvgIcon {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></SvgIcon>;

const IconMap = { Lightbulb, TrendingUp, CheckCircle2, Presentation, Star };

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyB4jETa7Ud2A4fZcAxzTSd2ot7FDX4Gy3g",
  authDomain: "pitch-app-8296f.firebaseapp.com",
  projectId: "pitch-app-8296f",
  storageBucket: "pitch-app-8296f.firebasestorage.app",
  messagingSenderId: "1032972265784",
  appId: "1:1032972265784:web:0b3d917e79e8b388ea79cd",
  measurementId: "G-YGGLWVKTNN"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'my-company-pitch-app';

const DEFAULT_CRITERIA = [
  { id: 'innovation', label: 'Innovation & Originality', iconName: 'Lightbulb' },
  { id: 'market', label: 'Market Potential', iconName: 'TrendingUp' },
  { id: 'execution', label: 'Feasibility & Execution', iconName: 'CheckCircle2' },
  { id: 'presentation', label: 'Presentation Quality', iconName: 'Presentation' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [votes, setVotes] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [tempCriteria, setTempCriteria] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !roomId) return;

    const compsRef = collection(db, 'artifacts', appId, 'public', 'data', 'competitors');
    const unsubComps = onSnapshot(compsRef, (snap) => {
      const roomComps = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.roomId === roomId); 
      setCompetitors(roomComps);
    }, (err) => console.error("Comps Sync Error:", err));

    const votesRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
    const unsubVotes = onSnapshot(votesRef, (snap) => {
      const roomVotes = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => v.roomId === roomId); 
      setVotes(roomVotes);
    }, (err) => console.error("Votes Sync Error:", err));

    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', roomId);
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists() && snap.data().criteria) {
        setCriteria(snap.data().criteria);
      }
    }, (err) => console.error("Settings Sync Error:", err));

    return () => {
      unsubComps();
      unsubVotes();
      unsubSettings();
    };
  }, [user, roomId]);

  const activeCompetitor = useMemo(() => 
    competitors.find(c => c.status === 'active'), 
  [competitors]);

  const calculateMetrics = (compId) => {
    const compVotes = votes.filter(v => v.competitorId === compId);
    if (compVotes.length === 0) return { count: 0, averages: {}, overallAverage: 0, totalSum: 0 };

    const sums = {};
    criteria.forEach(c => sums[c.id] = 0);

    compVotes.forEach(v => {
      criteria.forEach(c => {
        sums[c.id] += Number(v[c.id]) || 0;
      });
    });

    const count = compVotes.length;
    const averages = {};
    let totalSum = 0;
    
    criteria.forEach(c => {
      averages[c.id] = (sums[c.id] / count).toFixed(1);
      totalSum += sums[c.id];
    });

    const overallAverage = criteria.length > 0 ? (totalSum / (count * criteria.length)).toFixed(2) : 0;

    return { count, averages, overallAverage, totalSum, sums };
  };

  const leaderboard = useMemo(() => {
    return competitors
      .filter(c => c.status !== 'waiting')
      .map(c => ({
        ...c,
        metrics: calculateMetrics(c.id)
      }))
      .sort((a, b) => Number(b.metrics.overallAverage) - Number(a.metrics.overallAverage));
  }, [competitors, votes, criteria]);

  const handleAddCompetitor = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !user || !roomId) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'competitors'), {
        name: newTeamName.trim(),
        status: 'waiting',
        roomId: roomId, 
        createdAt: serverTimestamp(),
        hostId: user.uid
      });
      setNewTeamName('');
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleSetStatus = async (compId, status) => {
    if (!user || !roomId) return;
    try {
      if (status === 'active') {
        const currentlyActive = competitors.filter(c => c.status === 'active');
        for (const c of currentlyActive) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'competitors', c.id), { status: 'finished' });
        }
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'competitors', compId), {
        status: status
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCriteria = async () => {
    if (!roomId) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', roomId), {
        criteria: tempCriteria
      }, { merge: true });
      setEditingCriteria(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (leaderboard.length === 0) return;
    
    let csvContent = "Rank,Team Name,Total Votes,Overall Average";
    criteria.forEach(c => csvContent += `,${c.label}`);
    csvContent += "\n";

    leaderboard.forEach((comp, index) => {
      let row = `${index + 1},"${comp.name}",${comp.metrics.count},${comp.metrics.overallAverage}`;
      criteria.forEach(c => {
        row += `,${comp.metrics.averages[c.id] || 0}`;
      });
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pitch_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetSession = async () => {
    if (!roomId) return;
    setIsSubmitting(true);
    try {
      for (const comp of competitors) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'competitors', comp.id));
      }
      for (const vote of votes) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'votes', vote.id));
      }
      setShowResetModal(false);
    } catch (err) {
      console.error("Reset Error:", err);
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Connecting to live session...</p>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">Pitch Feedback Live</h1>
            <p className="text-indigo-100">Real-time judging and scoring</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Join a Session</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Room Code" 
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                />
                <button 
                  disabled={!roomInput.trim()}
                  onClick={() => { setRoomId(roomInput.trim()); setView('audience'); }}
                  className="px-6 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <button 
              onClick={() => { 
                const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
                setRoomId(newRoom); 
                setView('host'); 
              }}
              className="w-full py-4 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl flex items-center justify-center transition-colors gap-3"
            >
              <BarChart3 className="w-6 h-6" />
              Create New Host Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'audience') {
    return (
      <AudienceView 
        activeCompetitor={activeCompetitor} 
        competitors={competitors}
        user={user} 
        votes={votes} 
        criteria={criteria}
        roomId={roomId}
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'host') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('landing')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-slate-800">Host Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 font-mono font-bold rounded-md text-sm border border-indigo-200">
                Code: {roomId}
              </span>
            </div>
            <button 
              onClick={() => setView('leaderboard')}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100"
            >
              <Trophy className="w-4 h-4" /> Final Leaderboard
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
          {activeCompetitor ? (
            <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BarChart3 className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-200 mb-2 font-medium tracking-wide text-sm uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  Live Pitch
                </div>
                <h2 className="text-3xl font-bold mb-6">{activeCompetitor.name}</h2>
                {(() => {
                  const metrics = calculateMetrics(activeCompetitor.id);
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-indigo-200 text-sm font-medium mb-1">Total Votes</p>
                          <p className="text-3xl font-bold">{metrics.count}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-indigo-200 text-sm font-medium mb-1">Avg Score</p>
                          <p className="text-3xl font-bold">{metrics.overallAverage}<span className="text-lg font-normal text-indigo-300">/10</span></p>
                        </div>
                         <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2 md:col-span-2">
                           <p className="text-indigo-200 text-sm font-medium mb-2">Current Breakdown</p>
                           <div className="flex gap-4">
                             {criteria.slice(0,2).map(c => (
                               <div key={c.id} className="flex-1">
                                 <div className="text-xs text-indigo-200 truncate">{c.label}</div>
                                 <div className="font-bold">{metrics.averages[c.id] || '0.0'}</div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSetStatus(activeCompetitor.id, 'finished')}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                      >
                        End Pitch & Close Voting
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-slate-200 border border-slate-300 border-dashed rounded-2xl p-8 text-center text-slate-500">
              <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-lg">No active pitch</p>
              <p className="text-sm">Start a pitch from the list below to begin collecting live votes.</p>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg">Add Pitcher/Team</h3>
                <form onSubmit={handleAddCompetitor} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <input
                    type="text"
                    placeholder="Team Name"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    disabled={!newTeamName.trim() || isSubmitting}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors"
                  >
                    Add to List
                  </button>
                </form>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Scoring Criteria</h3>
                  {!editingCriteria ? (
                    <button onClick={() => { setTempCriteria([...criteria]); setEditingCriteria(true); }} className="text-sm text-indigo-600 font-medium hover:underline">Edit</button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setEditingCriteria(false)} className="text-sm text-slate-500 font-medium hover:underline">Cancel</button>
                      <button onClick={handleSaveCriteria} className="text-sm text-emerald-600 font-medium hover:underline">Save</button>
                    </div>
                  )}
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  {editingCriteria ? (
                    <div className="space-y-3">
                      {tempCriteria.map((c, i) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <input 
                            value={c.label} 
                            onChange={(e) => {
                              const updated = [...tempCriteria];
                              updated[i].label = e.target.value;
                              setTempCriteria(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={() => {
                              const updated = [...tempCriteria];
                              updated.splice(i, 1);
                              setTempCriteria(updated);
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setTempCriteria([...tempCriteria, { id: 'crit_' + Date.now(), label: 'New Criterion', iconName: 'Star' }])}
                        className="w-full flex items-center justify-center gap-1 py-1.5 mt-2 border border-dashed border-slate-300 rounded-md text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Criterion
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {criteria.length === 0 && <p className="text-sm text-slate-500 italic">No criteria defined.</p>}
                      {criteria.map(c => {
                        const Icon = IconMap[c.iconName] || Star;
                        return (
                          <div key={c.id} className="text-sm text-slate-700 flex items-center gap-2">
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{c.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Up Next / Completed</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                {competitors.filter(c => c.status !== 'active').length === 0 && (
                  <div className="p-6 text-center text-slate-500 italic">No other teams found.</div>
                )}
                {competitors.filter(c => c.status !== 'active').map(comp => (
                  <div key={comp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">{comp.name}</h4>
                      <div className="flex gap-3 text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          comp.status === 'finished' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {comp.status === 'finished' ? 'Finished' : 'Waiting'}
                        </span>
                        {comp.status === 'finished' && (
                          <span className="text-slate-500">
                            {calculateMetrics(comp.id).count} votes
                          </span>
                        )}
                      </div>
                    </div>
                    {comp.status === 'waiting' && (
                       <button 
                        onClick={() => handleSetStatus(comp.id, 'active')}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                      >
                        Start Pitch
                      </button>
                    )}
                     {comp.status === 'finished' && (
                       <button 
                        onClick={() => handleSetStatus(comp.id, 'active')}
                        className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 text-slate-200 mt-8 mb-8">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Session & Data Management
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <h4 className="font-semibold text-white mb-1">Export Results</h4>
                <p className="text-sm text-slate-400 mb-4">Download current scores as a CSV file.</p>
                <button 
                  onClick={handleExportCSV}
                  disabled={leaderboard.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> Save / Export as CSV
                </button>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                <h4 className="font-semibold text-white mb-1">Start New Round</h4>
                <p className="text-sm text-slate-400 mb-4">Clear all current teams and votes.</p>
                <button 
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 font-medium rounded-lg transition-colors border border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" /> Start New Session
                </button>
              </div>
            </div>
          </div>
        </main>
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Clear All Data?</h3>
              </div>
              <p className="text-slate-600 mb-6">Are you sure? This action is permanent.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} disabled={isSubmitting} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl">Cancel</button>
                <button onClick={handleResetSession} disabled={isSubmitting} className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl flex items-center justify-center">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Yes, Reset'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'leaderboard') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
            <button onClick={() => setView('host')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Final Results</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 mt-8">
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl shadow-sm">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No pitches scored yet.</p>
              </div>
            ) : (
              leaderboard.map((comp, index) => (
                <div key={comp.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${index === 0 ? 'border-amber-300 shadow-amber-100/50 shadow-lg' : 'border-slate-100'}`}>
                  <div className={`p-6 flex flex-col md:flex-row items-center gap-6 ${index === 0 ? 'bg-amber-50/30' : ''}`}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl shrink-0 bg-slate-100 text-slate-400">
                      {index === 0 ? <Trophy className="w-6 h-6 text-amber-500" /> : `#${index + 1}`}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">{comp.name}</h2>
                      <p className="text-slate-500 text-sm">{comp.metrics.count} total votes recorded</p>
                    </div>
                    <div className="text-center bg-slate-50 rounded-xl p-4 w-full md:w-auto">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Overall Avg</p>
                      <p className="text-4xl font-black text-indigo-600">{comp.metrics.overallAverage}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {criteria.map(c => {
                      const Icon = IconMap[c.iconName] || Star;
                      return (
                        <div key={c.id}>
                          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-1">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="truncate">{c.label}</span>
                          </div>
                          <p className="font-bold text-slate-800">{comp.metrics.averages[c.id] || '-'}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}

function AudienceView({ activeCompetitor, competitors, user, votes, onBack, criteria, roomId }) {
  const [scores, setScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initial = {};
    criteria.forEach(c => initial[c.id] = 5);
    setScores(initial);
  }, [activeCompetitor?.id, criteria]);

  const hasVoted = useMemo(() => {
    if (!activeCompetitor || !user) return false;
    return votes.some(v => v.competitorId === activeCompetitor.id && v.userId === user.uid);
  }, [activeCompetitor, votes, user]);

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({ ...prev, [criteriaId]: parseInt(value) }));
  };

  const submitVote = async () => {
    if (!activeCompetitor || !user || isSubmitting || !roomId) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'votes'), {
        competitorId: activeCompetitor.id,
        userId: user.uid,
        roomId: roomId,
        ...scores,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-indigo-600 text-white shadow-md p-4 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-indigo-200 hover:text-white rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Live Feedback</h1>
          <p className="text-indigo-200 text-xs">Audience Mode</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!activeCompetitor ? (
           <div className="text-center w-full max-w-md">
             <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
               <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Waiting for pitch...</h2>
             <p className="text-slate-500 mb-8">Connected to Room: {roomId}</p>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-left">
               <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 Current Status
               </h3>
               {competitors.length === 0 ? (
                 <p className="text-sm text-slate-500 italic text-center py-4">Waiting for host...</p>
               ) : (
                 <ul className="space-y-3 divide-y divide-slate-100">
                   {competitors.map(c => (
                     <li key={c.id} className="pt-3 flex justify-between items-center text-sm">
                       <span className="font-semibold text-slate-700">{c.name}</span>
                       <span className={`text-xs px-2.5 py-1 font-bold rounded-md uppercase ${
                         c.status === 'finished' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {c.status}
                       </span>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
           </div>
        ) : hasVoted ? (
           <div className="text-center max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
             <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-10 h-10 text-emerald-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Scores Submitted!</h2>
             <p className="text-slate-500 mb-8">Feedback for <strong>{activeCompetitor.name}</strong> recorded.</p>
             <button onClick={() => window.location.reload()} className="text-sm text-indigo-600 font-medium hover:underline">Refresh</button>
           </div>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full mb-3 animate-pulse">Live Voting</span>
              <h2 className="text-3xl font-black text-slate-800">{activeCompetitor.name}</h2>
            </div>
            <div className="p-6 space-y-8">
              {criteria.map(c => {
                const Icon = IconMap[c.iconName] || Star;
                return (
                  <div key={c.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-indigo-500" />
                        <label className="font-semibold text-slate-700">{c.label}</label>
                      </div>
                      <span className="text-2xl font-black text-indigo-600 w-8 text-right">{scores[c.id] || 5}</span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={scores[c.id] || 5}
                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                )
              })}
              <div className="pt-4 border-t border-slate-100">
                <button onClick={submitVote} disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-70">
                  {isSubmitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : 'Submit Scores'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}