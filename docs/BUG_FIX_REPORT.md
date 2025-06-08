# Bug Fix Report: Double Horizontal Connection Lines in Hide Managers Mode

## Bug Description
When the "Hide Managers" mode was enabled in the organization chart, horizontal connection lines were being drawn twice, creating visible double lines between organizational boxes.

## Root Cause Analysis
The issue was caused by a **race condition and duplicate rendering** in the chart rendering pipeline:

1. **Initial Connection Drawing**: The `render()` method drew all connections with a 50ms delay using `setTimeout`
2. **Per-Node Redrawing**: Each organization box creation triggered a `requestAnimationFrame` callback that called `updateNodeActualHeight()`, which in turn called `redrawConnectionsForNode()` to redraw connections for that specific node
3. **Double Drawing**: This caused connection lines to be drawn twice:
   - First by the initial `setTimeout` (draws all connections)
   - Then by each `redrawConnectionsForNode()` call (redraws connections for each node)

### Why Hide Managers Mode Made It Worse
In Hide Managers mode, the boxes used dynamic heights (`height: auto` with `min-height: 35px`), making the height adjustment and redrawing more aggressive and noticeable.

## Files Modified
- `/src/js/chart-renderer.js`

## Changes Made

### 1. Added Connection Tracking System
```javascript
// In clearContainer()
clearContainer() {
    this.container.innerHTML = '';
    // 描画済み接続線の追跡をリセット
    this.drawnConnections = new Set();
}
```

### 2. Created Duplicate-Prevention Method
```javascript
createConnectionLineIfNotExists(connection) {
    const connectionId = `${connection.from.org}->${connection.to.org}`;
    
    // 既に描画済みの場合はスキップ
    if (this.drawnConnections && this.drawnConnections.has(connectionId)) {
        ConfigUtils.debugLog(`重複描画を防止: ${connectionId}`, 'render');
        return;
    }
    
    // 接続線を作成
    this.createConnectionLine(connection);
    
    // 描画済みとしてマーク
    if (this.drawnConnections) {
        this.drawnConnections.add(connectionId);
    }
    
    ConfigUtils.debugLog(`接続線を描画: ${connectionId}`, 'render');
}
```

### 3. Updated Initial Rendering
```javascript
// In render() method - uses the new duplicate-prevention method
setTimeout(() => {
    layout.connections.forEach(connection => {
        this.createConnectionLineIfNotExists(connection);
    });
}, 50);
```

### 4. Updated Node-Specific Redrawing
```javascript
// In redrawConnectionsForNode() - removes from tracking when deleting lines
connectionLines.forEach(line => {
    const fromOrg = line.getAttribute('data-from');
    const toOrg = line.getAttribute('data-to');
    if (fromOrg === updatedNode.org || toOrg === updatedNode.org) {
        line.remove();
        // 追跡セットからも削除
        if (this.drawnConnections) {
            this.drawnConnections.delete(`${fromOrg}->${toOrg}`);
        }
    }
});

// Uses duplicate-prevention method for redrawing
this.currentLayout.connections.forEach(connection => {
    if (connection.from.org === updatedNode.org || connection.to.org === updatedNode.org) {
        this.createConnectionLineIfNotExists(connection);
    }
});
```

## How the Fix Works

1. **Connection Tracking**: A `Set` tracks which connections have been drawn using a unique identifier (`fromOrg->toOrg`)
2. **Duplicate Prevention**: Before drawing any connection, the system checks if it's already been drawn
3. **Cleanup on Redraw**: When removing connection lines, they're also removed from the tracking set
4. **Reset on Chart Clear**: The tracking set is reset when the chart container is cleared

## Testing
A test file (`test_fix.html`) has been created to verify the fix. The test:
- Renders a sample organization chart
- Toggles Hide Managers mode
- Counts connection lines and checks for duplicates
- Logs results to the console

## Benefits
- ✅ Eliminates double horizontal connection lines in all modes
- ✅ Maintains proper visual appearance
- ✅ Prevents performance issues from redundant DOM elements
- ✅ Provides debug logging for troubleshooting
- ✅ Backward compatible with existing functionality

## Verification Steps
1. Open the organization chart tool
2. Enable "Hide Managers" mode
3. Verify that horizontal connection lines appear only once
4. Toggle between modes to ensure consistency
5. Check browser developer tools to confirm no duplicate DOM elements

The fix successfully resolves the double line rendering issue while maintaining all existing functionality.