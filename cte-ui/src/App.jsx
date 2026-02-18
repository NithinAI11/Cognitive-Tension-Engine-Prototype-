// FILE: cte_ui/src/App.jsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Grid, Fade, Typography, IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, Button, LinearProgress } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import useWebSocket from 'react-use-websocket';
import { BrainCircuit, Search, Scale, Merge, Zap, PanelRightOpen, Cpu, UserCheck, Clock } from 'lucide-react';

import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import PromptCockpit from './components/PromptCockpit';
import SystemBlueprint from './components/SystemBlueprint';
import StageSection from './components/StageSection';
import IdeationCard from './components/IdeationCard';
import DetailedPlanCard from './components/DetailedPlanCard';
import SynthesisTrigger from './components/SynthesisTrigger';
import SynthesisModal from './components/SynthesisModal';
import AgentPoolPanel from './components/AgentPoolPanel';
import EvidenceExplorer from './components/EvidenceExplorer';
import DialecticDashboard from './components/DialecticDashboard';
import VerticalFlowPanel from './components/VerticalFlowPanel';
import ExpandedStatusCard from './components/ExpandedStatusCard';
import TaskDirectiveCard from './components/TaskDirectiveCard';
import HistoryView from './components/HistoryView';
import KnowledgeGraphView from './components/KnowledgeGraphView';

const WS_URL = 'ws://localhost:8000/ws/analyze';

function App() {
  const [mode, setMode] = useState('light');
  const [currentView, setCurrentView] = useState('dashboard'); 
  
  // Dashboard State
  const [query, setQuery] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  const [activeStage, setActiveStage] = useState(null);
  
  // Data States
  const [logs, setLogs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [divergence, setDivergence] = useState(0.0);
  const [provenance, setProvenance] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [agentConfigs, setAgentConfigs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  
  // Recursion
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(3);
  const [routerDecision, setRouterDecision] = useState('pending');
  const [smartConfig, setSmartConfig] = useState(null);
  const [showConfigToast, setShowConfigToast] = useState(false);
  
  // UI
  const [modalOpen, setModalOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // HITL State
  const [hitlOpen, setHitlOpen] = useState(false);
  const [hitlMessage, setHitlMessage] = useState("");
  const [hitlTimer, setHitlTimer] = useState(30);

  const { sendMessage, lastMessage } = useWebSocket(WS_URL, { shouldReconnect: () => true });

  useEffect(() => {
    let interval;
    if (hitlOpen && hitlTimer > 0) {
      interval = setInterval(() => setHitlTimer(t => t - 1), 1000);
    } else if (hitlTimer === 0 && hitlOpen) {
      setHitlOpen(false); // Auto-close UI on timeout
    }
    return () => clearInterval(interval);
  }, [hitlOpen, hitlTimer]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const msg = JSON.parse(lastMessage.data);
        
        switch(msg.type) {
          case 'status':
              if (msg.msg && msg.msg.includes("Started")) {
                  setLogs([]); setPlans([]); setReviews([]); setSynthesis(null); 
                  setAgentConfigs([]); setEvidence([]); setDivergence(0); setProvenance(null);
                  setIteration(0); setRouterDecision('pending'); setSmartConfig(null);
                  setStatus('RUNNING'); setActiveStage('configurator');
                  setIsRightPanelOpen(true);
                  setCurrentView('dashboard');
              }
              break;
          
          case 'log': 
              const logEntry = { msg: msg.msg, node: msg.data?.node || 'system' };
              setLogs(prev => [...prev, logEntry]);
              if(logEntry.node) {
                  setActiveStage(logEntry.node);
                  if(logEntry.node === 'router') setRouterDecision('calculating...');
              }
              break;
          
          case 'hitl_request':
              setHitlMessage(msg.data.msg || "System requires guidance.");
              setHitlTimer(30);
              setHitlOpen(true);
              setStatus('PAUSED (HITL)');
              break;
              
          case 'config_report': if (msg.data) { setSmartConfig(msg.data); setShowConfigToast(true); } break;
          case 'plans': setPlans(msg.data || []); break;
          case 'contradiction_types': setAgentConfigs(msg.data || []); break; 
          case 'research_evidence': setEvidence(msg.data || []); break;
          case 'reviews': setReviews(msg.data || []); break;
          case 'dialectic_results': if (msg.data) { setDivergence(msg.data.divergence); setProvenance(msg.data.provenance); } break;
          
          case 'recursion_update':
              if (msg.data) {
                  if(msg.data.iteration !== undefined) setIteration(msg.data.iteration);
                  if(msg.data.max_iterations) setMaxIterations(msg.data.max_iterations);
                  if(msg.data.decision) setRouterDecision(msg.data.decision);
              }
              break;
              
          case 'result': 
              setSynthesis(msg.data); setStatus('COMPLETE'); setActiveStage('synthesizer'); setRouterDecision('synthesize'); break;
              
          case 'error': setLogs(prev => [...prev, { msg: `ERROR: ${msg.msg}`, node: 'error' }]); break;
        }
      } catch (e) { console.error("WS Message Error:", e); }
    }
  }, [lastMessage]);

  const handleRun = (taskQuery, complexity, hitlEnabled, tempMode, depthMode) => {
    setHasStarted(true);
    sendMessage(JSON.stringify({ 
        query: taskQuery, 
        complexity: complexity,
        hitl_enabled: hitlEnabled,
        temp_mode: tempMode,
        depth_mode: depthMode
    }));
  };

  const handleHitlResponse = (decision) => {
      sendMessage(JSON.stringify({
          type: "human_response",
          decision: decision
      }));
      setHitlOpen(false);
      setStatus('RUNNING');
  };

  const handleNewTask = () => {
    setHasStarted(false); setStatus('IDLE'); setQuery('');
    setPlans([]); setReviews([]); setAgentConfigs([]); setEvidence([]);
    setSynthesis(null); setProvenance(null); setIteration(0);
    setRouterDecision('pending'); setSmartConfig(null);
  };

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
        
        <Sidebar 
            mode={mode} 
            toggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')}
            currentView={currentView}
            onViewChange={setCurrentView}
        />
        
        <Box sx={{ flexGrow: 1, ml: '72px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <AppHeader status={status} latestLog={latestLog} onNewTask={handleNewTask} showNewTask={hasStarted && currentView === 'dashboard'} config={smartConfig} />
            
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                
                {currentView === 'history' && (
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
                        <HistoryView />
                    </Box>
                )}

                {currentView === 'graph' && (
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
                        <KnowledgeGraphView />
                    </Box>
                )}

                {currentView === 'dashboard' && (
                    <>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4, bgcolor: 'background.default' }}>
                            <Container maxWidth="lg">
                                {!hasStarted ? (
                                    <Fade in={!hasStarted}>
                                        <Box sx={{ mt: 6 }}>
                                            <Box sx={{ mb: 6, textAlign: 'center' }}>
                                                <Typography variant="h3" fontWeight={800} sx={{ mb: 2, background: '-webkit-linear-gradient(45deg, #8b5cf6 30%, #ec4899 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                                    Cognitive Tension Engine v2.5
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                                                    Autonomous Recursive Dialectics
                                                </Typography>
                                            </Box>
                                            <PromptCockpit query={query} setQuery={setQuery} onRun={handleRun} />
                                            <SystemBlueprint />
                                        </Box>
                                    </Fade>
                                ) : (
                                    <Fade in={hasStarted} timeout={800}>
                                        <Box sx={{ pb: 10 }}>
                                            <TaskDirectiveCard query={query} />
                                            <ExpandedStatusCard iteration={iteration} maxIterations={maxIterations} decision={routerDecision} divergence={divergence} />
                                            <StageSection title="Recursive Ideation" description="Generating and refining competing reasoning plans." icon={BrainCircuit} isActive={activeStage === 'planner' || activeStage === 'refiner' || activeStage === 'chaos_agent'} isCompleted={plans.length > 0}>
                                                <Grid container spacing={2}>{plans.map((plan, idx) => (<Grid item xs={12} md={6} lg={4} key={idx}><IdeationCard plan={plan} /></Grid>))}</Grid>
                                            </StageSection>
                                            <StageSection title="Swarm Validation" description="Autonomous agents executing parallel lookups." icon={Zap} isActive={activeStage === 'contradiction' || activeStage === 'swarm'} isCompleted={evidence.length > 0}>
                                                <Grid container spacing={3}><Grid item xs={12}><AgentPoolPanel configs={agentConfigs} isCompleted={evidence.length > 0} /></Grid><Grid item xs={12}><EvidenceExplorer evidence={evidence} /></Grid></Grid>
                                            </StageSection>
                                            <StageSection title="Meta-Critic Evaluation" description="Scoring plans based on logic and retrieved evidence." icon={Search} isActive={activeStage === 'critic'} isCompleted={reviews.length > 0}>
                                                {reviews.length > 0 && (<Grid container spacing={2}>{plans.map((plan, idx) => (<Grid item xs={12} md={6} lg={4} key={idx}><DetailedPlanCard plan={plan} review={reviews.find(r => r.plan_id === plan.id)} /></Grid>))}</Grid>)}
                                            </StageSection>
                                            <StageSection title="Cognitive Divergence" description="Calculated tension metrics and Shapley values." icon={Scale} isActive={activeStage === 'divergence' || activeStage === 'router'} isCompleted={provenance !== null}>
                                                <DialecticDashboard divergence={divergence} provenance={provenance} />
                                            </StageSection>
                                            <StageSection title="Final Synthesis" description="Dialectical merge of insights." icon={Merge} isActive={activeStage === 'synthesizer'} isCompleted={!!synthesis}>
                                                <SynthesisTrigger ready={!!synthesis} onClick={() => setModalOpen(true)} />
                                            </StageSection>
                                        </Box>
                                    </Fade>
                                )}
                            </Container>
                        </Box>

                        {hasStarted && (
                            <>
                                {isRightPanelOpen && (
                                    <Box sx={{ width: 320, flexShrink: 0, height: '100%', display: { xs: 'none', md: 'block' }, transition: 'all 0.4s', overflow: 'hidden' }}>
                                        <VerticalFlowPanel activeNode={activeStage} decision={routerDecision} iteration={iteration} maxIterations={maxIterations} divergence={divergence} onClose={() => setIsRightPanelOpen(false)} />
                                    </Box>
                                )}
                                {!isRightPanelOpen && (
                                    <Tooltip title="Open Telemetry">
                                        <IconButton onClick={() => setIsRightPanelOpen(true)} sx={{ position: 'absolute', right: 20, top: 120, zIndex: 10, bgcolor: 'background.paper', boxShadow: 3 }}>
                                            <PanelRightOpen size={20} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </Box>
        
        {/* Synthesis Modal */}
        <SynthesisModal open={modalOpen} onClose={() => setModalOpen(false)} content={synthesis} provenance={provenance} divergence={divergence} evidence={evidence} />
        
        {/* HITL Intervention Dialog */}
        <Dialog open={hitlOpen} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserCheck size={24} color="#8b5cf6" /> Human-in-the-Loop Intervention
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>{hitlMessage}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, bgcolor: '#f1f5f9', p: 1, borderRadius: 2 }}>
                    <Clock size={16} color="#64748b" />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">AUTO-PROCEED IN {hitlTimer}s</Typography>
                    <LinearProgress variant="determinate" value={(hitlTimer / 30) * 100} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" onClick={() => handleHitlResponse("Prioritize Risk Analysis")} sx={{ justifyContent: 'flex-start', py: 1.5, fontWeight: 600 }}>
                        🛡️ Prioritize Risk (Skeptic)
                    </Button>
                    <Button variant="outlined" onClick={() => handleHitlResponse("Prioritize Innovation/Speed")} sx={{ justifyContent: 'flex-start', py: 1.5, fontWeight: 600 }}>
                        ⚡ Prioritize Speed (Accelerationist)
                    </Button>
                    <Button variant="outlined" onClick={() => handleHitlResponse("Force Chaos Injection")} sx={{ justifyContent: 'flex-start', py: 1.5, fontWeight: 600 }}>
                        😈 Force Chaos (Disrupt Groupthink)
                    </Button>
                     <Button variant="contained" onClick={() => handleHitlResponse("Proceed with standard refinement")} sx={{ justifyContent: 'flex-start', py: 1.5, fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        🤖 Auto-Refine (Trust the Math)
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>

        <Snackbar open={showConfigToast} autoHideDuration={6000} onClose={() => setShowConfigToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert icon={<Cpu fontSize="inherit" />} severity="info" sx={{ width: '100%', bgcolor: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd', border: '1px solid', fontWeight: 600 }}>
                {smartConfig ? `Configured for ${smartConfig.nature || 'General Analysis'}` : "Configuring Neural Settings..."}
            </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;