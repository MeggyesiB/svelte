<script lang="ts">
	
	import { page } from '$app/stores';
	import { formatCurrency } from '$lib/utils/formatters';

	
	let isCollapsed = false;

	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}

	const accountGroups = [
		{
			title: 'Credit Cards',
			accounts: [
				{ name: 'Credit Card', balance: 2000, color: '#ef4444' }, 
				{ name: 'Credit Card', balance: 1300, color: '#f59e0b' }  
			]
		},
		{
			title: 'Depository',
			accounts: [
				{ name: 'Checking', balance: 3000, color: '#3b82f6' }, 
				{ name: 'Savings', balance: 11500, color: '#10b981' }, 
				{ name: 'Adv Plus Banking', balance: 500, color: '#a855f7' } 
			]
		},
		{
			title: 'Investment',
			accounts: [
				 { name: 'Robinhood', balance: 13462, color: '#22c55e' }, 
				 { name: 'Coinbase', balance: 16731, color: '#0ea5e9' }  
			]
		}
	];
</script>

<aside class="sidebar" class:collapsed={isCollapsed}>
	<div class="sidebar-header">
		<h2 class="app-title">{!isCollapsed ? 'MyFinance' : ''}</h2>
		<button class="toggle-button" on:click={toggleSidebar} aria-label="Toggle sidebar">
			{#if isCollapsed}»{:else}«{/if}
		</button>
	</div>

	<nav class="main-nav">
		<ul>
			<li>
				<a href="/" class:active={$page.url.pathname === '/'} title="Irányítópult">
					 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
					<span class="link-text">Irányítópult</span>
				</a>
			</li>
			<li>
				<a href="/transactions" class:active={$page.url.pathname === '/transactions'} title="Tranzakciók">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
					<span class="link-text">Tranzakciók</span>
				</a>
			</li>
			<li>
				<a href="/categories" class:active={$page.url.pathname === '/categories'} title="Kategóriák">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
					<span class="link-text">Kategóriák</span>
				</a>
			</li>
		</ul>
	</nav>

</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-height: 100vh;
		background-color: var(--color-sidebar-background);
		color: var(--color-sidebar-text);
		padding: var(--spacing-6) var(--spacing-2);
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-sidebar-border);
		flex-shrink: 0;
        transition: width 0.3s ease; 
        overflow-x: hidden; 
	}

	.sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
		margin-bottom: var(--spacing-4);
		padding: 0 var(--spacing-4);
        min-width: 0;
	}

	.app-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-text);
		margin: 0;
        white-space: nowrap;
        overflow: hidden;
        transition: opacity 0.2s ease 0.1s; 
	}

    .toggle-button {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: 1.5rem; 
        line-height: 1;
        padding: var(--spacing-1);
        margin-left: var(--spacing-2);
        flex-shrink: 0; 
    }
    .toggle-button:hover {
        color: var(--color-text);
    }

	.main-nav {
		margin-bottom: var(--spacing-6);
	}

	.main-nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-05);
	}

	.main-nav li a {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		padding: var(--spacing-2) var(--spacing-4);
		color: var(--color-sidebar-text);
		text-decoration: none;
		border-radius: var(--border-radius);
		transition: background-color 0.2s ease, color 0.2s ease;
		font-weight: 500;
		font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
	}

	.link-text {
        transition: opacity 0.2s ease; 
    }

	.main-nav li a svg {
		 width: 18px;
		 height: 18px;
		 color: var(--color-sidebar-text);
		 transition: color 0.2s ease, margin 0.3s ease; 
		 flex-shrink: 0;
	}

    
	.main-nav li a:hover {
		background-color: var(--color-background-alt);
		color: var(--color-text);
	}
	.main-nav li a.active {
		background-color: var(--color-primary-background);
		color: var(--color-primary);
		font-weight: 600;
	}
	.main-nav li a:hover svg {
		color: var(--color-text);
	}
	.main-nav li a.active svg {
		color: var(--color-primary);
	}

    
    .sidebar.collapsed {
        width: var(--sidebar-width-collapsed);
    }

    .sidebar.collapsed .app-title,
    .sidebar.collapsed .link-text {
        opacity: 0;
        width: 0;
        visibility: hidden;
    }
    
     .sidebar.collapsed .sidebar-header,
     .sidebar.collapsed .main-nav li a {
         padding-left: 0;
         padding-right: 0;
         justify-content: center;
     }

     .sidebar.collapsed .main-nav li a {
         gap: 0;
     }
     .sidebar.collapsed .main-nav li a svg {
        margin: 0 auto; /* Center icon */
     }

</style> 