import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Chip, useTheme, Fab, Tooltip } from '@mui/material';
import { Share2, Activity, Zap, X, Network, BrainCircuit, Database, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. SMART POPUP HUD ---
const NodePopup = ({ node, position, onClose }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Smart positioning logic to keep popup on screen
    const xOffset = position.x > window.innerWidth / 2 ? -340 : 40;
    const yOffset = position.y > window.innerHeight / 2 ? -200 : 20;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, x: xOffset, y: yOffset }}
            animate={{ opacity: 1, scale: 1, x: xOffset, y: yOffset }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                zIndex: 50,
                pointerEvents: 'auto'
            }}
        >
            <Paper sx={{ 
                width: 320, 
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(14, 165, 233, 0.2)'}`,
                boxShadow: isDark ? '0 0 30px rgba(56, 189, 248, 0.15)' : '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                p: 0
            }}>
                <Box sx={{ height: 4, width: '100%', bgcolor: node.divergence > 0.5 ? '#ef4444' : '#10b981' }} />
                
                <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <BrainCircuit size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1 }}>
                                SYNAPSE_ID: {node.id.substring(0,6)}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={onClose} sx={{ mt: -1, mr: -1 }}>
                            <X size={14} />
                        </IconButton>
                    </Box>

                    <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.3, mb: 2, color: 'text.primary' }}>
                        {node.title}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontSize={9}>DIVERGENCE</Typography>
                            <Typography variant="body2" fontWeight={700} color={node.divergence > 0.5 ? 'error.main' : 'success.main'}>
                                {node.divergence.toFixed(4)} σ
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" display="block" fontSize={9}>STATUS</Typography>
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                                ARCHIVED
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="caption" sx={{ 
                        display: 'block', 
                        fontFamily: 'monospace', 
                        color: 'text.secondary', 
                        bgcolor: isDark ? '#020617' : '#e2e8f0', 
                        p: 1, borderRadius: 1,
                        fontSize: '0.7rem'
                    }}>
                        {node.synthesis ? `>> ${node.synthesis.substring(0, 80)}...` : ">> DATA_CORRUPTED_OR_MISSING"}
                    </Typography>
                </Box>
            </Paper>
            
            <svg style={{ position: 'absolute', top: yOffset > 0 ? -20 : '100%', left: xOffset > 0 ? -20 : '100%', width: 40, height: 40, pointerEvents: 'none' }}>
                <line x1="0" y1="0" x2="40" y2="40" stroke={isDark ? "#38bdf8" : "#0ea5e9"} strokeWidth="1" />
                <circle cx={xOffset > 0 ? 40 : 0} cy={yOffset > 0 ? 40 : 0} r="3" fill={isDark ? "#38bdf8" : "#0ea5e9"} />
            </svg>
        </motion.div>
    );
};

// --- 2. MAIN CANVAS ENGINE ---

const KnowledgeGraphView = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    // Data State
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    
    // Viewport State (Pan/Zoom)
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    
    // Refs
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef(null);
    const nodesRef = useRef([]); 
    const signalsRef = useRef([]);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // 1. Initialization: Fetch & Physics Setup
    useEffect(() => {
        fetch('http://localhost:8000/api/runs')
            .then(res => res.json())
            .then(data => {
                const newNodes = data.map(run => ({
                    id: run.id,
                    title: run.task,
                    divergence: run.metrics?.divergence || 0,
                    synthesis: run.synthesis,
                    // Spawn around CENTER (0,0)
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 400,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    radius: 6 + (run.metrics?.divergence || 0) * 10,
                    baseColor: (run.metrics?.divergence || 0) > 0.5 ? '#ef4444' : (isDark ? '#38bdf8' : '#2563eb'),
                    angle: Math.random() * Math.PI * 2,
                    orbitSpeed: 0.001 + Math.random() * 0.002,
                    orbitRadius: 100 + Math.random() * 300
                }));

                nodesRef.current = newNodes;
                setNodes(newNodes);

                const newConnections = [];
                newNodes.forEach((node, i) => {
                    newNodes.slice(i + 1).forEach(other => {
                        const dist = Math.hypot(node.x - other.x, node.y - other.y);
                        if (dist < 250) {
                            newConnections.push({ from: node, to: other, dist });
                        }
                    });
                });
                setConnections(newConnections);

                // Center View Initially
                if (containerRef.current) {
                    setTransform({
                        x: containerRef.current.clientWidth / 2,
                        y: containerRef.current.clientHeight / 2,
                        k: 0.8
                    });
                }
            });
    }, [isDark]);

    // 2. Signal Logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (connections.length === 0) return;
            const conn = connections[Math.floor(Math.random() * connections.length)];
            signalsRef.current.push({
                from: conn.from, to: conn.to, progress: 0, speed: 0.02 + Math.random() * 0.03
            });
        }, 150);
        return () => clearInterval(interval);
    }, [connections]);

    // 3. Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const handleResize = () => {
            if (containerRef.current) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);
            
            // Apply Pan/Zoom
            ctx.save();
            ctx.translate(transform.x, transform.y);
            ctx.scale(transform.k, transform.k);

            // --- THEME COLORS ---
            const lineColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.2)';
            const signalColor = isDark ? '#ffffff' : '#0f172a';

            // A. Draw Orbit Rings (Background Decor)
            ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
            ctx.lineWidth = 2;
            [100, 200, 300, 400].forEach(r => {
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            });

            // B. Update Physics
            nodesRef.current.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                // Soft orbit force to keep them from drifting to infinity
                const dist = Math.hypot(node.x, node.y);
                if (dist > 600) {
                    node.vx -= node.x * 0.0001;
                    node.vy -= node.y * 0.0001;
                }
            });

            // C. Draw Connections
            ctx.beginPath();
            connections.forEach(conn => {
                ctx.moveTo(conn.from.x, conn.from.y);
                ctx.lineTo(conn.to.x, conn.to.y);
            });
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // D. Draw Signals
            signalsRef.current.forEach((sig, index) => {
                sig.progress += sig.speed;
                if (sig.progress >= 1) {
                    signalsRef.current.splice(index, 1);
                    return;
                }
                const currX = sig.from.x + (sig.to.x - sig.from.x) * sig.progress;
                const currY = sig.from.y + (sig.to.y - sig.from.y) * sig.progress;

                ctx.beginPath();
                ctx.arc(currX, currY, 3 / transform.k, 0, Math.PI * 2); // Scale invariant size
                ctx.fillStyle = signalColor;
                ctx.fill();
            });

            // E. Draw Nodes
            nodesRef.current.forEach(node => {
                let color = node.baseColor;
                let radius = node.radius;
                
                if (hoveredNode && hoveredNode.id === node.id) {
                    radius *= 1.3;
                    color = isDark ? '#fff' : '#000';
                }
                if (selectedNode && selectedNode.node.id === node.id) {
                    // Selection Ring
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
                    ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
                    ctx.lineWidth = 1.5 / transform.k;
                    ctx.stroke();
                }

                // Glow
                const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
                grad.addColorStop(0, color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Label (only if zoomed in enough)
                if (transform.k > 0.6) {
                    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                    ctx.font = `600 ${10 / transform.k}px Inter`;
                    ctx.fillText(node.title.substring(0, 15), node.x + 12, node.y + 4);
                }
            });

            // F. Draw Center Core
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? '#ffffff' : '#000000';
            ctx.fill();
            
            ctx.restore();
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [connections, hoveredNode, selectedNode, isDark, transform]);

    // 4. Interactions (Pan & Zoom)
    const handleWheel = (e) => {
        e.preventDefault();
        const scaleSensitivity = 0.001;
        const delta = -e.deltaY * scaleSensitivity;
        const newScale = Math.min(Math.max(0.2, transform.k + delta), 4);
        
        // Zoom towards mouse pointer
        // 1. Get mouse pos in world coords before zoom
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const worldX = (mx - transform.x) / transform.k;
        const worldY = (my - transform.y) / transform.k;
        
        // 2. Calculate new pan to keep worldX/Y under mouse
        const newX = mx - worldX * newScale;
        const newY = my - worldY * newScale;

        setTransform({ x: newX, y: newY, k: newScale });
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (isDragging) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return; // Skip hit detection while panning
        }

        // Hit Detection (Inverse Transform)
        const worldX = (mx - transform.x) / transform.k;
        const worldY = (my - transform.y) / transform.k;

        const hit = nodesRef.current.find(node => Math.hypot(node.x - worldX, node.y - worldY) < (20 / transform.k));
        setHoveredNode(hit || null);
        canvasRef.current.style.cursor = hit ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleClick = () => {
        if (hoveredNode) {
            // Calculate Screen Position for Popup
            // world * scale + pan = screen
            const screenX = hoveredNode.x * transform.k + transform.x;
            const screenY = hoveredNode.y * transform.k + transform.y;
            
            setSelectedNode({ node: hoveredNode, x: screenX, y: screenY });
        } else {
            setSelectedNode(null);
        }
    };

    // Zoom Controls
    const zoomIn = () => setTransform(p => ({ ...p, k: Math.min(p.k * 1.2, 4) }));
    const zoomOut = () => setTransform(p => ({ ...p, k: Math.max(p.k / 1.2, 0.2) }));
    const resetView = () => {
        if (containerRef.current) {
            setTransform({
                x: containerRef.current.clientWidth / 2,
                y: containerRef.current.clientHeight / 2,
                k: 0.8
            });
        }
    };

    return (
        <Box 
            ref={containerRef} 
            sx={{ 
                height: '100%', width: '100%', 
                position: 'relative', overflow: 'hidden', 
                bgcolor: 'background.default',
                backgroundImage: isDark 
                    ? 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' 
                    : 'radial-gradient(circle at 50% 50%, #fff 0%, #f1f5f9 100%)'
            }}
        >
            <canvas 
                ref={canvasRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
                style={{ display: 'block' }}
            />

            {/* --- HUD ELEMENTS --- */}
            
            {/* Top Left Header */}
            <Box sx={{ position: 'absolute', top: 20, left: 30, pointerEvents: 'none' }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Network size={28} /> NEURAL ARCHIVE
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Chip icon={<Activity size={14}/>} label={`${nodes.length} NODES`} size="small" color="primary" variant="outlined" />
                    <Chip icon={<Zap size={14}/>} label="LIVE SIGNAL" size="small" color="warning" variant="outlined" />
                </Box>
            </Box>

            {/* Zoom Controls (Bottom Right) */}
            <Box sx={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Tooltip title="Zoom In" placement="left">
                    <Fab size="small" onClick={zoomIn} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}><ZoomIn size={20} /></Fab>
                </Tooltip>
                <Tooltip title="Zoom Out" placement="left">
                    <Fab size="small" onClick={zoomOut} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}><ZoomOut size={20} /></Fab>
                </Tooltip>
                <Tooltip title="Center View" placement="left">
                    <Fab size="small" onClick={resetView} color="primary"><Move size={20} /></Fab>
                </Tooltip>
            </Box>

            {/* Popup */}
            <AnimatePresence>
                {selectedNode && (
                    <NodePopup 
                        node={selectedNode.node} 
                        position={{ x: selectedNode.x, y: selectedNode.y }} 
                        onClose={() => setSelectedNode(null)} 
                    />
                )}
            </AnimatePresence>
        </Box>
    );
};

export default KnowledgeGraphView;