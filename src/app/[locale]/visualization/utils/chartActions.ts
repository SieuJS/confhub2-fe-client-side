// src/utils/chartActions.ts
import { MutableRefObject } from 'react';
import { EChartsType } from 'echarts/core';
import { saveAs } from 'file-saver'; // Ensure file-saver is installed: npm install file-saver @types/file-saver

const logPrefixCA = "[ChartActions]";

/**
 * Downloads the current state of an ECharts instance as an SVG file.
 *
 * @param chartInstanceRef - A React ref object containing the ECharts instance.
 * @param filename - The desired filename for the downloaded SVG (without extension). Defaults to 'chart'.
 */
export const downloadChartAsSvg = (
    chartInstanceRef: MutableRefObject<EChartsType | null | undefined>,
    filename: string = 'chart'
) => {
    console.log(`${logPrefixCA} Attempting to download chart as SVG: ${filename}.svg`);
    const instance = chartInstanceRef.current;

    // 1. Check if the instance exists
    if (!instance || typeof instance.getDataURL !== 'function') {
        console.error(`${logPrefixCA} Chart instance not available or doesn't support getDataURL.`);
        alert("Could not download chart: Instance not ready or invalid.");
        return;
    }

    try {
        // 2. Generate the SVG Data URL from the ECharts instance
        console.log(`${logPrefixCA} Generating SVG Data URL...`);
        const svgDataUrl = instance.getDataURL({
            type: 'svg',       // Specify SVG format
            pixelRatio: 2,     // Use a higher pixel ratio for potentially better quality in viewers (vector scales anyway)
            backgroundColor: '#fff', // Set a white background, otherwise it might be transparent
            excludeComponents: ['toolbox'] // Optional: Exclude components like the toolbox from the exported SVG
        });

        if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg+xml')) {
             console.error(`${logPrefixCA} Failed to generate valid SVG Data URL.`);
             alert("Error creating SVG file: Could not generate valid SVG data.");
             return;
        }

        // 3. Convert the Data URL to a Blob
        console.log(`${logPrefixCA} Converting Data URL to Blob...`);
        fetch(svgDataUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch SVG data: ${res.status} ${res.statusText}`);
                }
                return res.blob();
            })
            .then(blob => {
                // 4. Use file-saver to trigger the download
                console.log(`${logPrefixCA} Triggering download using file-saver...`);
                saveAs(blob, `${filename}.svg`);
                console.log(`${logPrefixCA} SVG download initiated successfully.`);
            })
            .catch(error => {
                console.error(`${logPrefixCA} Error converting SVG Data URL to Blob or saving:`, error);
                alert(`Error preparing SVG file for download: ${error instanceof Error ? error.message : String(error)}`);
            });

    } catch (error) {
        // Catch potential errors during getDataURL itself
        console.error(`${logPrefixCA} Error generating SVG Data URL:`, error);
        alert(`Error creating SVG file: ${error instanceof Error ? error.message : String(error)}.`);
    }
};

// Note: Fullscreen functionality previously mentioned is not handled here;
// it would typically be managed at the component level using browser APIs or libraries.