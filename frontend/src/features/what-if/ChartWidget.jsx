
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
      // Line/bar/radar: assign color per dataset
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

  // Validate and auto-fix chart data for line, bar, radar
  const fixLineBarRadarDatasets = (labels, datasets) => {
    if (!Array.isArray(labels) || labels.length === 0 || !Array.isArray(datasets) || datasets.length === 0) return [];
    return datasets.map(ds => {
      let data = Array.isArray(ds.data) ? ds.data.slice(0, labels.length) : [];
      // Pad with nulls if too short
      if (data.length < labels.length) {
        data = [...data, ...Array(labels.length - data.length).fill(null)];
      }
      // Coerce to numbers or null
      data = data.map(v => (typeof v === 'number' ? v : (v == null ? null : Number(v))));
      return { ...ds, data };
    });
  };

  // Validate chart data for scatter
  const isValidScatter = (datasets) => {
    if (!Array.isArray(datasets) || datasets.length === 0) return false;
    return datasets.every(ds => Array.isArray(ds.data) && ds.data.every(point => point && typeof point.x === 'number' && typeof point.y === 'number'));
  };

  // Validate chart data for bubble
  const isValidBubble = (datasets) => {
    if (!Array.isArray(datasets) || datasets.length === 0) return false;
    return datasets.every(ds => Array.isArray(ds.data) && ds.data.every(point => point && typeof point.x === 'number' && typeof point.y === 'number' && typeof point.r === 'number'));
  };

  return (
    <div 
      className={`w-full h-full min-h-0 min-w-0 flex flex-col p-2 ${className}`}
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
            const labels = chartData.labels || [];
            const datasets = chartData.datasets || [];
            let coloredDatasets = getDatasetColors(datasets, type, labels);
            let props = {
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
              case 'line':
              case 'radar': {
                // Auto-fix datasets for line/bar/radar
                const fixedDatasets = fixLineBarRadarDatasets(labels, datasets);
                coloredDatasets = getDatasetColors(fixedDatasets, type, labels);
                props = {
                  ...props,
                  data: { ...chartData, datasets: coloredDatasets }
                };
                // If still no valid data, show error
                if (!coloredDatasets.length || coloredDatasets.every(ds => ds.data.every(v => v == null))) {
                  console.warn(`Invalid or empty data for ${type} chart`, chartData);
                  return <div className="text-xs text-red-500">No data for {type} chart</div>;
                }
                if (type === 'bar') return <Bar {...props} />;
                if (type === 'radar') return <Radar {...props} />;
                return <Line {...props} />;
              }
              case 'pie':
              case 'doughnut':
              case 'polarArea':
                // Pie/doughnut/polarArea: labels and datasets.data should match
                if (!Array.isArray(labels) || labels.length === 0 || !Array.isArray(datasets) || datasets.length === 0 || !Array.isArray(datasets[0].data) || datasets[0].data.length !== labels.length) {
                  console.warn(`Invalid data for ${type} chart`, chartData);
                  return <div className="text-xs text-red-500">Invalid data for {type} chart</div>;
                }
                if (type === 'pie') return <Pie {...props} />;
                if (type === 'doughnut') return <Doughnut {...props} />;
                return <PolarArea {...props} />;
              case 'scatter':
                if (!isValidScatter(datasets)) {
                  console.warn('Invalid data for scatter chart', chartData);
                  return <div className="text-xs text-red-500">Invalid data for scatter chart</div>;
                }
                return <Scatter {...props} />;
              case 'bubble':
                if (!isValidBubble(datasets)) {
                  console.warn('Invalid data for bubble chart', chartData);
                  return <div className="text-xs text-red-500">Invalid data for bubble chart</div>;
                }
                return <Bubble {...props} />;
              default:
                // Default to line chart with validation
                if (!isValidLineBarRadar(labels, datasets)) {
                  console.warn('Invalid data for line chart (default)', chartData);
                  return <div className="text-xs text-red-500">Invalid data for line chart</div>;
                }
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
