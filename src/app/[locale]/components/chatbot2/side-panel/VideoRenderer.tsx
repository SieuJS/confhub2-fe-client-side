// VideoRenderer.tsx
import React, { forwardRef } from 'react';

const VideoRenderer = forwardRef<HTMLCanvasElement>((props, ref) => {
    return <canvas style={{ display: 'none' }} ref={ref} />;
});
VideoRenderer.displayName = 'VideoRenderer';
export default VideoRenderer;