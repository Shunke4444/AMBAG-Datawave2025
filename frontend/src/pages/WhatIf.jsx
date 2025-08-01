import { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ArrowBack, Send, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import GridLayoutManager from '../components/GridLayoutManager';
import ChartWidget from '../components/ChartWidget';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WhatIf() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Month');
  const [inputValue, setInputValue] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [gridCols, setGridCols] = useState(12);
  const [gridRows, setGridRows] = useState(6);
  const [layoutHistory, setLayoutHistory] = useState([]);
  const [currentLayout, setCurrentLayout] = useState({
    mainChart: { x: 0, y: 0, width: 6, height: 3 },
    trendsChart: { x: 6, y: 0, width: 6, height: 3 },
    performanceChart: { x: 0, y: 3, width: 12, height: 3 }
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "What if I can't pay the ₱4,000 on time?",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      text: "Okay, let's walk through what could happen if you miss the ₱4,000 payment deadline:",
      sender: 'bot',
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Layout Management Functions
  const handleLayoutChange = (itemId, newLayout) => {
    setLayoutHistory(prev => [...prev, currentLayout]);
    setCurrentLayout(prev => ({
      ...prev,
      [itemId]: {
        x: newLayout.x,
        y: newLayout.y,
        width: newLayout.width,
        height: newLayout.height
      }
    }));
  };

  // Enhanced layout change with drag-to-swap detection
  const handleEnhancedLayoutChange = (itemId, newLayout, isDragging = false) => {
    if (isDragging) {
      // Check for swap opportunities when dragging
      const draggedChart = currentLayout[itemId];
      const otherCharts = Object.entries(currentLayout).filter(([id]) => id !== itemId);
      
      for (const [otherId, otherChart] of otherCharts) {
        // Check if dragged chart overlaps significantly with another chart
        const overlapX = Math.max(0, Math.min(newLayout.x + newLayout.width, otherChart.x + otherChart.width) - Math.max(newLayout.x, otherChart.x));
        const overlapY = Math.max(0, Math.min(newLayout.y + newLayout.height, otherChart.y + otherChart.height) - Math.max(newLayout.y, otherChart.y));
        const overlapArea = overlapX * overlapY;
        const draggedArea = newLayout.width * newLayout.height;
        const otherArea = otherChart.width * otherChart.height;
        
        // If overlap is significant (more than 30% of either chart), trigger swap
        if (overlapArea > Math.min(draggedArea, otherArea) * 0.3) {
          setLayoutHistory(prev => [...prev, currentLayout]);
          setCurrentLayout(prev => ({
            ...prev,
            [itemId]: { ...draggedChart, x: otherChart.x, y: otherChart.y },
            [otherId]: { ...otherChart, x: draggedChart.x, y: draggedChart.y }
          }));
          return; // Exit early, swap completed
        }
      }
    }
    
    // Normal layout change if no swap detected
    handleLayoutChange(itemId, newLayout);
  };

  // Smart resize with mouse direction detection
  const handleSmartResize = (itemId, newWidth, newHeight, resizeType = 'both') => {
    const chart = currentLayout[itemId];
    if (!chart) return;

    let finalWidth = newWidth;
    let finalHeight = newHeight;

    switch (resizeType) {
      case 'width-only':
        finalHeight = chart.height; // Keep height unchanged
        break;
      case 'height-only':
        finalWidth = chart.width; // Keep width unchanged
        break;
      case 'proportional':
        // Maintain aspect ratio
        const aspectRatio = chart.width / chart.height;
        if (Math.abs(newWidth - chart.width) > Math.abs(newHeight - chart.height)) {
          finalHeight = Math.round(newWidth / aspectRatio);
        } else {
          finalWidth = Math.round(newHeight * aspectRatio);
        }
        break;
      default:
        // 'both' - free resize
        break;
    }

    // Constrain to grid bounds and minimum sizes
    finalWidth = Math.max(3, Math.min(finalWidth, gridCols - chart.x));
    finalHeight = Math.max(2, Math.min(finalHeight, gridRows - chart.y));

    setLayoutHistory(prev => [...prev, currentLayout]);
    setCurrentLayout(prev => ({
      ...prev,
      [itemId]: {
        ...chart,
        width: finalWidth,
        height: finalHeight
      }
    }));
  };

  // Message handling functions

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load saved layout on component mount
  useEffect(() => {
    const savedLayoutData = localStorage.getItem('whatif-layout');
    if (savedLayoutData) {
      try {
        const { layout, gridCols: savedCols, gridRows: savedRows } = JSON.parse(savedLayoutData);
        setCurrentLayout(layout);
        setGridCols(savedCols);
        setGridRows(savedRows);
      } catch (error) {
        console.error('Error loading saved layout:', error);
      }
    }
  }, []);

  // Chart data
  const chartData = {
    labels: ['1 Oct', '3 Oct', '5 Oct', '7 Oct', '9 Oct', '10 Oct'],
    datasets: [
      {
        label: 'Payment if not sent',
        data: [2, 3, 4, 2, 1, 4],
        borderColor: '#830000', // Primary red
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
        borderColor: '#DDB440', // Accent yellow
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
        backgroundColor: '#FBFAF9', // Secondary color
        titleColor: '#1B1C1E', // Text color
        bodyColor: '#1B1C1E',
        borderColor: '#830000', // Primary color
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
          color: '#1B1C1E', // Text color
          font: {
            size: 12,
            weight: '500'
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(131, 0, 0, 0.1)', // Light primary color
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#1B1C1E', // Text color
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      // Simulate bot response
      setTimeout(() => {
        const botResponse = generateBotResponse(inputValue);
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('visual') || lowerInput.includes('simulation') || lowerInput.includes('yes') || lowerInput.includes('oo')) {
      return "Great! I'll generate a visual simulation. Based on your payment patterns, here's what I can show you:\n\n📈 If you delay the ₱4,000 payment by 1 week, your next 3 contributions will need to increase by ₱500 each to stay on track.\n\n📊 Alternative: You could extend the timeline by 2 weeks and keep the same contribution amounts.\n\nWhich option would you prefer to explore further?";
    } else if (lowerInput.includes('extend') || lowerInput.includes('timeline')) {
      return "Timeline extension is a good strategy! Here are your options:\n\n⏰ Option 1: Extend by 2 weeks - keep same amounts\n⏰ Option 2: Extend by 1 month - reduce future contributions by ₱300 each\n⏰ Option 3: Flexible schedule - pay when you can, goal completion by December\n\nWhich timeline works best for your current situation?";
    } else if (lowerInput.includes('increase') || lowerInput.includes('more')) {
      return "I understand you're considering increasing contributions. Let me analyze this:\n\n💰 If you increase by ₱500/month: Goal completed 6 weeks earlier\n💰 If you increase by ₱1000/month: Goal completed 3 months earlier\n\n⚠️ But consider your cash flow - sustainable amounts are better than aggressive targets that might cause stress.\n\nWhat's your comfortable maximum monthly contribution?";
    } else if (lowerInput.includes('help') || lowerInput.includes('advice')) {
      return "Here's my personalized advice based on your financial profile:\n\n✅ Priority: Build a ₱2,000 emergency buffer first\n✅ Strategy: Set up automatic transfers on your payday\n✅ Backup: Have 2-3 alternative payment dates ready\n\nRemember, consistency beats perfection. Better to contribute steadily than to stress about perfect timing!";
    } else {
      return "I can help you explore different scenarios for your group payments. Try asking about:\n\n• Visual simulations of payment impacts\n• Timeline extensions or adjustments\n• Increasing or decreasing contribution amounts\n• Emergency backup plans\n\nWhat would you like to analyze first?";
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col overflow-hidden px-6">
      {/* Header */}
      <header className="flex items-center justify-between py-4 text-secondary flex-shrink-0 border-b border-shadow">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-shadow rounded-full transition-colors"
          >
            <ArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">What-If Scenarios</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Period Tabs */}
          <div className="flex bg-secondary rounded-full p-1 border border-primary/20">
            {['Day', 'Week', 'Month', 'Year'].map((period) => (
              <button
                key={period}
                onClick={() => setActiveTab(period)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeTab === period
                    ? 'bg-primary text-secondary'
                    : 'text-textcolor hover:text-primary'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area with Grid */}
      <div className="h-[75vh] py-4 pb-24">
        <div className="w-[70vw] mx-auto h-full">
          <GridLayoutManager
            gridCols={gridCols}
            gridRows={gridRows}
            onLayoutChange={handleEnhancedLayoutChange}
            onResize={handleSmartResize}
            className="h-full w-full"
          >
          {/* Main Payment Analysis Chart */}
          <ChartWidget
            id="mainChart"
            gridX={currentLayout.mainChart.x}
            gridY={currentLayout.mainChart.y}
            gridWidth={currentLayout.mainChart.width}
            gridHeight={currentLayout.mainChart.height}
            minWidth={3}
            minHeight={2}
            title="Payment Analysis"
            chartData={chartData}
            chartOptions={chartOptions}
            legendItems={[
              { color: '#830000', label: 'Payment if not sent' },
              { color: '#DDB440', label: 'Actual Payment' }
            ]}
          />

          {/* Payment Trends Chart */}
          <ChartWidget
            id="trendsChart"
            gridX={currentLayout.trendsChart.x}
            gridY={currentLayout.trendsChart.y}
            gridWidth={currentLayout.trendsChart.width}
            gridHeight={currentLayout.trendsChart.height}
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

          {/* Group Performance Chart */}
          <ChartWidget
            id="performanceChart"
            gridX={currentLayout.performanceChart.x}
            gridY={currentLayout.performanceChart.y}
            gridWidth={currentLayout.performanceChart.width}
            gridHeight={currentLayout.performanceChart.height}
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
        </GridLayoutManager>
        </div>
      </div>

      {/* Chat Interface - Fixed at bottom but respects layout */}
      <div className="fixed bottom-0 bg-secondary border-t border-primary/20 z-50 left-6 lg:left-70 right-6">
        {/* Chat Header with Toggle */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-secondary text-sm font-medium">$</span>
            </div>
            <div>
              <h3 className="font-medium text-textcolor">
                {messages.length > 0 && messages[0].sender === 'user' 
                  ? messages[0].text.slice(0, 40) + (messages[0].text.length > 40 ? '...' : '')
                  : 'Financial Assistant'
                }
              </h3>
            </div>
          </div>
          
          <button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            className="p-2 text-textcolor/60 hover:text-textcolor transition-colors"
            aria-label={isChatExpanded ? "Minimize chat" : "Expand chat"}
          >
            {isChatExpanded ? <ExpandMore className="w-5 h-5" /> : <ExpandLess className="w-5 h-5" />}
          </button>
        </div>

        {/* Chat Messages Container - Only show when expanded */}
        {isChatExpanded && (
          <div className="px-4 border-t border-primary/20" style={{ height: '50vh' }}>
            <div className="h-full overflow-y-auto space-y-4 py-4">
              {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-medium">$</span>
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary text-secondary'
                    : 'bg-secondary border border-primary/20 text-textcolor'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  
                  {message.details && (
                    <div className="mt-3 space-y-3">
                      {message.details.map((detail, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-accent font-medium">{detail.icon}</span>
                          <p className="text-sm text-textcolor/80">{detail.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-secondary/70' : 'text-textcolor/60'
                  }`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-secondary text-sm font-medium">$</span>
                </div>
                <div className="bg-secondary border border-primary/20 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
              )}
              
              {/* Quick Action Buttons - Only show when expanded and few messages */}
              {messages.length <= 2 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setInputValue("Show me visual simulation")}
                    className="px-3 py-2 bg-primary/10 text-primary rounded-full text-xs hover:bg-primary/20 transition-colors"
                  >
                    📊 Visual Simulation
                  </button>
                  <button
                    onClick={() => setInputValue("What if I increase my contribution?")}
                    className="px-3 py-2 bg-accent/10 text-accent rounded-full text-xs hover:bg-accent/20 transition-colors"
                  >
                    💰 Increase Amount
                  </button>
                  <button
                    onClick={() => setInputValue("Can I extend the timeline?")}
                    className="px-3 py-2 bg-green/10 text-green rounded-full text-xs hover:bg-green/20 transition-colors"
                  >
                    ⏰ Extend Timeline
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area - Always visible */}
        <div className="p-4 border-t border-primary/20">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about scenarios..."
                className="w-full px-4 py-3 border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary text-textcolor placeholder:text-textcolor/60"
              />
            </div>
            
            <button
              type="submit"
              className="p-2 bg-primary text-secondary rounded-full hover:bg-shadow transition-colors disabled:opacity-50"
              disabled={!inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}