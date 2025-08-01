import { useState } from 'react';
import { Settings, GridView, Refresh, Save, Undo, Close } from '@mui/icons-material';

const LayoutControlPanel = ({ 
  onGridSizeChange, 
  onResetLayout, 
  onSaveLayout, 
  onUndoLayout,
  gridCols = 12,
  gridRows = 8,
  isOpen = false,
  onClose,
  className = ""
}) => {
  const [tempGridCols, setTempGridCols] = useState(gridCols);
  const [tempGridRows, setTempGridRows] = useState(gridRows);

  const handleApplyGridSize = () => {
    onGridSizeChange(tempGridCols, tempGridRows);
  };

  const presetLayouts = [
    { name: 'Small Grid', cols: 8, rows: 6 },
    { name: 'Default', cols: 12, rows: 8 },
    { name: 'Large Grid', cols: 16, rows: 10 },
    { name: 'Wide Layout', cols: 20, rows: 6 }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className={`bg-secondary border border-primary/20 rounded-lg shadow-2xl w-96 max-w-[90vw] ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/10">
            <div className="flex items-center space-x-2">
              <GridView className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium text-textcolor">Layout Controls</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-textcolor/60 hover:text-textcolor hover:bg-primary/10 rounded-full transition-colors"
            >
              <Close className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-textcolor">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onResetLayout}
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-2 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20 transition-colors"
                >
                  <Refresh className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={onSaveLayout}
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-2 bg-green/10 text-green text-xs rounded hover:bg-green/20 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={onUndoLayout}
                  className="flex flex-col items-center justify-center space-y-1 px-3 py-2 bg-accent/10 text-accent text-xs rounded hover:bg-accent/20 transition-colors"
                >
                  <Undo className="w-4 h-4" />
                  <span>Undo</span>
                </button>
              </div>
            </div>

            {/* Current Grid Info */}
            <div className="text-center text-sm text-textcolor/80 bg-primary/5 p-2 rounded">
              Current Grid: <strong>{gridCols} × {gridRows}</strong>
            </div>

            {/* Custom Grid Size */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-textcolor">Custom Grid Size</h3>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="block text-xs text-textcolor/60 mb-1">Columns</label>
                  <input
                    type="number"
                    min="6"
                    max="24"
                    value={tempGridCols}
                    onChange={(e) => setTempGridCols(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-primary/20 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-secondary text-textcolor"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-textcolor/60 mb-1">Rows</label>
                  <input
                    type="number"
                    min="4"
                    max="16"
                    value={tempGridRows}
                    onChange={(e) => setTempGridRows(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-primary/20 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-secondary text-textcolor"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyGridSize}
                className="w-full px-3 py-2 bg-primary text-secondary text-sm rounded hover:bg-shadow transition-colors"
              >
                Apply Grid Size
              </button>
            </div>

            {/* Preset Layouts */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-textcolor">Preset Layouts</h3>
              <div className="grid grid-cols-2 gap-2">
                {presetLayouts.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onGridSizeChange(preset.cols, preset.rows)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
                      gridCols === preset.cols && gridRows === preset.rows
                        ? 'bg-primary text-secondary'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs opacity-75">{preset.cols} × {preset.rows}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutControlPanel;
