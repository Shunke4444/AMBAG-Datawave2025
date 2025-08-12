
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import { useState } from 'react';

// Color palette for charts
const COLOR_PALETTE = [
  '#830000', '#DDB440', '#008383', '#4B5320', '#C0C0C0', '#E4572E', '#17BEBB', '#FFC914', '#2E282A', '#76B041', '#A259F7', '#F76E11', '#3A6EA5', '#F9AFAE', '#F4D35E', '#EE964B', '#F95738'
];

const ChartWidget = ({ 
  title, 
  chartData, 
  chartOptions, 
  type,
  legendItems = [],
  className = "",
  onDataChange
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper to assign colors from palette if not provided or not enough
  const getDatasetColors = (datasets, type, labels) => {
    if (type === 'pie' || type === 'doughnut' || type === 'polarArea') {
      // Pie/doughnut: assign color per data point
      return datasets.map((d, i) => {
        let colors = d.color;
        if (!colors || !Array.isArray(colors) || colors.length < (d.data?.length || 0)) {
          colors = labels.map((_, idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]);
        }
        return {
          ...d,
          backgroundColor: colors,
          borderColor: colors,
        };
      });
    } else {
      // Line/bar: assign color per dataset
      return datasets.map((d, i) => {
        const color = d.color || COLOR_PALETTE[i % COLOR_PALETTE.length];
        return {
          ...d,
          borderColor: color,
          backgroundColor: color + '20',
          pointBackgroundColor: color,
          pointBorderColor: color,
        };
      });
    }
  };

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
          {/* Render chart based on type */}
          {(() => {
            // Assign colors for readability
            const coloredDatasets = getDatasetColors(chartData.datasets || [], type, chartData.labels || []);
            const props = {
              data: {
                ...chartData,
                datasets: coloredDatasets
              },
              options: {
                ...chartOptions,
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: false }
                }
              }
            };
            switch (type) {
              case 'bar':
                return <Bar {...props} />;
              case 'pie':
                return <Pie {...props} />;
              case 'doughnut':
                return <Doughnut {...props} />;
              case 'radar':
                return <Radar {...props} />;
              case 'polarArea':
                return <PolarArea {...props} />;
              case 'scatter':
                return <Scatter {...props} />;
              case 'bubble':
                return <Bubble {...props} />;
              default:
                return <Line {...props} />;
            }
          })()}
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
