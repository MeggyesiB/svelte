<script lang="ts">
	import { page } from '$app/stores'; 
    import Sidebar from '$lib/components/common/Sidebar.svelte';
    import '../app.css'; 

  
</script>

<div class="app-layout">
    <Sidebar />

    <main class="main-content">
        

        <div class="container">
            <slot />
        </div>
    </main>
</div>



<style>
    .app-layout {
        display: flex;
        min-height: 100vh; 
    }

    .main-content {
       
        padding: var(--spacing-4);
        flex-grow: 1; 
        width: 100%; 
        overflow-x: hidden; 
        
        background-color: var(--color-background); 
        
    }

   
    .container {
        width: 100%;
       
    }

   

    @media (max-width: 768px) {
        
        .app-layout {
             
             flex-direction: column;
        }
       
    }

    

</style> 