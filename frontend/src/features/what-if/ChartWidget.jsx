import { Line, Bar, Pie } from 'react-chartjs-2';
import { useState } from 'react';

const ChartWidget = ({ 
  title, 
  chartData, 
  chartOptions, 
  chartType = 'line',
  chartjsConfig,
  legendItems = [],
  className = "",
  onDataChange
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // If chartjsConfig is provided, use that for the chart
  const finalChartData = chartjsConfig ? chartjsConfig.data : chartData;
  const finalChartOptions = chartjsConfig ? chartjsConfig.options : chartOptions;
  const finalChartType = chartjsConfig ? chartjsConfig.type : chartType;

  // Select the appropriate Chart component
  const getChartComponent = () => {
    switch (finalChartType.toLowerCase()) {
      case 'bar':
        return Bar;
      case 'pie':
        return Pie;
      case 'line':
      default:
        return Line;
    }
  };

  const ChartComponent = getChartComponent();

  return (
    <div 
      className={`w-full h-full flex flex-col p-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-textcolor truncate">{title}</h3>
          
          {/* Legend */}
          {legendItems.length > 0 && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-textcolor/80 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 relative">
        <div className="w-full h-full p-1">
          <ChartComponent 
            data={finalChartData} 
            options={{
              ...finalChartOptions,
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                ...finalChartOptions?.plugins,
                legend: {
                  display: false
                }
              }
            }} 
          />
        </div>

        {/* Hover Overlay for Interaction */}
        {isHovered && onDataChange && (
          <div className="absolute inset-0 bg-primary/5 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={onDataChange}
              className="px-3 py-1 bg-primary text-secondary text-xs rounded-full hover:bg-shadow transition-colors"
            >
              Edit Data
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartWidget;
