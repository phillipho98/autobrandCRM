/**
 * AutoBrand CRM Application
 * Client management for n8n automation services
 */

// ==================== DATA STORE ====================
const store = {
    leads: [],
    deals: [],
    clients: [],
    services: [],
    tasks: [],
    activities: [],
    settings: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
    }
};

// Default services for automation business
const defaultServices = [
    {
        id: 'svc-1',
        name: 'Stream Announcements',
        description: 'Automated stream announcements to Discord, Twitter, and other platforms when you go live.',
        price: 149,
        period: 'month',
        features: [
            'Multi-platform posting',
            'Custom templates',
            'Schedule-aware timing',
            'Engagement tracking'
        ],
        clientCount: 0
    },
    {
        id: 'svc-2',
        name: 'Content Repurposing',
        description: 'Automatically clip highlights and distribute to YouTube Shorts, TikTok, and Instagram Reels.',
        price: 299,
        period: 'month',
        features: [
            'AI clip detection',
            'Auto-captioning',
            'Platform optimization',
            'Scheduling queue'
        ],
        clientCount: 0
    },
    {
        id: 'svc-3',
        name: 'Community Automation',
        description: 'Discord bot setup with welcome messages, role management, and engagement features.',
        price: 199,
        period: 'month',
        features: [
            'Welcome sequences',
            'Role automation',
            'Mod tools',
            'Analytics dashboard'
        ],
        clientCount: 0
    },
    {
        id: 'svc-4',
        name: 'Full Stack Automation',
        description: 'Complete automation suite: stream alerts, content repurposing, community management, and analytics.',
        price: 599,
        period: 'month',
        features: [
            'All services included',
            'Priority support',
            'Custom workflows',
            'Weekly analytics reports'
        ],
        clientCount: 0
    }
];

// ==================== UTILITY FUNCTIONS ====================

function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: store.settings.currency,
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
}

function getTierFromScore(score) {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
}

function getTierEmoji(tier) {
    const emojis = { hot: '🔥', warm: '🟡', cold: '🔵' };
    return emojis[tier] || '';
}

// ==================== LOCAL STORAGE ====================

function saveToStorage() {
    localStorage.setItem('autobrand-crm', JSON.stringify(store));
}

function loadFromStorage() {
    const saved = localStorage.getItem('autobrand-crm');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(store, parsed);
    }
    
    // Initialize services if empty
    if (store.services.length === 0) {
        store.services = defaultServices;
        saveToStorage();
    }
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    toast.querySelector('.toast-close').onclick = () => toast.remove();
    setTimeout(() => toast.remove(), 5000);
}

// ==================== NAVIGATION ====================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const cardLinks = document.querySelectorAll('.card-link');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            navigateTo(view);
        });
    });
    
    cardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            navigateTo(view);
        });
    });
}

function navigateTo(viewName) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Show/hide views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    
    // Refresh view content
    switch (viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'leads':
            renderLeadsTable();
            break;
        case 'pipeline':
            renderPipeline();
            break;
        case 'clients':
            renderClients();
            break;
        case 'services':
            renderServices();
            break;
        case 'tasks':
            renderTasks();
            break;
    }
}

// ==================== DASHBOARD ====================

function renderDashboard() {
    updateKPIs();
    renderPipelineOverview();
    renderHotLeads();
    renderUpcomingTasks();
    renderActivityFeed();
}

function updateKPIs() {
    const totalLeads = store.leads.length;
    const activeDeals = store.deals.filter(d => !['won', 'lost'].includes(d.stage)).length;
    const dealValue = store.deals.filter(d => !['won', 'lost'].includes(d.stage))
        .reduce((sum, d) => sum + (d.value || 0), 0);
    const activeClients = store.clients.filter(c => c.status === 'active').length;
    const mrr = store.clients
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + (c.mrr || 0), 0);
    
    document.getElementById('kpi-total-leads').textContent = totalLeads;
    document.getElementById('kpi-active-deals').textContent = activeDeals;
    document.getElementById('kpi-deals-value').textContent = formatCurrency(dealValue);
    document.getElementById('kpi-active-clients').textContent = activeClients;
    document.getElementById('kpi-mrr').textContent = formatCurrency(mrr);
    
    // Update nav badges
    document.getElementById('leads-count').textContent = totalLeads;
    document.getElementById('clients-count').textContent = activeClients;
    
    const pendingTasks = store.tasks.filter(t => t.status === 'pending').length;
    document.getElementById('tasks-count').textContent = pendingTasks;
    document.getElementById('tasks-count').classList.toggle('urgent', pendingTasks > 0);
}

function renderPipelineOverview() {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];
    const container = document.getElementById('pipeline-stages');
    
    container.innerHTML = stages.map(stage => {
        const stageDeals = store.deals.filter(d => d.stage === stage);
        const count = stageDeals.length;
        const value = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        
        return `
            <div class="pipeline-stage-card">
                <div class="stage-name">${stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
                <div class="stage-count">${count}</div>
                <div class="stage-value">${formatCurrency(value)}</div>
            </div>
        `;
    }).join('');
}

function renderHotLeads() {
    const container = document.getElementById('hot-leads-list');
    const hotLeads = store.leads
        .filter(l => l.tier === 'hot' && l.status !== 'unqualified')
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    if (hotLeads.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
                <p style="color: var(--color-text-subtle);">No hot leads yet. Import leads from the scraper!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = hotLeads.map(lead => `
        <div class="lead-item" data-id="${lead.id}" onclick="openLeadModal('${lead.id}')">
            <div class="lead-avatar">${getInitials(lead.name)}</div>
            <div class="lead-info">
                <div class="lead-name">${lead.name}</div>
                <div class="lead-meta">${lead.platform || 'Twitch'} • ${formatNumber(lead.followers)} followers</div>
            </div>
            <div class="lead-score hot">${getTierEmoji('hot')} ${lead.score}</div>
        </div>
    `).join('');
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function renderUpcomingTasks() {
    const container = document.getElementById('upcoming-tasks-list');
    const now = new Date();
    const upcomingTasks = store.tasks
        .filter(t => t.status === 'pending')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    
    if (upcomingTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
                <p style="color: var(--color-text-subtle);">No pending tasks</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcomingTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now;
        
        return `
            <div class="task-item" data-id="${task.id}">
                <div class="task-checkbox ${task.status === 'completed' ? 'completed' : ''}" onclick="toggleTask('${task.id}')">
                    ${task.status === 'completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? 'Overdue: ' : ''}${formatDate(task.dueDate)}</div>
                </div>
                <span class="task-type">${task.type}</span>
            </div>
        `;
    }).join('');
}

function renderActivityFeed() {
    const container = document.getElementById('activity-list');
    const activities = store.activities.slice(0, 8);
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
                <p style="color: var(--color-text-subtle);">No recent activity</p>
            </div>
        `;
        return;
    }
    
    const icons = {
        lead_added: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
        lead_contacted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        deal_created: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
        deal_moved: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 004 4h12"/></svg>',
        client_added: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        task_completed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${icons[activity.type] || icons.lead_added}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${formatRelativeTime(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function addActivity(type, text) {
    store.activities.unshift({
        id: generateId(),
        type,
        text,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 activities
    if (store.activities.length > 50) {
        store.activities = store.activities.slice(0, 50);
    }
    
    saveToStorage();
}

// ==================== LEADS ====================

let leadsPage = 1;
const leadsPerPage = 15;

function renderLeadsTable() {
    const tbody = document.getElementById('leads-table-body');
    const tierFilter = document.getElementById('leads-tier-filter').value;
    const statusFilter = document.getElementById('leads-status-filter').value;
    const sourceFilter = document.getElementById('leads-source-filter').value;
    
    let filteredLeads = [...store.leads];
    
    if (tierFilter !== 'all') {
        filteredLeads = filteredLeads.filter(l => l.tier === tierFilter);
    }
    if (statusFilter !== 'all') {
        filteredLeads = filteredLeads.filter(l => l.status === statusFilter);
    }
    if (sourceFilter !== 'all') {
        filteredLeads = filteredLeads.filter(l => l.source === sourceFilter);
    }
    
    // Sort by score descending
    filteredLeads.sort((a, b) => b.score - a.score);
    
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    const start = (leadsPage - 1) * leadsPerPage;
    const pageLeads = filteredLeads.slice(start, start + leadsPerPage);
    
    if (pageLeads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 48px;">
                    <div class="empty-state" style="padding: 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 16px;">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        <h3>No leads found</h3>
                        <p>Import leads from your Twitch scraper or add manually</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageLeads.map(lead => {
        const scoreClass = lead.score >= 70 ? 'high' : (lead.score >= 40 ? 'medium' : 'low');
        
        return `
            <tr data-id="${lead.id}">
                <td><input type="checkbox" class="lead-checkbox" data-id="${lead.id}"></td>
                <td>
                    <div class="cell-name">
                        <div class="cell-avatar">${getInitials(lead.name)}</div>
                        <div>
                            <div style="font-weight: 500;">${lead.name}</div>
                            <div style="font-size: 0.8rem; color: var(--color-text-subtle);">${lead.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cell-platform">
                        ${getPlatformIcon(lead.platform)}
                        ${lead.platform || 'Twitch'}
                    </div>
                </td>
                <td>
                    <span class="tier-badge ${lead.tier}">${getTierEmoji(lead.tier)} ${lead.tier}</span>
                </td>
                <td>
                    <div class="score-bar">
                        <div class="score-fill">
                            <div class="score-fill-inner ${scoreClass}" style="width: ${lead.score}%"></div>
                        </div>
                        <span>${lead.score}</span>
                    </div>
                </td>
                <td>${formatNumber(lead.followers)}</td>
                <td>
                    <span class="status-badge ${lead.status}">${lead.status}</span>
                </td>
                <td>${lead.lastContact ? formatRelativeTime(lead.lastContact) : '-'}</td>
                <td>
                    <div class="cell-actions">
                        <button class="action-btn" onclick="openLeadModal('${lead.id}')" title="View/Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="createDealFromLead('${lead.id}')" title="Create Deal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="deleteLead('${lead.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderLeadsPagination(filteredLeads.length, totalPages);
}

function getPlatformIcon(platform) {
    const icons = {
        'Twitch': '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
        'YouTube': '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        'Instagram': '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
    };
    return icons[platform] || icons['Twitch'];
}

function renderLeadsPagination(total, totalPages) {
    const container = document.getElementById('leads-pagination');
    const start = (leadsPage - 1) * leadsPerPage + 1;
    const end = Math.min(leadsPage * leadsPerPage, total);
    
    container.innerHTML = `
        <div class="pagination-info">Showing ${start}-${end} of ${total} leads</div>
        <div class="pagination-controls">
            <button class="pagination-btn" onclick="changeLeadsPage(${leadsPage - 1})" ${leadsPage === 1 ? 'disabled' : ''}>Previous</button>
            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return `<button class="pagination-btn ${page === leadsPage ? 'active' : ''}" onclick="changeLeadsPage(${page})">${page}</button>`;
            }).join('')}
            <button class="pagination-btn" onclick="changeLeadsPage(${leadsPage + 1})" ${leadsPage === totalPages ? 'disabled' : ''}>Next</button>
        </div>
    `;
}

function changeLeadsPage(page) {
    leadsPage = page;
    renderLeadsTable();
}

function openLeadModal(leadId) {
    const lead = store.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Edit Lead';
    body.innerHTML = `
        <form id="lead-form" data-id="${lead.id}">
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${lead.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${lead.email || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Platform</label>
                    <select name="platform">
                        <option value="Twitch" ${lead.platform === 'Twitch' ? 'selected' : ''}>Twitch</option>
                        <option value="YouTube" ${lead.platform === 'YouTube' ? 'selected' : ''}>YouTube</option>
                        <option value="Instagram" ${lead.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="replied" ${lead.status === 'replied' ? 'selected' : ''}>Replied</option>
                        <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="unqualified" ${lead.status === 'unqualified' ? 'selected' : ''}>Unqualified</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Followers</label>
                    <input type="number" name="followers" value="${lead.followers || 0}">
                </div>
                <div class="form-group">
                    <label>Lead Score</label>
                    <input type="number" name="score" value="${lead.score || 0}" min="0" max="100">
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3">${lead.notes || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Social Links</label>
                <input type="url" name="twitchUrl" placeholder="Twitch URL" value="${lead.twitchUrl || ''}" style="margin-bottom: 8px;">
                <input type="url" name="twitter" placeholder="Twitter/X URL" value="${lead.twitter || ''}" style="margin-bottom: 8px;">
                <input type="url" name="discord" placeholder="Discord URL" value="${lead.discord || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Save Changes</button>
            </div>
        </form>
    `;
    
    document.getElementById('lead-form').onsubmit = handleLeadFormSubmit;
    overlay.classList.add('active');
}

function handleLeadFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const leadId = form.dataset.id;
    const lead = store.leads.find(l => l.id === leadId);
    
    if (lead) {
        const formData = new FormData(form);
        lead.name = formData.get('name');
        lead.email = formData.get('email');
        lead.platform = formData.get('platform');
        lead.status = formData.get('status');
        lead.followers = parseInt(formData.get('followers')) || 0;
        lead.score = parseInt(formData.get('score')) || 0;
        lead.tier = getTierFromScore(lead.score);
        lead.notes = formData.get('notes');
        lead.twitchUrl = formData.get('twitchUrl');
        lead.twitter = formData.get('twitter');
        lead.discord = formData.get('discord');
        lead.updatedAt = new Date().toISOString();
        
        saveToStorage();
        closeModal();
        renderLeadsTable();
        showToast('Lead updated successfully', 'success');
    }
}

function addNewLead() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Add New Lead';
    body.innerHTML = `
        <form id="new-lead-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required placeholder="Channel/Creator name">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="business@email.com">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Platform</label>
                    <select name="platform">
                        <option value="Twitch">Twitch</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Instagram">Instagram</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Source</label>
                    <select name="source">
                        <option value="scraper">Twitch Scraper</option>
                        <option value="referral">Referral</option>
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Followers</label>
                    <input type="number" name="followers" value="0" min="0">
                </div>
                <div class="form-group">
                    <label>Lead Score (0-100)</label>
                    <input type="number" name="score" value="50" min="0" max="100">
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3" placeholder="Add any relevant notes..."></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Add Lead</button>
            </div>
        </form>
    `;
    
    document.getElementById('new-lead-form').onsubmit = handleNewLeadSubmit;
    overlay.classList.add('active');
}

function handleNewLeadSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const score = parseInt(formData.get('score')) || 50;
    const newLead = {
        id: generateId(),
        name: formData.get('name'),
        email: formData.get('email'),
        platform: formData.get('platform'),
        source: formData.get('source'),
        followers: parseInt(formData.get('followers')) || 0,
        score: score,
        tier: getTierFromScore(score),
        status: 'new',
        notes: formData.get('notes'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    store.leads.unshift(newLead);
    saveToStorage();
    closeModal();
    renderLeadsTable();
    updateKPIs();
    addActivity('lead_added', `New lead <strong>${newLead.name}</strong> was added`);
    showToast('Lead added successfully', 'success');
}

function deleteLead(leadId) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    const lead = store.leads.find(l => l.id === leadId);
    store.leads = store.leads.filter(l => l.id !== leadId);
    saveToStorage();
    renderLeadsTable();
    updateKPIs();
    showToast('Lead deleted', 'info');
}

function createDealFromLead(leadId) {
    const lead = store.leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Create Deal';
    body.innerHTML = `
        <form id="deal-form">
            <input type="hidden" name="leadId" value="${lead.id}">
            <div class="form-group">
                <label>Deal Name</label>
                <input type="text" name="name" value="${lead.name} - Automation Package" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Service</label>
                    <select name="serviceId">
                        ${store.services.map(s => `<option value="${s.id}">${s.name} (${formatCurrency(s.price)}/${s.period})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Deal Value</label>
                    <input type="number" name="value" value="${store.services[0]?.price || 199}" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3" placeholder="Deal notes..."></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Create Deal</button>
            </div>
        </form>
    `;
    
    document.getElementById('deal-form').onsubmit = handleDealFormSubmit;
    overlay.classList.add('active');
}

function handleDealFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const leadId = formData.get('leadId');
    const lead = store.leads.find(l => l.id === leadId);
    const service = store.services.find(s => s.id === formData.get('serviceId'));
    
    const newDeal = {
        id: generateId(),
        leadId: leadId,
        name: formData.get('name'),
        serviceId: formData.get('serviceId'),
        serviceName: service?.name || 'Custom',
        value: parseInt(formData.get('value')) || 0,
        stage: 'lead',
        notes: formData.get('notes'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    store.deals.push(newDeal);
    
    // Update lead status
    if (lead) {
        lead.status = 'qualified';
        lead.updatedAt = new Date().toISOString();
    }
    
    saveToStorage();
    closeModal();
    renderLeadsTable();
    renderPipeline();
    updateKPIs();
    addActivity('deal_created', `New deal <strong>${newDeal.name}</strong> created (${formatCurrency(newDeal.value)})`);
    showToast('Deal created successfully', 'success');
}

// ==================== PIPELINE ====================

function renderPipeline() {
    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    
    stages.forEach(stage => {
        const column = document.querySelector(`.column-cards[data-stage="${stage}"]`);
        const header = document.querySelector(`.pipeline-column[data-stage="${stage}"] .column-header`);
        const stageDeals = store.deals.filter(d => d.stage === stage);
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        
        // Update header counts
        header.querySelector('.stage-count').textContent = stageDeals.length;
        header.querySelector('.stage-value').textContent = formatCurrency(stageValue);
        
        // Render cards
        column.innerHTML = stageDeals.map(deal => {
            const lead = store.leads.find(l => l.id === deal.leadId);
            return `
                <div class="deal-card" draggable="true" data-id="${deal.id}">
                    <div class="deal-header">
                        <div class="deal-name">${deal.name}</div>
                        <div class="deal-value">${formatCurrency(deal.value)}</div>
                    </div>
                    <div class="deal-meta">
                        <span class="deal-service">${deal.serviceName || 'Service'}</span>
                    </div>
                    <div class="deal-footer">
                        <div class="deal-owner">
                            <div class="owner-avatar" style="background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary)); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: var(--color-bg);">
                                ${getInitials(lead?.name || deal.name)}
                            </div>
                            ${lead?.name || deal.name}
                        </div>
                        <div class="deal-date">${formatDate(deal.createdAt)}</div>
                    </div>
                </div>
            `;
        }).join('');
    });
    
    initDragAndDrop();
}

function initDragAndDrop() {
    const cards = document.querySelectorAll('.deal-card');
    const columns = document.querySelectorAll('.column-cards');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.dataset.id);
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        card.addEventListener('click', () => {
            openDealModal(card.dataset.id);
        });
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.style.background = 'rgba(34, 211, 238, 0.05)';
        });
        
        column.addEventListener('dragleave', () => {
            column.style.background = '';
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.style.background = '';
            
            const dealId = e.dataTransfer.getData('text/plain');
            const newStage = column.dataset.stage;
            
            moveDeal(dealId, newStage);
        });
    });
}

function moveDeal(dealId, newStage) {
    const deal = store.deals.find(d => d.id === dealId);
    if (!deal) return;
    
    const oldStage = deal.stage;
    deal.stage = newStage;
    deal.updatedAt = new Date().toISOString();
    
    saveToStorage();
    renderPipeline();
    updateKPIs();
    
    if (newStage === 'won') {
        // Convert to client
        const lead = store.leads.find(l => l.id === deal.leadId);
        if (lead && !store.clients.find(c => c.leadId === lead.id)) {
            convertToClient(deal);
        }
        addActivity('deal_moved', `Deal <strong>${deal.name}</strong> was WON! 🎉`);
        showToast('Congratulations! Deal won! 🎉', 'success');
    } else if (newStage === 'lost') {
        addActivity('deal_moved', `Deal <strong>${deal.name}</strong> was lost`);
        showToast('Deal marked as lost', 'info');
    } else if (oldStage !== newStage) {
        addActivity('deal_moved', `<strong>${deal.name}</strong> moved to ${newStage}`);
    }
}

function openDealModal(dealId) {
    const deal = store.deals.find(d => d.id === dealId);
    if (!deal) return;
    
    const lead = store.leads.find(l => l.id === deal.leadId);
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Deal Details';
    body.innerHTML = `
        <form id="edit-deal-form" data-id="${deal.id}">
            <div class="form-group">
                <label>Deal Name</label>
                <input type="text" name="name" value="${deal.name}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Stage</label>
                    <select name="stage">
                        <option value="lead" ${deal.stage === 'lead' ? 'selected' : ''}>Lead</option>
                        <option value="qualified" ${deal.stage === 'qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="proposal" ${deal.stage === 'proposal' ? 'selected' : ''}>Proposal</option>
                        <option value="negotiation" ${deal.stage === 'negotiation' ? 'selected' : ''}>Negotiation</option>
                        <option value="won" ${deal.stage === 'won' ? 'selected' : ''}>Won</option>
                        <option value="lost" ${deal.stage === 'lost' ? 'selected' : ''}>Lost</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Deal Value</label>
                    <input type="number" name="value" value="${deal.value}" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Service</label>
                <select name="serviceId">
                    ${store.services.map(s => `<option value="${s.id}" ${s.id === deal.serviceId ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3">${deal.notes || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" style="margin-right: auto; color: var(--color-error);" onclick="deleteDeal('${deal.id}')">Delete Deal</button>
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Save Changes</button>
            </div>
        </form>
    `;
    
    document.getElementById('edit-deal-form').onsubmit = handleEditDealSubmit;
    overlay.classList.add('active');
}

function handleEditDealSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const dealId = form.dataset.id;
    const deal = store.deals.find(d => d.id === dealId);
    
    if (deal) {
        const formData = new FormData(form);
        const oldStage = deal.stage;
        const newStage = formData.get('stage');
        
        deal.name = formData.get('name');
        deal.stage = newStage;
        deal.value = parseInt(formData.get('value')) || 0;
        deal.serviceId = formData.get('serviceId');
        deal.serviceName = store.services.find(s => s.id === deal.serviceId)?.name || 'Service';
        deal.notes = formData.get('notes');
        deal.updatedAt = new Date().toISOString();
        
        if (newStage === 'won' && oldStage !== 'won') {
            convertToClient(deal);
        }
        
        saveToStorage();
        closeModal();
        renderPipeline();
        updateKPIs();
        showToast('Deal updated', 'success');
    }
}

function deleteDeal(dealId) {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    store.deals = store.deals.filter(d => d.id !== dealId);
    saveToStorage();
    closeModal();
    renderPipeline();
    updateKPIs();
    showToast('Deal deleted', 'info');
}

function convertToClient(deal) {
    const lead = store.leads.find(l => l.id === deal.leadId);
    const service = store.services.find(s => s.id === deal.serviceId);
    
    const newClient = {
        id: generateId(),
        leadId: deal.leadId,
        dealId: deal.id,
        name: lead?.name || deal.name,
        email: lead?.email || '',
        platform: lead?.platform || 'Twitch',
        status: 'onboarding',
        services: [deal.serviceId],
        mrr: deal.value,
        startDate: new Date().toISOString(),
        notes: deal.notes
    };
    
    store.clients.push(newClient);
    
    if (service) {
        service.clientCount = (service.clientCount || 0) + 1;
    }
    
    // Create onboarding task
    store.tasks.push({
        id: generateId(),
        title: `Onboard ${newClient.name}`,
        type: 'onboarding',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        relatedTo: newClient.id,
        relatedType: 'client'
    });
    
    saveToStorage();
    addActivity('client_added', `New client <strong>${newClient.name}</strong> was added! 🎉`);
}

// ==================== CLIENTS ====================

function renderClients() {
    const container = document.getElementById('clients-grid');
    const statusFilter = document.getElementById('clients-status-filter').value;
    const serviceFilter = document.getElementById('clients-service-filter').value;
    
    let filteredClients = [...store.clients];
    
    if (statusFilter !== 'all') {
        filteredClients = filteredClients.filter(c => c.status === statusFilter);
    }
    if (serviceFilter !== 'all') {
        filteredClients = filteredClients.filter(c => c.services?.includes(serviceFilter));
    }
    
    // Update service filter options
    const serviceSelect = document.getElementById('clients-service-filter');
    serviceSelect.innerHTML = `
        <option value="all">All Services</option>
        ${store.services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
    `;
    
    if (filteredClients.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <h3>No clients yet</h3>
                <p>Win some deals and they'll appear here!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredClients.map(client => {
        const lead = store.leads.find(l => l.id === client.leadId);
        const clientServices = client.services?.map(sid => store.services.find(s => s.id === sid)?.name).filter(Boolean) || [];
        
        return `
            <div class="client-card" onclick="openClientModal('${client.id}')">
                <div class="client-header">
                    <div class="client-avatar">${getInitials(client.name)}</div>
                    <div class="client-info">
                        <h4>${client.name}</h4>
                        <div class="client-platform">
                            ${getPlatformIcon(client.platform)}
                            ${client.platform}
                        </div>
                    </div>
                    <span class="client-status ${client.status}">${client.status}</span>
                </div>
                <div class="client-services">
                    ${clientServices.map(s => `<span class="client-service-tag">${s}</span>`).join('')}
                </div>
                <div class="client-stats">
                    <div class="client-stat">
                        <span class="client-stat-value">${formatCurrency(client.mrr)}</span>
                        <span class="client-stat-label">Monthly</span>
                    </div>
                    <div class="client-stat">
                        <span class="client-stat-value">${formatNumber(lead?.followers || 0)}</span>
                        <span class="client-stat-label">Followers</span>
                    </div>
                    <div class="client-stat">
                        <span class="client-stat-value">${client.startDate ? Math.floor((Date.now() - new Date(client.startDate)) / (1000 * 60 * 60 * 24)) : 0}d</span>
                        <span class="client-stat-label">Since Start</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openClientModal(clientId) {
    const client = store.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Client Details';
    body.innerHTML = `
        <form id="client-form" data-id="${client.id}">
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${client.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${client.email || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="onboarding" ${client.status === 'onboarding' ? 'selected' : ''}>Onboarding</option>
                        <option value="active" ${client.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="paused" ${client.status === 'paused' ? 'selected' : ''}>Paused</option>
                        <option value="churned" ${client.status === 'churned' ? 'selected' : ''}>Churned</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Monthly Revenue</label>
                    <input type="number" name="mrr" value="${client.mrr || 0}" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="3">${client.notes || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Save Changes</button>
            </div>
        </form>
    `;
    
    document.getElementById('client-form').onsubmit = handleClientFormSubmit;
    overlay.classList.add('active');
}

function handleClientFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const clientId = form.dataset.id;
    const client = store.clients.find(c => c.id === clientId);
    
    if (client) {
        const formData = new FormData(form);
        client.name = formData.get('name');
        client.email = formData.get('email');
        client.status = formData.get('status');
        client.mrr = parseInt(formData.get('mrr')) || 0;
        client.notes = formData.get('notes');
        
        saveToStorage();
        closeModal();
        renderClients();
        updateKPIs();
        showToast('Client updated', 'success');
    }
}

// ==================== SERVICES ====================

function renderServices() {
    const container = document.getElementById('services-grid');
    
    container.innerHTML = store.services.map(service => `
        <div class="service-card" onclick="openServiceModal('${service.id}')">
            <h3 class="service-name">${service.name}</h3>
            <p class="service-description">${service.description}</p>
            <div class="service-pricing">
                <span class="service-price">${formatCurrency(service.price)}</span>
                <span class="service-period">/${service.period}</span>
            </div>
            <div class="service-features">
                ${service.features.map(f => `
                    <div class="service-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        ${f}
                    </div>
                `).join('')}
            </div>
            <div class="service-clients">${service.clientCount || 0} active clients</div>
        </div>
    `).join('');
}

function openServiceModal(serviceId) {
    const service = store.services.find(s => s.id === serviceId);
    if (!service) return;
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Edit Service';
    body.innerHTML = `
        <form id="service-form" data-id="${service.id}">
            <div class="form-group">
                <label>Service Name</label>
                <input type="text" name="name" value="${service.name}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="2">${service.description}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" name="price" value="${service.price}" min="0">
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <select name="period">
                        <option value="month" ${service.period === 'month' ? 'selected' : ''}>Monthly</option>
                        <option value="year" ${service.period === 'year' ? 'selected' : ''}>Yearly</option>
                        <option value="one-time" ${service.period === 'one-time' ? 'selected' : ''}>One-time</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Features (one per line)</label>
                <textarea name="features" rows="4">${service.features.join('\n')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Save Changes</button>
            </div>
        </form>
    `;
    
    document.getElementById('service-form').onsubmit = handleServiceFormSubmit;
    overlay.classList.add('active');
}

function handleServiceFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const serviceId = form.dataset.id;
    const service = store.services.find(s => s.id === serviceId);
    
    if (service) {
        const formData = new FormData(form);
        service.name = formData.get('name');
        service.description = formData.get('description');
        service.price = parseInt(formData.get('price')) || 0;
        service.period = formData.get('period');
        service.features = formData.get('features').split('\n').filter(f => f.trim());
        
        saveToStorage();
        closeModal();
        renderServices();
        showToast('Service updated', 'success');
    }
}

function addNewService() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Add New Service';
    body.innerHTML = `
        <form id="new-service-form">
            <div class="form-group">
                <label>Service Name</label>
                <input type="text" name="name" required placeholder="e.g., Social Media Automation">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="2" placeholder="What does this service include?"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" name="price" value="199" min="0">
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <select name="period">
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                        <option value="one-time">One-time</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Features (one per line)</label>
                <textarea name="features" rows="4" placeholder="Feature 1\nFeature 2\nFeature 3"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Add Service</button>
            </div>
        </form>
    `;
    
    document.getElementById('new-service-form').onsubmit = handleNewServiceSubmit;
    overlay.classList.add('active');
}

function handleNewServiceSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const newService = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseInt(formData.get('price')) || 0,
        period: formData.get('period'),
        features: formData.get('features').split('\n').filter(f => f.trim()),
        clientCount: 0
    };
    
    store.services.push(newService);
    saveToStorage();
    closeModal();
    renderServices();
    showToast('Service added', 'success');
}

// ==================== TASKS ====================

function renderTasks() {
    const typeFilter = document.getElementById('tasks-type-filter').value;
    const statusFilter = document.getElementById('tasks-status-filter').value;
    
    let filteredTasks = [...store.tasks];
    
    if (typeFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.type === typeFilter);
    }
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const overdue = filteredTasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < today);
    const todayTasks = filteredTasks.filter(t => {
        const due = new Date(t.dueDate);
        return t.status === 'pending' && due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });
    const weekTasks = filteredTasks.filter(t => {
        const due = new Date(t.dueDate);
        return t.status === 'pending' && due >= new Date(today.getTime() + 24 * 60 * 60 * 1000) && due < weekEnd;
    });
    const laterTasks = filteredTasks.filter(t => {
        const due = new Date(t.dueDate);
        return t.status === 'pending' && due >= weekEnd;
    });
    
    renderTaskSection('overdue-tasks', overdue);
    renderTaskSection('today-tasks', todayTasks);
    renderTaskSection('week-tasks', weekTasks);
    renderTaskSection('later-tasks', laterTasks);
}

function renderTaskSection(containerId, tasks) {
    const container = document.getElementById(containerId);
    
    if (tasks.length === 0) {
        container.innerHTML = `<div class="tasks-empty">No tasks</div>`;
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item-full" data-id="${task.id}">
            <div class="task-checkbox ${task.status === 'completed' ? 'completed' : ''}" onclick="toggleTask('${task.id}')">
                ${task.status === 'completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <div class="task-main">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-type">${task.type}</span>
                    <span>Due: ${formatDate(task.dueDate)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="editTask('${task.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="action-btn" onclick="deleteTask('${task.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleTask(taskId) {
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    
    if (task.status === 'completed') {
        addActivity('task_completed', `Task <strong>${task.title}</strong> completed`);
    }
    
    saveToStorage();
    renderTasks();
    renderDashboard();
}

function addNewTask() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    title.textContent = 'Add New Task';
    body.innerHTML = `
        <form id="new-task-form">
            <div class="form-group">
                <label>Task Title</label>
                <input type="text" name="title" required placeholder="What needs to be done?">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="type">
                        <option value="follow-up">Follow-up</option>
                        <option value="outreach">Outreach</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="support">Support</option>
                        <option value="meeting">Meeting</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" value="${tomorrowStr}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Related To (optional)</label>
                <select name="relatedTo">
                    <option value="">-- None --</option>
                    <optgroup label="Leads">
                        ${store.leads.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Clients">
                        ${store.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </optgroup>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Add Task</button>
            </div>
        </form>
    `;
    
    document.getElementById('new-task-form').onsubmit = handleNewTaskSubmit;
    overlay.classList.add('active');
}

function handleNewTaskSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const newTask = {
        id: generateId(),
        title: formData.get('title'),
        type: formData.get('type'),
        status: 'pending',
        dueDate: formData.get('dueDate'),
        relatedTo: formData.get('relatedTo') || null,
        createdAt: new Date().toISOString()
    };
    
    store.tasks.push(newTask);
    saveToStorage();
    closeModal();
    renderTasks();
    updateKPIs();
    showToast('Task added', 'success');
}

function editTask(taskId) {
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Edit Task';
    body.innerHTML = `
        <form id="edit-task-form" data-id="${task.id}">
            <div class="form-group">
                <label>Task Title</label>
                <input type="text" name="title" value="${task.title}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="type">
                        <option value="follow-up" ${task.type === 'follow-up' ? 'selected' : ''}>Follow-up</option>
                        <option value="outreach" ${task.type === 'outreach' ? 'selected' : ''}>Outreach</option>
                        <option value="onboarding" ${task.type === 'onboarding' ? 'selected' : ''}>Onboarding</option>
                        <option value="support" ${task.type === 'support' ? 'selected' : ''}>Support</option>
                        <option value="meeting" ${task.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" value="${task.dueDate?.split('T')[0] || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Save Changes</button>
            </div>
        </form>
    `;
    
    document.getElementById('edit-task-form').onsubmit = handleEditTaskSubmit;
    overlay.classList.add('active');
}

function handleEditTaskSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const taskId = form.dataset.id;
    const task = store.tasks.find(t => t.id === taskId);
    
    if (task) {
        const formData = new FormData(form);
        task.title = formData.get('title');
        task.type = formData.get('type');
        task.dueDate = formData.get('dueDate');
        task.status = formData.get('status');
        
        saveToStorage();
        closeModal();
        renderTasks();
        updateKPIs();
        showToast('Task updated', 'success');
    }
}

function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    
    store.tasks = store.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    renderTasks();
    updateKPIs();
    showToast('Task deleted', 'info');
}

// ==================== IMPORT LEADS ====================

function initImportModal() {
    const overlay = document.getElementById('import-modal-overlay');
    const closeBtn = document.getElementById('import-modal-close');
    const dropzone = document.getElementById('import-dropzone');
    const fileInput = document.getElementById('import-file-input');
    const cancelBtn = document.getElementById('import-cancel');
    const confirmBtn = document.getElementById('import-confirm');
    
    document.getElementById('import-leads-btn').onclick = () => {
        overlay.classList.add('active');
    };
    
    closeBtn.onclick = () => {
        overlay.classList.remove('active');
        resetImport();
    };
    
    cancelBtn.onclick = () => {
        resetImport();
    };
    
    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) processImportFile(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processImportFile(file);
    });
    
    confirmBtn.onclick = confirmImport;
}

let pendingImportLeads = [];

function processImportFile(file) {
    if (!file.name.endsWith('.csv')) {
        showToast('Please upload a CSV file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const csv = e.target.result;
        const leads = parseCSV(csv);
        
        if (leads.length === 0) {
            showToast('No valid leads found in file', 'error');
            return;
        }
        
        pendingImportLeads = leads;
        
        // Show preview
        document.getElementById('import-dropzone').style.display = 'none';
        document.getElementById('import-preview').style.display = 'block';
        document.getElementById('import-summary').textContent = `Found ${leads.length} leads ready to import. ${leads.filter(l => l.tier === 'hot').length} hot, ${leads.filter(l => l.tier === 'warm').length} warm, ${leads.filter(l => l.tier === 'cold').length} cold.`;
    };
    
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const leads = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle CSV properly (quoted fields with commas)
        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx]?.replace(/^["']|["']$/g, '').trim() || '';
        });
        
        // Map from Twitch scraper format
        const score = parseInt(row['lead score'] || row['score'] || '50') || 50;
        
        const lead = {
            id: generateId(),
            name: row['display name'] || row['login'] || row['name'] || 'Unknown',
            email: row['business email'] || row['email'] || '',
            platform: 'Twitch',
            source: 'scraper',
            followers: parseInt(row['followers'] || '0') || 0,
            avgViewers: parseInt(row['avg viewers'] || '0') || 0,
            score: score,
            tier: getTierFromScore(score),
            status: 'new',
            broadcasterType: row['broadcaster type'] || '',
            primaryGame: row['primary game'] || '',
            twitter: row['twitter'] || '',
            youtube: row['youtube'] || '',
            instagram: row['instagram'] || '',
            discord: row['discord'] || '',
            twitchUrl: row['twitch url'] || '',
            description: row['description'] || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Only add if we have a name
        if (lead.name && lead.name !== 'Unknown') {
            leads.push(lead);
        }
    }
    
    return leads;
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes) {
            if (line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = false;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    
    return values;
}

function confirmImport() {
    if (pendingImportLeads.length === 0) return;
    
    // Check for duplicates by name
    const existingNames = new Set(store.leads.map(l => l.name.toLowerCase()));
    const newLeads = pendingImportLeads.filter(l => !existingNames.has(l.name.toLowerCase()));
    const duplicates = pendingImportLeads.length - newLeads.length;
    
    // Add new leads
    store.leads = [...newLeads, ...store.leads];
    saveToStorage();
    
    // Close modal and refresh
    document.getElementById('import-modal-overlay').classList.remove('active');
    resetImport();
    
    navigateTo('leads');
    updateKPIs();
    
    const message = duplicates > 0 
        ? `Imported ${newLeads.length} leads (${duplicates} duplicates skipped)` 
        : `Imported ${newLeads.length} leads`;
    
    addActivity('lead_added', `<strong>${newLeads.length} leads</strong> imported from Twitch Scraper`);
    showToast(message, 'success');
}

function resetImport() {
    pendingImportLeads = [];
    document.getElementById('import-dropzone').style.display = 'block';
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-file-input').value = '';
}

// ==================== MODAL HELPERS ====================

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// ==================== GLOBAL SEARCH ====================

function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) return;
        
        // Search across leads, clients, deals
        const results = [];
        
        store.leads.forEach(l => {
            if (l.name.toLowerCase().includes(query) || l.email?.toLowerCase().includes(query)) {
                results.push({ type: 'lead', item: l });
            }
        });
        
        store.clients.forEach(c => {
            if (c.name.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query)) {
                results.push({ type: 'client', item: c });
            }
        });
        
        // Could show a dropdown here, for now just navigate to leads with first match
        if (results.length > 0) {
            const first = results[0];
            if (first.type === 'lead') {
                navigateTo('leads');
            } else if (first.type === 'client') {
                navigateTo('clients');
            }
        }
    });
}

// ==================== INIT ====================

function initApp() {
    loadFromStorage();
    initNavigation();
    initImportModal();
    initGlobalSearch();
    
    // Filter event listeners
    document.getElementById('leads-tier-filter').onchange = renderLeadsTable;
    document.getElementById('leads-status-filter').onchange = renderLeadsTable;
    document.getElementById('leads-source-filter').onchange = renderLeadsTable;
    document.getElementById('clients-status-filter').onchange = renderClients;
    document.getElementById('clients-service-filter').onchange = renderClients;
    document.getElementById('tasks-type-filter').onchange = renderTasks;
    document.getElementById('tasks-status-filter').onchange = renderTasks;
    
    // Button event listeners
    document.getElementById('add-lead-btn').onclick = addNewLead;
    document.getElementById('add-service-btn').onclick = addNewService;
    document.getElementById('add-task-btn').onclick = addNewTask;
    document.getElementById('add-new-btn').onclick = () => {
        const activeView = document.querySelector('.view.active').id;
        if (activeView === 'leads-view') addNewLead();
        else if (activeView === 'services-view') addNewService();
        else if (activeView === 'tasks-view') addNewTask();
        else addNewLead(); // Default
    };
    
    document.getElementById('modal-close').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    };
    
    document.getElementById('refresh-btn').onclick = () => {
        const activeView = document.querySelector('.view.active').id.replace('-view', '');
        navigateTo(activeView);
        showToast('Data refreshed', 'info');
    };
    
    // Initial render
    renderDashboard();
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

