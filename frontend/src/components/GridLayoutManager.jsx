import { useState, useRef, useEffect } from 'react';
import { DragIndicator } from '@mui/icons-material';

const GridLayoutManager = ({ 
  children, 
  gridCols = 12, 
  gridRows = 8, 
  onLayoutChange,
  onResize,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [shadowPreview, setShadowPreview] = useState(null);
  const [gridItems, setGridItems] = useState([]);
  const [resizeMode, setResizeMode] = useState('both'); // 'both', 'width-only', 'height-only', 'proportional'
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
        width: child.props.gridWidth || 1,
        height: child.props.gridHeight || 1,
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

  const checkOverlap = (item1, item2) => {
    const overlapX = Math.max(0, Math.min(item1.x + item1.width, item2.x + item2.width) - Math.max(item1.x, item2.x));
    const overlapY = Math.max(0, Math.min(item1.y + item1.height, item2.y + item2.height) - Math.max(item1.y, item2.y));
    const overlapArea = overlapX * overlapY;
    const item1Area = item1.width * item1.height;
    return overlapArea / item1Area;
  };

  const findSwapCandidate = (draggedItemPos) => {
    return gridItems.find(item => {
      if (item.id === draggedItemPos.id) return false;
      const overlapRatio = checkOverlap(draggedItemPos, item);
      return overlapRatio > 0.3; // 30% overlap threshold
    });
  };

  const findMaxResizeWithoutCollision = (item, targetWidth, targetHeight, itemId) => {
    let maxWidth = Math.min(targetWidth, gridCols - item.x);
    let maxHeight = Math.min(targetHeight, gridRows - item.y);
    
    // Check each other item to see how it constrains our resize
    gridItems.forEach(other => {
      if (other.id === itemId) return; // Skip self
      
      // Check horizontal constraint
      if (other.y < item.y + maxHeight && other.y + other.height > item.y) {
        // Items overlap vertically, check horizontal constraint
        if (other.x >= item.x && other.x < item.x + maxWidth) {
          // Other item is to the right and would be overlapped
          maxWidth = Math.min(maxWidth, other.x - item.x);
        }
      }
      
      // Check vertical constraint  
      if (other.x < item.x + maxWidth && other.x + other.width > item.x) {
        // Items overlap horizontally, check vertical constraint
        if (other.y >= item.y && other.y < item.y + maxHeight) {
          // Other item is below and would be overlapped
          maxHeight = Math.min(maxHeight, other.y - item.y);
        }
      }
    });
    
    return {
      width: Math.max(item.minWidth, maxWidth),
      height: Math.max(item.minHeight, maxHeight)
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
    const item = gridItems.find(i => i.id === itemId);
    if (!item) return;

    const startPos = getGridPosition(e.clientX, e.clientY);
    
    // Initialize draggedItem first before setting states
    const initialDraggedItem = { 
      id: itemId, 
      action, 
      startPos,
      startWidth: item.width,
      startHeight: item.height,
      startX: item.x,
      startY: item.y
    };
    
    setDraggedItem(initialDraggedItem);
    
    if (action === 'move') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
      
      // Detect resize mode based on mouse position within resize handle
      const resizeHandle = e.target;
      const handleRect = resizeHandle.getBoundingClientRect();
      const relativeX = e.clientX - handleRect.left;
      const relativeY = e.clientY - handleRect.top;
      const handleWidth = handleRect.width;
      const handleHeight = handleRect.height;
      
      // Determine resize mode based on position within handle
      if (e.shiftKey) {
        setResizeMode('proportional');
      } else if (e.altKey) {
        setResizeMode('width-only');
      } else if (e.ctrlKey || e.metaKey) {
        setResizeMode('height-only');
      } else if (relativeX < handleWidth * 0.3) {
        setResizeMode('height-only');
      } else if (relativeY < handleHeight * 0.3) {
        setResizeMode('width-only');
      } else {
        setResizeMode('both');
      }
    }
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentPos = getGridPosition(moveEvent.clientX, moveEvent.clientY);
      
      if (action === 'move') {
        const newX = Math.max(0, Math.min(gridCols - item.width, currentPos.x));
        const newY = Math.max(0, Math.min(gridRows - item.height, currentPos.y));
        
        const proposedPosition = {
          id: itemId,
          x: newX,
          y: newY,
          width: item.width,
          height: item.height
        };
        
        // Check for swap candidates
        const swapCandidate = findSwapCandidate(proposedPosition);
        let isValidMove = true;
        let swapInfo = null;
        
        if (swapCandidate) {
          // Potential swap detected
          swapInfo = {
            targetId: swapCandidate.id,
            targetOriginalPos: { x: swapCandidate.x, y: swapCandidate.y }
          };
          
          // Check if the swap is valid (both items can fit in their new positions)
          const draggedItemAtNewPos = { ...proposedPosition };
          const swapItemAtDraggedPos = { 
            ...swapCandidate, 
            x: item.x, 
            y: item.y 
          };
          
          // Temporarily remove both items to check collisions
          const otherItems = gridItems.filter(i => i.id !== itemId && i.id !== swapCandidate.id);
          const draggedCollision = otherItems.some(other => {
            const horizontalOverlap = !(draggedItemAtNewPos.x >= other.x + other.width || draggedItemAtNewPos.x + draggedItemAtNewPos.width <= other.x);
            const verticalOverlap = !(draggedItemAtNewPos.y >= other.y + other.height || draggedItemAtNewPos.y + draggedItemAtNewPos.height <= other.y);
            return horizontalOverlap && verticalOverlap;
          });
          
          const swapCollision = otherItems.some(other => {
            const horizontalOverlap = !(swapItemAtDraggedPos.x >= other.x + other.width || swapItemAtDraggedPos.x + swapItemAtDraggedPos.width <= other.x);
            const verticalOverlap = !(swapItemAtDraggedPos.y >= other.y + other.height || swapItemAtDraggedPos.y + swapItemAtDraggedPos.height <= other.y);
            return horizontalOverlap && verticalOverlap;
          });
          
          isValidMove = !draggedCollision && !swapCollision;
        } else {
          // No swap, just check regular collision
          isValidMove = !checkCollision(proposedPosition, itemId);
        }
        
        const preview = {
          id: itemId,
          x: newX,
          y: newY,
          width: item.width,
          height: item.height,
          isValid: isValidMove,
          isDragging: true,
          swapInfo
        };
        
        setShadowPreview(preview);
        shadowPreviewRef.current = preview;
      } else if (action === 'resize') {
        const deltaX = currentPos.x - startPos.x;
        const deltaY = currentPos.y - startPos.y;
        
        let newWidth = initialDraggedItem.startWidth;
        let newHeight = initialDraggedItem.startHeight;
        
        switch (resizeMode) {
          case 'width-only':
            newWidth = initialDraggedItem.startWidth + deltaX;
            break;
          case 'height-only':
            newHeight = initialDraggedItem.startHeight + deltaY;
            break;
          case 'proportional':
            const scale = Math.max(
              (initialDraggedItem.startWidth + deltaX) / initialDraggedItem.startWidth,
              (initialDraggedItem.startHeight + deltaY) / initialDraggedItem.startHeight
            );
            newWidth = Math.round(initialDraggedItem.startWidth * scale);
            newHeight = Math.round(initialDraggedItem.startHeight * scale);
            break;
          default: // 'both'
            newWidth = initialDraggedItem.startWidth + deltaX;
            newHeight = initialDraggedItem.startHeight + deltaY;
            break;
        }
        
        // Apply constraints: minimum size, maximum size, and grid bounds
        newWidth = Math.max(item.minWidth, Math.min(item.maxWidth, newWidth));
        newHeight = Math.max(item.minHeight, Math.min(item.maxHeight, newHeight));
        
        // Ensure the resized item doesn't go outside the grid bounds
        const maxWidthFromPosition = gridCols - item.x;
        const maxHeightFromPosition = gridRows - item.y;
        newWidth = Math.min(newWidth, maxWidthFromPosition);
        newHeight = Math.min(newHeight, maxHeightFromPosition);
        
        // Check for collisions with other items and find maximum allowed size
        const maxAllowed = findMaxResizeWithoutCollision(item, newWidth, newHeight, itemId);
        const finalWidth = Math.min(newWidth, maxAllowed.width);
        const finalHeight = Math.min(newHeight, maxAllowed.height);
        
        const preview = {
          id: itemId,
          x: item.x,
          y: item.y,
          width: finalWidth,
          height: finalHeight,
          isValid: finalWidth >= item.minWidth && finalHeight >= item.minHeight,
          resizeMode
        };
        
        setShadowPreview(preview);
        shadowPreviewRef.current = preview;
      }
    };

    const handleMouseUp = () => {
      const currentPreview = shadowPreviewRef.current;
      
      if (currentPreview && currentPreview.isValid) {
        
        if (currentPreview.swapInfo && action === 'move') {
          // Handle swap
          const { targetId, targetOriginalPos } = currentPreview.swapInfo;
          
          setGridItems(prev => prev.map(item => {
            if (item.id === itemId) {
              return { ...item, x: currentPreview.x, y: currentPreview.y };
            } else if (item.id === targetId) {
              return { ...item, x: targetOriginalPos.x, y: targetOriginalPos.y };
            }
            return item;
          }));
          
          if (onLayoutChange) {
            // Notify about both items changing positions
            onLayoutChange(itemId, {
              x: currentPreview.x,
              y: currentPreview.y,
              width: currentPreview.width,
              height: currentPreview.height
            }, true); // true indicates this was a swap
          }
        } else {
          // Handle regular move or resize
          setGridItems(prev => prev.map(item => 
            item.id === currentPreview.id 
              ? { ...item, x: currentPreview.x, y: currentPreview.y, width: currentPreview.width, height: currentPreview.height }
              : item
          ));
          
          if (action === 'resize' && onResize) {
            onResize(currentPreview.id, currentPreview.width, currentPreview.height, resizeMode);
          } else if (onLayoutChange) {
            onLayoutChange(currentPreview.id, {
              x: currentPreview.x,
              y: currentPreview.y,
              width: currentPreview.width,
              height: currentPreview.height
            }, currentPreview.isDragging);
          }
        }
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setDraggedItem(null);
      setShadowPreview(null);
      shadowPreviewRef.current = null;
      setResizeMode('both');
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const cellSize = getGridCellSize();

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={gridRef}
        className="grid overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          height: '100%',
          gap: '8px',
          padding: '8px'
        }}
      >
        {/* Shadow Preview */}
        {shadowPreview && (
          <div
            className={`absolute rounded-lg border-2 border-dashed transition-all duration-200 ${
              shadowPreview.isValid 
                ? 'border-green bg-green/10' 
                : 'border-primary bg-primary/10'
            } ${shadowPreview.isDragging ? 'shadow-lg' : ''}`}
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
                {shadowPreview.resizeMode && (
                  <div className="text-xs opacity-75 mt-1">
                    {shadowPreview.resizeMode === 'width-only' && 'Width Only'}
                    {shadowPreview.resizeMode === 'height-only' && 'Height Only'}
                    {shadowPreview.resizeMode === 'proportional' && 'Proportional'}
                    {shadowPreview.resizeMode === 'both' && 'Free Resize'}
                  </div>
                )}
                {shadowPreview.isDragging && !shadowPreview.swapInfo && (
                  <div className="text-xs opacity-75 mt-1">
                    Moving
                  </div>
                )}
                {shadowPreview.swapInfo && (
                  <div className="text-xs opacity-75 mt-1">
                    Swap with {shadowPreview.swapInfo.targetId}
                  </div>
                )}
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
            {/* Drag Handle - Only show on hover */}
            <div 
              className="absolute top-2 right-2 p-1.5 bg-primary/20 hover:bg-primary/30 rounded transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none"
              title="Drag to move"
            >
              <DragIndicator className="w-4 h-4 text-primary" />
            </div>

            {/* Resize Handle - Enhanced with multiple zones */}
            <div 
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary/30 hover:bg-primary/50 cursor-nw-resize transition-all duration-200 border-l-2 border-t-2 border-primary/40 opacity-0 group-hover:opacity-100 overflow-hidden"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item.id, 'resize');
              }}
              title="Drag to resize (Shift: proportional, Alt: width only, Ctrl: height only)"
              style={{
                borderTopLeftRadius: '0.5rem',
              }}
            >
              {/* Visual zones for different resize modes */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
                <div className="bg-primary/20 rounded-sm" title="Height only"></div>
                <div className="bg-primary/40 rounded-sm" title="Free resize"></div>
                <div className="bg-primary/20 rounded-sm" title="Width only"></div>
                <div className="bg-primary/60 rounded-sm" title="Corner resize"></div>
              </div>
              
              {/* Corner dots for visual feedback */}
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full opacity-60 transition-opacity"></div>
              <div className="absolute bottom-0.5 right-2 w-1 h-1 bg-primary rounded-full opacity-40 transition-opacity"></div>
              <div className="absolute bottom-2 right-0.5 w-1 h-1 bg-primary rounded-full opacity-40 transition-opacity"></div>
            </div>

            {/* Content Container */}
            <div 
              className="w-full h-full p-1 overflow-hidden pointer-events-none"
              style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}
            >
              <div className="pointer-events-auto w-full h-full">
                {item.component}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridLayoutManager;
