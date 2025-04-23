<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import Chart from 'chart.js/auto'; // Import Chart.js
    import type { ChartConfiguration, ChartType, ChartData, ChartOptions, ChartItem } from 'chart.js';

   
    export let type: ChartType = 'line'; 
    export let data: ChartData;
    export let options: ChartOptions | undefined = undefined;
    export let width: string | number | undefined = undefined;
    export let height: string | number | undefined = undefined;

    let canvasElement: HTMLCanvasElement;
    let chartInstance: Chart | null = null;

    function renderChart() {
        if (!canvasElement || !data) return;

       
        if (chartInstance) {
            chartInstance.destAroy();
            chartInstance = null;
        }

        
        const config: ChartConfiguration = {
            type: type,
            data: data,
            options: options || {} 
        };

     
        try {
            chartInstance = new Chart(canvasElement, config);
        } catch (error) {
            console.error("Error creating chart:", error);
        }
    }

    onMount(() => {
        renderChart();
    });

   
    afterUpdate(() => {
        if (chartInstance && (chartInstance.config.data !== data || chartInstance.config.options !== options)) {
             chartInstance.data = data;
             if (options) {
                 chartInstance.options = options;
             }
             chartInstance.update();
        }
    });

    
    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    });

</script>

<div class="chart-wrapper">
    <canvas bind:this={canvasElement} {width} {height}></canvas>
</div>

<style>
    .chart-wrapper {
        position: relative; 
        width: 100%; 
    }
    
    canvas {
        display: block;
        max-width: 100%; 
        height: auto; 
    }
</style> 