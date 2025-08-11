import { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ArrowBack, Send, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import GridLayoutManager from './GridLayoutManager';
import ChartWidget from './ChartWidget';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WhatIf() {
  const navigate = useNavigate();
  
  // UI State
  const [activeTimePeriod, setActiveTimePeriod] = useState('Month');
  const [chatInput, setChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // AI Chart State
  const [aiCharts, setAiCharts] = useState([]);
  const [aiNarrative, setAiNarrative] = useState('');
  
  // Grid Layout State
  const [gridDimensions] = useState({ cols: 12, rows: 6 });
  const [layoutHistory, setLayoutHistory] = useState([]);
  const [chartLayout, setChartLayout] = useState({
    mainChart: { x: 0, y: 0, width: 6, height: 3 },
    trendsChart: { x: 6, y: 0, width: 6, height: 3 },
    performanceChart: { x: 0, y: 3, width: 12, height: 3 }
  });
  
  // Chat State
  const [conversationMessages, setConversationMessages] = useState([
    {
      id: 1,
      content: "What if I can't pay the ₱4,000 on time?",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      content: "Okay, let's walk through what could happen if you miss the ₱4,000 payment deadline:",
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      details: [
        {
          icon: '⚠️',
          text: 'Based on your cash flow, malili-hing ma-a-affect yung next contribution mo sa ₱5,000, due to the immediate financial strain.'
        },
        {
          icon: '💡',
          text: 'Your group might need to redistribute some might get a slightly delayed timeline (around 4%) which could cause stress if walang napaali na hindi makabayad on time.'
        },
        {
          icon: '📊',
          text: 'Alternatibo: Consider using kasunod, may need or supplies; baka kailangan mo ng adjustment sa long-range goal at may extra cash reserve na 2-3 months cushion.'
        },
        {
          icon: '🔄',
          text: 'I recommend considering a fallback plan—pwede mong i-delay some non-urgent expenses against yung particular ikaw-takuran para sa emergency extension or restructuring.'
        },
        {
          icon: '💬',
          text: 'Gusto mo bang makita a visual simulation ng impact sa budget mo for the next 3 months?'
        }
      ]
    }
  ]);
  
  const messagesEndRef = useRef(null);

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
        // Free resize - no additional constraints
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

  // Chat Functions
  const scrollToLatestMessage = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateAssistantResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('visual') || input.includes('simulation') || input.includes('yes') || input.includes('oo')) {
      return "Great! I'll generate a visual simulation. Based on your payment patterns, here's what I can show you:\n\n📈 If you delay the ₱4,000 payment by 1 week, your next 3 contributions will need to increase by ₱500 each to stay on track.\n\n📊 Alternative: You could extend the timeline by 2 weeks and keep the same contribution amounts.\n\nWhich option would you prefer to explore further?";
    } 
    
    if (input.includes('extend') || input.includes('timeline')) {
      return "Timeline extension is a good strategy! Here are your options:\n\n⏰ Option 1: Extend by 2 weeks - keep same amounts\n⏰ Option 2: Extend by 1 month - reduce future contributions by ₱300 each\n⏰ Option 3: Flexible schedule - pay when you can, goal completion by December\n\nWhich timeline works best for your current situation?";
    } 
    
    if (input.includes('increase') || input.includes('more')) {
      return "I understand you're considering increasing contributions. Let me analyze this:\n\n💰 If you increase by ₱500/month: Goal completed 6 weeks earlier\n💰 If you increase by ₱1000/month: Goal completed 3 months earlier\n\n⚠️ But consider your cash flow - sustainable amounts are better than aggressive targets that might cause stress.\n\nWhat's your comfortable maximum monthly contribution?";
    } 
    
    if (input.includes('help') || input.includes('advice')) {
      return "Here's my personalized advice based on your financial profile:\n\n✅ Priority: Build a ₱2,000 emergency buffer first\n✅ Strategy: Set up automatic transfers on your payday\n✅ Backup: Have 2-3 alternative payment dates ready\n\nRemember, consistency beats perfection. Better to contribute steadily than to stress about perfect timing!";
    }

    return "I can help you explore different scenarios for your group payments. Try asking about:\n\n• Visual simulations of payment impacts\n• Timeline extensions or adjustments\n• Increasing or decreasing contribution amounts\n• Emergency backup plans\n\nWhat would you like to analyze first?";
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: chatInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setConversationMessages(prev => [...prev, userMessage]);
    const currentPrompt = chatInput;
    setChatInput('');
    setIsAssistantTyping(true);

    try {
      // Ensure we have a goal_id (create test goal if needed)
      let goalId = localStorage.getItem('test_goal_id');
      if (!goalId) {
        const baseURL = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000';
        const testGoalResponse = await axios.post(`${baseURL}/simulation/create-test-goal`);
        goalId = testGoalResponse.data.goal_id;
        localStorage.setItem('test_goal_id', goalId);
      }

      // Call the generate-charts endpoint
      const baseURL = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${baseURL}/simulation/generate-charts`, {
        goal_id: goalId,
        prompt: currentPrompt,
        max_charts: 3
      });

      const { narrative, charts } = response.data;
      
      // Set AI narrative and charts
      setAiNarrative(narrative);
      setAiCharts(charts || []);

      // Add assistant message with narrative
      const assistantMessage = {
        id: Date.now() + 1,
        content: narrative,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };

      setConversationMessages(prev => [...prev, assistantMessage]);
      setIsAssistantTyping(false);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback response
      const fallbackResponse = generateAssistantResponse(currentPrompt);
      const assistantMessage = {
        id: Date.now() + 1,
        content: fallbackResponse,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };

      // Add fallback chart
      setAiCharts([{
        title: "Fallback Chart",
        type: "bar",
        chartjsConfig: {
          type: "bar",
          data: {
            labels: ["Current", "Target"],
            datasets: [{
              label: "Amount",
              data: [2500, 10000],
              backgroundColor: ["#4CAF50", "#FF9800"]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: true, text: "Goal Progress" }
            }
          }
        }
      }]);

      setConversationMessages(prev => [...prev, assistantMessage]);
      setIsAssistantTyping(false);
    }
  };

  // Effects
  useEffect(() => {
    scrollToLatestMessage();
  }, [conversationMessages, isAssistantTyping]);

  useEffect(() => {
    const savedLayoutData = localStorage.getItem('whatif-layout');
    if (savedLayoutData) {
      try {
        const { layout } = JSON.parse(savedLayoutData);
        setChartLayout(layout);
      } catch (error) {
        // Silently fail and use default layout
      }
    }
  }, []);

  // Chart Configuration
  const mainChartData = {
    labels: ['1 Oct', '3 Oct', '5 Oct', '7 Oct', '9 Oct', '10 Oct'],
    datasets: [
      {
        label: 'Payment if not sent',
        data: [2, 3, 4, 2, 1, 4],
        borderColor: '#830000',
        backgroundColor: 'rgba(131, 0, 0, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#830000',
        pointBorderColor: '#830000',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Actual Payment',
        data: [1, 2, 2, 3, 2, 3],
        borderColor: '#DDB440',
        backgroundColor: 'rgba(221, 180, 64, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#DDB440',
        pointBorderColor: '#DDB440',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FBFAF9',
        titleColor: '#1B1C1E',
        bodyColor: '#1B1C1E',
        borderColor: '#830000',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#1B1C1E',
          font: {
            size: 12,
            weight: '500'
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(131, 0, 0, 0.1)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#1B1C1E',
          font: {
            size: 12,
            weight: '500'
          },
          stepSize: 1,
        },
        min: 0,
        max: 5,
      },
    },
  };

  return (
    <main className="min-h-screen bg-primary flex flex-col overflow-hidden px-6">
      {/* Header */}
      <header className="flex items-center justify-between py-4 text-secondary flex-shrink-0 border-b border-shadow">
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
      <section className="h-[75vh] py-4 pb-24">
        <article className="w-[70vw] mx-auto h-full">
          <GridLayoutManager
            gridCols={gridDimensions.cols}
            gridRows={gridDimensions.rows}
            onLayoutChange={handleChartLayoutChange}
            onResize={handleChartResize}
            className="h-full w-full"
          >
          {/* Render AI Generated Charts or Default Charts */}
          {aiCharts.length > 0 ? (
            aiCharts.map((chart, index) => (
              <ChartWidget
                key={`ai-chart-${index}`}
                id={`aiChart${index}`}
                gridX={index === 0 ? 0 : index === 1 ? 6 : 0}
                gridY={index === 0 ? 0 : index === 1 ? 0 : 3}
                gridWidth={index === 2 ? 12 : 6}
                gridHeight={3}
                minWidth={3}
                minHeight={2}
                title={chart.title}
                chartType={chart.type}
                chartjsConfig={chart.chartjsConfig}
              />
            ))
          ) : (
            <>
              {/* Default charts when no AI charts available */}
              <ChartWidget
                id="mainChart"
                gridX={chartLayout.mainChart.x}
                gridY={chartLayout.mainChart.y}
                gridWidth={chartLayout.mainChart.width}
                gridHeight={chartLayout.mainChart.height}
                minWidth={3}
                minHeight={2}
                title="Payment Analysis"
                chartData={mainChartData}
                chartOptions={chartOptions}
                legendItems={[
                  { color: '#830000', label: 'Payment if not sent' },
                  { color: '#DDB440', label: 'Actual Payment' }
                ]}
              />

              <ChartWidget
                id="trendsChart"
                gridX={chartLayout.trendsChart.x}
                gridY={chartLayout.trendsChart.y}
                gridWidth={chartLayout.trendsChart.width}
                gridHeight={chartLayout.trendsChart.height}
                minWidth={3}
                minHeight={2}
                title="Payment Trends"
                chartData={{
                  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                  datasets: [
                    {
                      label: 'On-time Payments',
                      data: [95, 87, 92, 88],
                      borderColor: '#34A751',
                      backgroundColor: 'rgba(52, 167, 81, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#34A751',
                      pointBorderColor: '#34A751',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                    {
                      label: 'Late Payments',
                      data: [5, 13, 8, 12],
                      borderColor: '#DDB440',
                      backgroundColor: 'rgba(221, 180, 64, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#DDB440',
                      pointBorderColor: '#DDB440',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    }
                  ]
                }}
                chartOptions={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: { ...chartOptions.scales.y, max: 100 }
                  }
                }}
                legendItems={[
                  { color: '#34A751', label: 'On-time' },
                  { color: '#DDB440', label: 'Late' }
                ]}
              />

              <ChartWidget
                id="performanceChart"
                gridX={chartLayout.performanceChart.x}
                gridY={chartLayout.performanceChart.y}
                gridWidth={chartLayout.performanceChart.width}
                gridHeight={chartLayout.performanceChart.height}
                minWidth={3}
                minHeight={2}
                title="Group Performance"
                chartData={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Your Group',
                      data: [85, 92, 78, 86, 94, 89],
                      borderColor: '#830000',
                      backgroundColor: 'rgba(131, 0, 0, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#830000',
                      pointBorderColor: '#830000',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                    {
                      label: 'Average Groups',
                      data: [75, 78, 72, 76, 80, 77],
                      borderColor: '#690000',
                      backgroundColor: 'rgba(105, 0, 0, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#690000',
                      pointBorderColor: '#690000',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    }
                  ]
                }}
                chartOptions={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: { ...chartOptions.scales.y, max: 100 }
                  }
                }}
                legendItems={[
                  { color: '#830000', label: 'Your Group' },
                  { color: '#690000', label: 'Average' }
                ]}
              />
            </>
          )}
        </GridLayoutManager>
        </article>
      </section>

      {/* Chat Interface - Fixed at bottom but respects layout */}
      <aside className="fixed bottom-0 bg-secondary border-t border-primary/20 z-50 left-6 lg:left-70 right-6">
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
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  
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
        <footer className="p-4 border-t border-primary/20">
          <form onSubmit={handleMessageSubmit} className="flex items-center space-x-3">
            <fieldset className="flex-1 relative">
              <legend className="sr-only">Message Input</legend>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about scenarios..."
                className="w-full px-4 py-3 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary text-textcolor placeholder:text-textcolor/60"
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