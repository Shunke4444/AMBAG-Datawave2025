import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  PolarAreaController,
  BubbleController,
  ScatterController,
  DoughnutController,
  BarController,
  PieController,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ArrowBack, Send, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import GridLayoutManager from './GridLayoutManager';
import ChartWidget from './ChartWidget';
import { fetchSimulationCharts } from '../../lib/api';
import { useAuthRole } from '../../contexts/AuthRoleContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  PolarAreaController,
  BubbleController,
  ScatterController,
  DoughnutController,
  BarController,
  PieController,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WhatIf() {
  const navigate = useNavigate();
  const { authRole } = useAuthRole() || {};
  
  // UI State
  const [activeTimePeriod, setActiveTimePeriod] = useState('Month');
  const [chatInput, setChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // Grid Layout State
  const [gridDimensions] = useState({ cols: 12, rows: 6 });
  const [layoutHistory, setLayoutHistory] = useState([]);
  const [chartLayout, setChartLayout] = useState({
  c0: { x: 0, y: 0, width: 12, height: 6 },
  });

  
  // Chat State
  const [conversationMessages, setConversationMessages] = useState([]);
  
  const messagesEndRef = useRef(null);
  const [goalId, setGoalId] = useState(null);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const chartRefs = useRef({});

  // Charts State (dynamic)
  const [aiCharts, setAiCharts] = useState([]); // array of ChartSpec
  const [aiNarrative, setAiNarrative] = useState('');

  // Layout Management Functions
  const updateChartLayout = (chartId, newLayout) => {
    setLayoutHistory(prev => [...prev, chartLayout]);
    setChartLayout(prev => ({
      ...prev,
      [chartId]: {
        x: newLayout.x,
        y: newLayout.y,
        width: newLayout.width,
        height: newLayout.height
      }
    }));
  };

  const handleChartLayoutChange = (chartId, newLayout, isDragging = false) => {
    if (isDragging) {
      const draggedChart = chartLayout[chartId];
      const otherCharts = Object.entries(chartLayout).filter(([id]) => id !== chartId);
      
      // Check for swap opportunities during drag
      for (const [otherId, otherChart] of otherCharts) {
        const overlapX = Math.max(0, Math.min(newLayout.x + newLayout.width, otherChart.x + otherChart.width) - Math.max(newLayout.x, otherChart.x));
        const overlapY = Math.max(0, Math.min(newLayout.y + newLayout.height, otherChart.y + otherChart.height) - Math.max(newLayout.y, otherChart.y));
        const overlapArea = overlapX * overlapY;
        const draggedArea = newLayout.width * newLayout.height;
        const otherArea = otherChart.width * otherChart.height;
        
        // Trigger swap if overlap exceeds 30% of either chart
        if (overlapArea > Math.min(draggedArea, otherArea) * 0.3) {
          setLayoutHistory(prev => [...prev, chartLayout]);
          setChartLayout(prev => ({
            ...prev,
            [chartId]: { ...draggedChart, x: otherChart.x, y: otherChart.y },
            [otherId]: { ...otherChart, x: draggedChart.x, y: draggedChart.y }
          }));
          return;
        }
      }
    }
    
    updateChartLayout(chartId, newLayout);
  };

  const handleChartResize = (chartId, newWidth, newHeight, resizeType = 'both') => {
    const chart = chartLayout[chartId];
    if (!chart) return;

    let finalWidth = newWidth;
    let finalHeight = newHeight;

    // Apply resize constraints based on type
    switch (resizeType) {
      case 'width-only':
        finalHeight = chart.height;
        break;
      case 'height-only':
        finalWidth = chart.width;
        break;
      case 'proportional':
        const aspectRatio = chart.width / chart.height;
        if (Math.abs(newWidth - chart.width) > Math.abs(newHeight - chart.height)) {
          finalHeight = Math.round(newWidth / aspectRatio);
        } else {
          finalWidth = Math.round(newHeight * aspectRatio);
        }
        break;
      default:
        break;
    }

    // Constrain to grid bounds and minimum sizes
    finalWidth = Math.max(3, Math.min(finalWidth, gridDimensions.cols - chart.x));
    finalHeight = Math.max(2, Math.min(finalHeight, gridDimensions.rows - chart.y));

    setLayoutHistory(prev => [...prev, chartLayout]);
    setChartLayout(prev => ({
      ...prev,
      [chartId]: {
        ...chart,
        width: finalWidth,
        height: finalHeight
      }
    }));
  };

  const scrollToLatestMessage = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };



  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!chatInput.trim()) return;

    const prompt = chatInput;
    const userMessage = {
  id: Date.now(),
  content: prompt,
  sender: 'user',
  timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setConversationMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAssistantTyping(true);

    try {
      // If no goal selected, always ask for goal first
      let selectedGoalId = goalId;
      if (!selectedGoalId) {
        // Request goal list or charts from backend
        const data = await fetchSimulationCharts({ goal_id: '', prompt, max_charts: 4 });
        // If backend returns charts, show them immediately and store goalId
        if (Array.isArray(data?.charts) && data.charts.length > 0 && data?.baseline?.goal_id) {
          setGoalId(data.baseline.goal_id);
          setAiCharts(data.charts);
          setAiNarrative(data.narrative || '');
          setErrorMsg('');
          setAvailableGoals([]);
          // Update chart layout for up to 4 charts (2x2 grid)
          const newChartLayout = {};
          data.charts.forEach((chart, index) => {
            let x = 0, y = 0, width = 6, height = 3;
            if (data.charts.length <= 2) {
              x = index * 6;
              y = 0;
              width = 6;
              height = 6;
            } else if (data.charts.length === 3) {
              if (index < 2) {
                x = index * 6;
                y = 0;
                width = 6;
                height = 3;
              } else {
                x = 0;
                y = 3;
                width = 12;
                height = 3;
              }
            } else {
              x = (index % 2) * 6;
              y = Math.floor(index / 2) * 3;
              width = 6;
              height = 3;
            }
            newChartLayout[`c${index}`] = { x, y, width, height };
          });
          setChartLayout(newChartLayout);
          const assistantMessage = {
            id: Date.now() + 1,
            content: data.narrative || generateAssistantResponse(prompt),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          };
          setConversationMessages((prev) => [...prev, assistantMessage]);
          setIsAssistantTyping(false);
          return;
        }
        setAiCharts([]);
        setAiNarrative(''); 
        setErrorMsg('');
        setAvailableGoals(data.goals || []);
        let assistantContent = data.message;
        // If backend returns a stringified JSON, parse it
        if (typeof assistantContent === 'string' && assistantContent.trim().startsWith('{')) {
          try {
            assistantContent = JSON.parse(assistantContent);
          } catch (e) {
            // Not JSON, use as is
          }
        }
        // If still a string, wrap as object with narrative only
        if (typeof assistantContent === 'string') {
          assistantContent = { narrative: assistantContent };
        }
        const assistantMessage = {
          id: Date.now() + 1,
          content: assistantContent || { narrative: 'Please select a goal to analyze.' },
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        };
        setConversationMessages((prev) => [...prev, assistantMessage]);
        window.selectGoalForSimulation = async (goal_id) => {
          setGoalId(goal_id);
          setIsAssistantTyping(true);
          const chartData = await fetchSimulationCharts({ goal_id, prompt, max_charts: 4 });
          const narrative = chartData?.narrative || '';
          const charts = Array.isArray(chartData?.charts) ? chartData.charts : [];
          setAiNarrative(narrative);
          setAiCharts(charts);
          const newChartLayout = {};
          charts.forEach((chart, index) => {
            let x = 0, y = 0, width = 6, height = 3;
            if (charts.length <= 2) {
              x = index * 6;
              y = 0;
              width = 6;
              height = 6;
            } else if (charts.length === 3) {
              if (index < 2) {
                x = index * 6;
                y = 0;
                width = 6;
                height = 3;
              } else {
                x = 0;
                y = 3;
                width = 12;
                height = 3;
              }
            } else {
              x = (index % 2) * 6;
              y = Math.floor(index / 2) * 3;
              width = 6;
              height = 3;
            }
            newChartLayout[`c${index}`] = { x, y, width, height };
          });
          setChartLayout(newChartLayout);
          const assistantMessage = {
            id: Date.now() + 2,
            content: narrative || generateAssistantResponse(prompt),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          };
          setConversationMessages((prev) => [...prev, assistantMessage]);
          setIsAssistantTyping(false);
        };
        return;
      }

      // Check if prompt contains a goal name or goal ID
      // If user prompt matches a different goal, switch goalId
      if (availableGoals.length > 0) {
        const lowerPrompt = prompt.toLowerCase();
        const foundGoal = availableGoals.find(g =>
          lowerPrompt.includes((g.title || '').toLowerCase()) || lowerPrompt.includes((g.goal_id || '').toLowerCase())
        );
        if (foundGoal && foundGoal.goal_id !== goalId) {
          selectedGoalId = foundGoal.goal_id;
          setGoalId(selectedGoalId);
        }
      }

      let data = await fetchSimulationCharts({
        goal_id: selectedGoalId,
        prompt,
        max_charts: 4,
      });

      // If backend requests goal selection, show selectable goal list
      if (data.type === 'goal_list') {
        setAiCharts([]);
        setAiNarrative('');
        setErrorMsg('');
        setAvailableGoals(data.goals || []);
        // Add selectable goal buttons to assistant message
          const assistantMessage = {
            id: Date.now() + 1,
            content: data.message,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
        setConversationMessages((prev) => [...prev, assistantMessage]); 
        // Attach a handler for goal selection
        window.selectGoalForSimulation = async (goal_id) => {
          setGoalId(goal_id);
          setIsAssistantTyping(true);
          // Re-fetch charts for selected goal
          const chartData = await fetchSimulationCharts({ goal_id, prompt, max_charts: 4 });
          const narrative = chartData?.narrative || '';
          const charts = Array.isArray(chartData?.charts) ? chartData.charts : [];
          setAiNarrative(narrative);
          setAiCharts(charts);
          // Update chart layout for up to 4 charts (2x2 grid)
          const newChartLayout = {};
          charts.forEach((chart, index) => {
            let x = 0, y = 0, width = 6, height = 3;
            if (charts.length <= 2) {
              x = index * 6;
              y = 0;
              width = 6;
              height = 6;
            } else if (charts.length === 3) {
              if (index < 2) {
                x = index * 6;
                y = 0;
                width = 6;
                height = 3;
              } else {
                x = 0;
                y = 3;
                width = 12;
                height = 3;
              }
            } else {
              x = (index % 2) * 6;
              y = Math.floor(index / 2) * 3;
              width = 6;
              height = 3;
            }
            newChartLayout[`c${index}`] = { x, y, width, height };
          });
          setChartLayout(newChartLayout);
          const assistantMessage = {
            id: Date.now() + 2,
            content: narrative || generateAssistantResponse(prompt),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setConversationMessages((prev) => [...prev, assistantMessage]);
          setIsAssistantTyping(false);
        };
        return;
      }

      // Normal chart/narrative response
      const narrative = data?.narrative || '';
      const charts = Array.isArray(data?.charts) ? data.charts : [];
      setAiNarrative(narrative);
      setAiCharts(charts);

      // Update chart layout for up to 4 charts (2x2 grid)
      const newChartLayout = {};
      charts.forEach((chart, index) => {
        let x = 0, y = 0, width = 6, height = 3;
        if (charts.length <= 2) {
          x = index * 6;
          y = 0;
          width = 6;
          height = 6;
        } else if (charts.length === 3) {
          if (index < 2) {
            x = index * 6;
            y = 0;
            width = 6;
            height = 3;
          } else {
            x = 0;
            y = 3;
            width = 12;
            height = 3;
          }
        } else {
          x = (index % 2) * 6;
          y = Math.floor(index / 2) * 3;
          width = 6;
          height = 3;
        }
        newChartLayout[`c${index}`] = { x, y, width, height };
      });
      setChartLayout(newChartLayout);
      const assistantMessage = {
        id: Date.now() + 1,
        content: narrative || generateAssistantResponse(prompt),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };
      setConversationMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error generating simulation charts:", err);
      setErrorMsg("Sorry, there was a problem generating your chart. Please try again or check the backend.");
      const fallback = generateAssistantResponse(prompt);
      const assistantMessage = {
  id: Date.now() + 1,
  content: fallback,
  sender: 'assistant',
  timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };
      setConversationMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  // Effects
  useEffect(() => {
    scrollToLatestMessage();
  }, [conversationMessages, isAssistantTyping]);

  useEffect(() => {
  // No longer restore goalId from localStorage; always prompt for goal

    const savedLayoutData = localStorage.getItem('whatif-layout');
    if (savedLayoutData) {
      try {
        const { layout } = JSON.parse(savedLayoutData);
        setChartLayout(layout);
      } catch (error) {
        // Silently fail and use default layout
      }
    } else {
      // Default layout for up to 4 charts
      setChartLayout({
        c0: { x: 0, y: 0, width: 12, height: 3 },
        c1: { x: 0, y: 3, width: 6, height: 3 },
        c2: { x: 6, y: 3, width: 6, height: 3 },
        c3: { x: 0, y: 6, width: 12, height: 3 },
      });
    }
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        backgroundColor: '#FBFAF9',
        titleColor: '#1B1C1E',
        bodyColor: '#1B1C1E',
        borderColor: '#830000',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#1B1C1E', font: { size: 12, weight: '500' } },
      },
      y: {
        grid: { color: 'rgba(131, 0, 0, 0.1)' },
        border: { display: false },
        ticks: { color: '#1B1C1E', font: { size: 12, weight: '500' } },
        beginAtZero: true
      },
    },
  };

  return (
    <main className="min-h-screen  flex flex-col ">
      {/* Header */}
      <header className=" flex bg-primary  items-center justify-between py-4 text-secondary flex-shrink-0 border-b border-shadow">
        <section className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-shadow rounded-full transition-colors"
          >
            <ArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">What-If Scenarios</h1>
        </section>

        <nav className="flex items-center space-x-4">
          {/* Period Tabs */}
          <fieldset className="flex bg-secondary rounded-full p-1 border border-primary/20">
            <legend className="sr-only">Time Period Selection</legend>
            {['Day', 'Week', 'Month', 'Year'].map((period) => (
              <button
                key={period}
                onClick={() => setActiveTimePeriod(period)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeTimePeriod === period
                    ? 'bg-primary text-secondary'
                    : 'text-textcolor hover:text-primary'
                }`}
                aria-pressed={activeTimePeriod === period}
              >
                {period}
              </button>
            ))}
          </fieldset>
        </nav>
      </header>

  {/* Main Content Area with Grid */}
  <section className="h-[75vh] py-4 pb-24 bg-white">
        <article className="w-[70vw] mx-auto h-full">
          {/* Dynamic AI charts */}
          {/* AI narrative removed from above charts; will only show in chat */}
          {errorMsg && (
            <div className="text-red-600 text-center my-4">{errorMsg}</div>
          )}
          {aiCharts.length === 0 && !errorMsg ? (
            <div className="h-full flex items-center justify-center text-textcolor/60">
              Ask a question below to generate charts.
            </div>
          ) : (
            <GridLayoutManager
              gridCols={gridDimensions.cols}
              gridRows={gridDimensions.rows}
              onLayoutChange={handleChartLayoutChange}
              onResize={handleChartResize}
              className="h-full w-full"
            >
              {aiCharts.map((c, idx) => {
                // Type-aware dataset mapping for Chart.js
                const mapDataset = (d) => {
                  const base = { label: d.label, data: d.data };
                  const color = d.color || '#830000';
                  switch (c.type) {
                    case 'bar':
                    case 'line':
                      return {
                        ...base,
                        borderColor: color,
                        backgroundColor: color + '20',
                        tension: 0.4,
                        pointBackgroundColor: color,
                        pointBorderColor: color,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                      };
                    case 'radar':
                      return {
                        ...base,
                        borderColor: color,
                        backgroundColor: color + '20',
                        pointBackgroundColor: color,
                        pointBorderColor: color,
                      };
                    case 'pie':
                    case 'doughnut':
                    case 'polarArea':
                      return {
                        ...base,
                        backgroundColor: Array.isArray(d.color) ? d.color : [color],
                        borderColor: Array.isArray(d.color) ? d.color : [color],
                      };
                    case 'scatter':
                    case 'bubble':
                      return {
                        ...base,
                        borderColor: color,
                        backgroundColor: color + '20',
                      };
                    default:
                      return base;
                  }
                };
                return (
                  <ChartWidget
                    key={`c${idx}-${c.type}`}
                    id={`c${idx}`}
                    gridX={chartLayout[`c${idx}`]?.x || 0}
                    gridY={chartLayout[`c${idx}`]?.y || 0}
                    gridWidth={chartLayout[`c${idx}`]?.width || gridDimensions.cols}
                    gridHeight={chartLayout[`c${idx}`]?.height || 3}
                    minWidth={3}
                    minHeight={2}
                    title={c.title}
                    type={c.type}
                    chartData={{ labels: c.labels, datasets: (c.datasets || []).map(mapDataset) }}
                    chartOptions={{
                      ...chartOptions,
                      // Only provide scales for non-pie/doughnut/polarArea charts
                      ...(c.type === 'pie' || c.type === 'doughnut' || c.type === 'polarArea' ? { scales: undefined } : { scales: { ...chartOptions.scales } })
                    }}
                    legendItems={(c.datasets || []).map(d => ({ color: d.color || '#830000', label: d.label }))}
                  />
                );
              })}
            </GridLayoutManager>
          )}
        </article>
      </section>

  {/* Chat Interface - Fixed at bottom, but aligned with main content */}
  <aside className="fixed bottom-0 bg-secondary border-t border-primary/20 z-50 ml-64 w-[calc(100vw-16rem)] max-w-[calc(100vw-16rem)] left-auto right-0">
        {/* Chat Header with Toggle */}
        <header className="px-4 py-3 flex items-center justify-between">
          <section className="flex items-center space-x-3">
            <figure className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-secondary text-sm font-medium">$</span>
            </figure>
            <hgroup>
              <h3 className="font-medium text-textcolor">
                {conversationMessages.length > 0 && conversationMessages[0].sender === 'user' 
                  ? conversationMessages[0].content.slice(0, 40) + (conversationMessages[0].content.length > 40 ? '...' : '')
                  : 'Financial Assistant'
                }
              </h3>
            </hgroup>
          </section>
          
          <button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            className="p-2 text-textcolor/60 hover:text-textcolor transition-colors"
            aria-label={isChatExpanded ? "Minimize chat" : "Expand chat"}
          >
            {isChatExpanded ? <ExpandMore className="w-5 h-5" /> : <ExpandLess className="w-5 h-5" />}
          </button>
        </header>

        {/* Chat Messages Container - Only show when expanded */}
        {isChatExpanded && (
          <section className="px-4 border-t border-primary/20" style={{ height: '50vh' }}>
            <ul className="h-full overflow-y-auto space-y-4 py-4 list-none">
              {conversationMessages.map((message) => (
              <li key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'assistant' && (
                  <figure className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-medium">$</span>
                  </figure>
                )}
                
                <article className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary text-secondary'
                    : 'bg-secondary border border-primary/20 text-textcolor'
                }`}>
                  {message.sender === 'assistant' ? (
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {message.content && typeof message.content === 'object' && message.content.narrative
                          ? message.content.narrative
                          : message.content}
                      </ReactMarkdown>
                      {/* Render goal_titles as a styled list if present */}
                      {message.content && typeof message.content === 'object' && Array.isArray(message.content.goal_titles) && message.content.goal_titles.length > 0 && (
                        <ul className="mt-2 list-disc list-inside" style={{ marginLeft: '2rem' }}>
                          {message.content.goal_titles.map((title, idx) => (
                            <li key={idx}>
                              <span style={{ color: '#830000', fontStyle: 'italic', fontWeight: 500 }}>{title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  )}

                  {message.details && (
                    <details className="mt-3 space-y-3" open>
                      <summary className="sr-only">Message Details</summary>
                      {message.details.map((detail, index) => (
                        <section key={index} className="flex items-start space-x-2">
                          <span className="text-accent font-medium" role="img" aria-label="icon">{detail.icon}</span>
                          <p className="text-sm text-textcolor/80">{detail.text}</p>
                        </section>
                      ))}
                    </details>
                  )}

                  <time className={`text-xs mt-2 block ${
                    message.sender === 'user' ? 'text-secondary/70' : 'text-textcolor/60'
                  }`}>
                    {message.timestamp}
                  </time>
                </article>
              </li>
            ))}
            
            {isAssistantTyping && (
              <li className="flex justify-start">
                <figure className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-secondary text-sm font-medium">$</span>
                </figure>
                <output className="bg-secondary border border-primary/20 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1" role="status" aria-label="Assistant is typing">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </output>
              </li>
              )}
              
              {/* Quick Action Buttons - Only show when expanded and few messages */}
              {conversationMessages.length <= 2 && (
                <li>
                  <nav className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Quick actions">
                    <button
                      onClick={() => setChatInput("Show me visual simulation")}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-full text-xs hover:bg-primary/20 transition-colors"
                    >
                      📊 Visual Simulation
                    </button>
                    <button
                      onClick={() => setChatInput("What if I increase my contribution?")}
                      className="px-3 py-2 bg-accent/10 text-accent rounded-full text-xs hover:bg-accent/20 transition-colors"
                    >
                      💰 Increase Amount
                    </button>
                    <button
                      onClick={() => setChatInput("Can I extend the timeline?")}
                      className="px-3 py-2 bg-green/10 text-green rounded-full text-xs hover:bg-green/20 transition-colors"
                    >
                      ⏰ Extend Timeline
                    </button>
                  </nav>
                </li>
              )}
              
              <div ref={messagesEndRef} />
            </ul>
          </section>
        )}

        {/* Input Area - Always visible */}
  <footer className="p-4 border-t border-primary/20 w-full">
          <form onSubmit={handleMessageSubmit} className="flex items-center justify-center space-x-3">
            <fieldset className="flex-1 relative flex justify-center">
              <legend className="sr-only">Message Input</legend>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about scenarios..."
                className="w-full px-4 py-3 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary text-textcolor placeholder:text-textcolor/60 mx-auto"
              />
            </fieldset>
            <button
              type="submit"
              className="p-2 bg-primary text-secondary rounded-full hover:bg-shadow transition-colors disabled:opacity-50"
              disabled={!chatInput.trim()}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </aside>
    </main>
  );
}