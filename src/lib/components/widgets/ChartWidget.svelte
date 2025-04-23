<script lang="ts">
    import { onMount, onDestroy, type ComponentProps } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration } from 'chart.js/auto';
    import Card from '$lib/components/Card.svelte';

    export let title: string;
    export let chartConfig: ChartConfiguration | null = null; 
    export let fallbackMessage: string = "Nincs megjeleníthető adat.";
    export let class_ = "";

    let canvasElement: HTMLCanvasElement;
    let chartInstance: Chart | null = null;

    
    function updateChart(config: ChartConfiguration | null) {
        if (!canvasElement) return; 
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

       
        if (config && config.data && config.data.datasets.some(ds => ds.data && ds.data.length > 0)) {
            chartInstance = new Chart(canvasElement, config);
        } else {
            
        }
    }

    
    $: {
      
        if (canvasElement) { 
            updateChart(chartConfig);
        }
    }

    onMount(() => {
       
        if (chartConfig && canvasElement) {
             updateChart(chartConfig);
        }
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

   
    type $$Slots = {
        controls?: {}; 
    }

</script>

<Card {title} {class_}>
    {#if $$slots.controls}
        <div class="card-controls">
            <slot name="controls" />
        </div>
    {/if}
    <div class="chart-container">
      
        <canvas bind:this={canvasElement}></canvas>
       
        {#if !chartInstance && (!chartConfig || !chartConfig.data || !chartConfig.data.datasets.some(ds => ds.data && ds.data.length > 0))}
            <p>{fallbackMessage}</p>
        {/if}
    </div>
</Card>

<style>
    .chart-container {
        position: relative;
        min-height: 300px; 
        height: 100%;
        width: 100%;
    }
    p {
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
       visibility: visible;
    }
   
</style> 