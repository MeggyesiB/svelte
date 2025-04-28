<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration, ChartType } from 'chart.js';

    
    export let chartConfig: ChartConfiguration | null = null;
    export let type: ChartType = 'line'; 
    export let data: any = undefined;
    export let options: any = undefined;
    export let width: string | number | undefined = undefined;
    export let height: string | number | undefined = undefined;
    export let fallbackMessage = "Nincs megjeleníthető adat.";

    
    let canvasElement: HTMLCanvasElement;
    let chartInstance: Chart | null = null;
    let hasData = false;

    
    function updateChart() {
        if (!canvasElement) return;
        
       
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        
        let config = chartConfig;
        if (!config && data) {
            config = { 
                type, 
                data, 
                options: options || {} 
            };
        }
        
        
        hasData = false;
        if (config && config.data && config.data.datasets) {
            for (let i = 0; i < config.data.datasets.length; i++) {
                let dataset = config.data.datasets[i];
                if (dataset.data && dataset.data.length > 0) {
                    hasData = true;
                    break;
                }
            }
        }


        if (hasData && config) {
            try {
                chartInstance = new Chart(canvasElement, config);
            } catch (error) {
                hasData = false;
            }
        }
    }

    
    $: {
        if (canvasElement && (chartConfig || data)) {
            updateChart();
        }
    }

    
    onMount(() => {
        if ((chartConfig || data) && canvasElement) {
            updateChart();
        }
    });

    
    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
</script>

<div class="chart-wrapper">
    <div class="chart-container" style:visibility={hasData ? 'visible' : 'hidden'}>
        <canvas bind:this={canvasElement} {width} {height}></canvas>
    </div>
    
    {#if !hasData}
        <p class="fallback">{fallbackMessage}</p>
    {/if}
</div>

<style>
    .chart-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 300px;
    }
    
    .chart-container {
        height: 100%;
        width: 100%;
    }
    
    .fallback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: var(--color-text-muted);
        padding: var(--spacing-4);
    }
    
    canvas {
        display: block;
        max-width: 100%;
        height: auto;
    }
</style>
