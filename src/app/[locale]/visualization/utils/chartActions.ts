// src/utils/chartActions.ts
import { MutableRefObject } from 'react';
import { EChartsType } from 'echarts/core';
import { saveAs } from 'file-saver';

export const downloadChartAsSvg = (
    chartInstanceRef: MutableRefObject<EChartsType | null | undefined>,
    filename: string = 'chart'
) => {
    const instance = chartInstanceRef.current;
    if (!instance) {
        console.error("Chart instance not available for download.");
        alert("Could not download chart: Instance not ready.");
        return;
    }

    try {
        const svgDataUrl = instance.getDataURL({
            type: 'svg',
            pixelRatio: 2, // Higher resolution vector
            backgroundColor: '#fff', // Ensure background for viewing
            excludeComponents: ['toolbox'] // Exclude toolbox buttons from SVG
        });

        // Convert Data URL to Blob
        fetch(svgDataUrl)
            .then(res => res.blob())
            .then(blob => {
                 // Use file-saver to trigger download
                saveAs(blob, `${filename}.svg`);
            })
            .catch(error => {
                console.error("Error converting SVG data URL to Blob:", error);
                alert("Error preparing SVG file for download.");
            });

    } catch (error) {
        console.error("Error generating SVG data URL:", error);
        alert("Error creating SVG file. The chart might be too complex or in an invalid state.");
    }
};

// Fullscreen functionality will be handled by the react-fullscreen-crossbrowser component wrapper