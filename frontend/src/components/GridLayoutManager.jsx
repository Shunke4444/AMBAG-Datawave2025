import { useState, useRef, useEffect } from 'react';
import { DragIndicator } from '@mui/icons-material';

const GridLayoutManager = ({ 
  children, 
  gridCols = 12, 
  gridRows = 8, 
  onLayoutChange,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [shadowPreview, setShadowPreview] = useState(null);
  const [gridItems, setGridItems] = useState([]);
  const gridRef = useRef(null);
  const shadowPreviewRef = useRef(null);

  // Initialize grid items from children
  useEffect(() => {
    if (children) {
      const items = Array.isArray(children) ? children : [children];
      const initialItems = items.map((child, index) => ({
        id: child.props.id || `item-${index}`,
        component: child,
        x: child.props.gridX || 0,
        y: child.props.gridY || 0,
        width: child.props.gridWidth || 6,
        height: child.props.gridHeight || 4,
        minWidth: child.props.minWidth || 3,
        minHeight: child.props.minHeight || 2,
        maxWidth: child.props.maxWidth || gridCols,
        maxHeight: child.props.maxHeight || gridRows
      }));
      setGridItems(initialItems);
    }
  }, [children, gridCols, gridRows]);

  const getGridCellSize = () => {
    if (!gridRef.current) return { width: 0, height: 0 };
    const rect = gridRef.current.getBoundingClientRect();
    // Account for padding (8px on each side) and gaps (8px between cells)
    const availableWidth = rect.width - 16; // 8px padding on each side
    const availableHeight = rect.height - 16; // 8px padding on each side
    const gapWidth = (gridCols - 1) * 8; // gaps between columns
    const gapHeight = (gridRows - 1) * 8; // gaps between rows
    
    return {
      width: (availableWidth - gapWidth) / gridCols,
      height: (availableHeight - gapHeight) / gridRows
    };
  };

  const getGridPosition = (clientX, clientY) => {
    if (!gridRef.current) return { x: 0, y: 0 };
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = getGridCellSize();
    
    // Account for padding in the calculation
    const x = Math.floor((clientX - rect.left - 8) / (cellSize.width + 8));
    const y = Math.floor((clientY - rect.top - 8) / (cellSize.height + 8));
    
    return {
      x: Math.max(0, Math.min(gridCols - 1, x)),
      y: Math.max(0, Math.min(gridRows - 1, y))
    };
  };

  const checkCollision = (item, excludeId = null) => {
    return gridItems.some(existing => {
      if (existing.id === excludeId) return false;
      
      const horizontalOverlap = !(item.x >= existing.x + existing.width || item.x + item.width <= existing.x);
      const verticalOverlap = !(item.y >= existing.y + existing.height || item.y + item.height <= existing.y);
      
      return horizontalOverlap && verticalOverlap;
    });
  };

  const findAvailablePosition = (width, height, excludeId = null) => {
    for (let y = 0; y <= gridRows - height; y++) {
      for (let x = 0; x <= gridCols - width; x++) {
        const testItem = { x, y, width, height };
        if (!checkCollision(testItem, excludeId)) {
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 }; // Fallback
  };

  const handleMouseDown = (e, itemId, action) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mouse down:', { itemId, action });
    const item = gridItems.find(i => i.id === itemId);
    if (!item) return;

    setIsDragging(true);
    const startPos = getGridPosition(e.clientX, e.clientY);
    console.log('Setting up drag:', { startPos, itemId, action });
    setDraggedItem({ 
      id: itemId, 
      action, 
      startPos,
      startWidth: item.width,
      startHeight: item.height,
      startX: item.x,
      startY: item.y
    });

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentPos = getGridPosition(moveEvent.clientX, moveEvent.clientY);
      console.log('Mouse move:', { action, currentPos, itemId });
      
      if (action === 'move') {
        const newX = Math.max(0, Math.min(gridCols - item.width, currentPos.x));
        const newY = Math.max(0, Math.min(gridRows - item.height, currentPos.y));
        
        console.log('Setting shadow preview:', { newX, newY, width: item.width, height: item.height });
        
        const preview = {
          id: itemId,
          x: newX,
          y: newY,
          width: item.width,
          height: item.height,
          isValid: !checkCollision({ x: newX, y: newY, width: item.width, height: item.height }, itemId)
        };
        
        setShadowPreview(preview);
        shadowPreviewRef.current = preview;
      } else if (action === 'resize') {
        const deltaX = currentPos.x - startPos.x;
        const deltaY = currentPos.y - startPos.y;
        
        const newWidth = Math.max(item.minWidth, Math.min(item.maxWidth, draggedItem.startWidth + deltaX));
        const newHeight = Math.max(item.minHeight, Math.min(item.maxHeight, draggedItem.startHeight + deltaY));
        
        // Ensure the resized item doesn't go out of bounds
        const constrainedWidth = Math.min(newWidth, gridCols - item.x);
        const constrainedHeight = Math.min(newHeight, gridRows - item.y);
        
        const preview = {
          id: itemId,
          x: item.x,
          y: item.y,
          width: constrainedWidth,
          height: constrainedHeight,
          isValid: !checkCollision({ x: item.x, y: item.y, width: constrainedWidth, height: constrainedHeight }, itemId)
        };
        
        setShadowPreview(preview);
        shadowPreviewRef.current = preview;
      }
    };

    const handleMouseUp = () => {
      const currentPreview = shadowPreviewRef.current;
      console.log('Mouse up - dragging finished:', { shadowPreview, currentPreview });
      
      if (currentPreview && currentPreview.isValid) {
        console.log('Applying position change:', currentPreview);
        setGridItems(prev => prev.map(item => 
          item.id === currentPreview.id 
            ? { ...item, x: currentPreview.x, y: currentPreview.y, width: currentPreview.width, height: currentPreview.height }
            : item
        ));
        
        if (onLayoutChange) {
          onLayoutChange(currentPreview.id, {
            x: currentPreview.x,
            y: currentPreview.y,
            width: currentPreview.width,
            height: currentPreview.height
          });
        }
      }
      
      setIsDragging(false);
      setDraggedItem(null);
      setShadowPreview(null);
      shadowPreviewRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    console.log('Event listeners added for:', action);
  };

  const cellSize = getGridCellSize();

  return (
    <div className={`relative ${className}`}>
      {/* Grid Background */}
      <div 
        ref={gridRef}
        className="grid border-2 border-primary/20 bg-secondary/50 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          minHeight: '600px',
          height: '100%',
          gap: '8px',
          padding: '8px'
        }}
      >
        {/* Grid cells for visual reference */}
        {Array.from({ length: gridCols * gridRows }).map((_, index) => (
          <div 
            key={index} 
            className="border border-primary/10 bg-transparent hover:bg-primary/5 transition-colors rounded"
          />
        ))}

        {/* Shadow Preview */}
        {shadowPreview && (
          <div
            className={`absolute rounded-lg border-2 border-dashed transition-all duration-200 ${
              shadowPreview.isValid 
                ? 'border-green bg-green/10' 
                : 'border-primary bg-primary/10'
            }`}
            style={{
              left: `calc(${(shadowPreview.x / gridCols) * 100}% + ${shadowPreview.x * 8 + 8}px)`,
              top: `calc(${(shadowPreview.y / gridRows) * 100}% + ${shadowPreview.y * 8 + 8}px)`,
              width: `calc(${(shadowPreview.width / gridCols) * 100}% - ${8 - (shadowPreview.width * 8 / gridCols)}px)`,
              height: `calc(${(shadowPreview.height / gridRows) * 100}% - ${8 - (shadowPreview.height * 8 / gridRows)}px)`,
              zIndex: 1000
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className={`text-sm font-medium ${
                shadowPreview.isValid ? 'text-green' : 'text-primary'
              }`}>
                {shadowPreview.width} × {shadowPreview.height}
              </span>
            </div>
          </div>
        )}

        {/* Rendered Grid Items */}
        {gridItems.map(item => (
          <div
            key={item.id}
            className={`absolute bg-secondary border border-primary/20 rounded-lg shadow-lg transition-all duration-200 group cursor-move ${
              isDragging && draggedItem?.id === item.id ? 'opacity-60 scale-105 shadow-2xl border-primary' : 'opacity-100'
            }`}
            style={{
              left: `calc(${(item.x / gridCols) * 100}% + ${item.x * 8 + 8}px)`,
              top: `calc(${(item.y / gridRows) * 100}% + ${item.y * 8 + 8}px)`,
              width: `calc(${(item.width / gridCols) * 100}% - ${8 - (item.width * 8 / gridCols)}px)`,
              height: `calc(${(item.height / gridRows) * 100}% - ${8 - (item.height * 8 / gridRows)}px)`,
              zIndex: isDragging && draggedItem?.id === item.id ? 999 : 1
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id, 'move')}
          >
            {/* Drag Handle - Visual indicator only */}
            <div 
              className="absolute top-2 right-2 p-1.5 bg-primary/20 hover:bg-primary/30 rounded transition-all duration-200 opacity-70 hover:opacity-100 pointer-events-none"
              title="Drag to move"
            >
              <DragIndicator className="w-4 h-4 text-primary" />
            </div>

            {/* Resize Handle */}
            <div 
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary/30 hover:bg-primary/50 cursor-nw-resize transition-all duration-200 border-l-2 border-t-2 border-primary/40 opacity-70 hover:opacity-100"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item.id, 'resize');
              }}
              title="Drag to resize"
              style={{
                borderTopLeftRadius: '0.5rem',
              }}
            >
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0.5 right-2 w-1 h-1 bg-primary rounded-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-2 right-0.5 w-1 h-1 bg-primary rounded-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
            </div>

            {/* Content Container */}
            <div 
              className="w-full h-full p-2 overflow-hidden pointer-events-none"
              style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}
            >
              <div className="pointer-events-auto w-full h-full">
                {item.component}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Information */}
      <div className="absolute bottom-2 left-2 text-xs text-textcolor/60 bg-secondary/80 px-2 py-1 rounded">
        {gridCols} × {gridRows} Grid
        {isDragging && shadowPreview && (
          <span className="ml-2">
            Position: ({shadowPreview.x}, {shadowPreview.y}) Size: {shadowPreview.width}×{shadowPreview.height}
          </span>
        )}
      </div>
    </div>
  );
};

export default GridLayoutManager;
