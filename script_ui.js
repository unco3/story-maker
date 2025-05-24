// UI Helper Functions
export function createPersonCard(profileData = null, initialAge = null, initialGender = null, index) {
    const age = initialAge || getRandomAge();
    const gender = initialGender || getRandomGender();
    const genderColor = gender === '男性' ? 'blue' : 'pink';
    
    const card = document.createElement('div');
    card.className = `card relative overflow-hidden transition-all duration-300 hover:shadow-lg ${profileData ? 'animate-in slide-in' : ''}`;
    card.dataset.index = index;
    
    // Gender indicator border
    card.innerHTML = `
        <div class="absolute top-0 left-0 w-1 h-full bg-${genderColor}-500"></div>
        <div class="space-y-4">
            <div class="flex flex-wrap gap-4 items-center">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium mb-2">
                        年齢
                        <span class="tooltip ml-1">
                            <svg class="inline w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="tooltip-content">年齢を変更すると、職業・性格・来歴も変更されます</span>
                        </span>
                    </label>
                    <div class="flex items-center gap-2">
                        <input type="number" 
                               class="input w-32" 
                               min="0" 
                               max="120" 
                               value="${age}"
                               aria-label="年齢"
                               data-field="age">
                        <button class="btn btn-ghost btn-sm regenerate-btn" data-field="age" aria-label="年齢を再生成">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium mb-2">
                        性別
                        <span class="tooltip ml-1">
                            <svg class="inline w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="tooltip-content">性別を変更すると、名前・性格・来歴も変更されます</span>
                        </span>
                    </label>
                    <div class="flex items-center gap-2">
                        <select class="select w-32" aria-label="性別" data-field="gender">
                            <option value="男性" ${gender === '男性' ? 'selected' : ''}>男性</option>
                            <option value="女性" ${gender === '女性' ? 'selected' : ''}>女性</option>
                        </select>
                        <button class="btn btn-ghost btn-sm regenerate-btn" data-field="gender" aria-label="性別を変更">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            ${profileData ? `
                <div class="space-y-3 pt-4 border-t border-border">
                    ${createProfileField('名前', 'name', profileData.name)}
                    ${createProfileField('職業', 'job', profileData.job)}
                    ${createProfileField('性格', 'personality', profileData.personality)}
                    ${createProfileField('来歴', 'history', profileData.history)}
                </div>
            ` : `
                <div class="h-48 flex items-center justify-center">
                    <div class="text-center">
                        <svg class="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p class="text-muted-foreground text-sm">プロフィールを生成してください</p>
                    </div>
                </div>
            `}
        </div>
    `;
    
    return card;
}

function createProfileField(label, field, value) {
    const tooltips = {
        'name': '現在の性別に合った名前のみを変更します',
        'job': '職業を変更すると、性格・来歴のみ変更されます',
        'personality': '性格を変更すると、来歴のみ変更されます',
        'history': '来歴のみを変更します'
    };
    
    return `
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-20">
                <span class="text-sm font-medium text-muted-foreground">${label}</span>
            </div>
            <div class="flex-1">
                <span class="profile-value" data-field="${field}">${value}</span>
            </div>
            <button class="btn btn-ghost btn-sm regenerate-btn flex-shrink-0" data-field="${field}" aria-label="${label}を再生成">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="tooltip-content">${tooltips[field]}</span>
            </button>
        </div>
    `;
}

export function createScenarioCard(scenario, index) {
    const card = document.createElement('div');
    card.className = 'card cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in slide-in';
    card.dataset.index = index;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    
    card.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold mb-2">${scenario.title}</h3>
                <p class="text-muted-foreground">${scenario.description}</p>
            </div>
            <div class="flex-shrink-0 opacity-0 transition-opacity duration-300 selected-indicator">
                <span class="badge badge-success">選択中</span>
            </div>
        </div>
    `;
    
    return card;
}

export function createBeatCard(beat) {
    const card = document.createElement('div');
    card.className = 'card animate-in slide-in';
    
    card.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-purple-500">${beat.beat_number}</span>
                </div>
            </div>
            <div class="flex-1">
                <h4 class="font-semibold mb-2">${beat.beat_name}</h4>
                <p class="text-muted-foreground">${beat.content}</p>
            </div>
        </div>
    `;
    
    return card;
}

export function createChapterCard(chapter, index) {
    const card = document.createElement('div');
    card.className = 'card animate-in slide-in';
    
    card.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <span class="text-lg font-bold text-orange-500">${index + 1}</span>
                    </div>
                </div>
                <div class="flex-1">
                    <h4 class="text-xl font-semibold mb-2">${chapter.title}</h4>
                    <p class="text-muted-foreground">${chapter.summary}</p>
                </div>
            </div>
            
            ${chapter.highlights && chapter.highlights.length > 0 ? `
                <div class="pl-16">
                    <h5 class="text-sm font-medium mb-2 text-muted-foreground">ハイライト</h5>
                    <ul class="space-y-2">
                        ${chapter.highlights.map(highlight => `
                            <li class="flex items-start gap-2">
                                <svg class="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                <span class="text-sm">${highlight}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

export function showAlert(message, type = 'default', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    const alertId = `alert-${Date.now()}`;
    
    const icons = {
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        destructive: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
        default: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };
    
    const alertDiv = document.createElement('div');
    alertDiv.id = alertId;
    alertDiv.className = `alert alert-${type} animate-in slide-in`;
    alertDiv.setAttribute('role', 'alert');
    
    alertDiv.innerHTML = `
        <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${icons[type] || icons.default}
        </svg>
        <span class="flex-1">${message}</span>
        <button type="button" class="ml-auto -mr-1 -mt-1 p-1 hover:opacity-70 transition-opacity" aria-label="閉じる" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    if (duration > 0) {
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        }, duration);
    }
}

export function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        const text = button.querySelector('.button-text');
        if (text) {
            text.style.visibility = 'hidden';
        }
        
        // Add spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner absolute';
        button.appendChild(spinner);
    } else {
        button.disabled = false;
        const text = button.querySelector('.button-text');
        if (text) {
            text.style.visibility = 'visible';
        }
        
        // Remove spinner
        const spinner = button.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Helper functions
function getRandomAge(min = 0, max = 100) {
    const rand = Math.random();
    if (rand < 0.6) {
        return Math.floor(Math.random() * 20) + 10;
    } else if (rand < 0.8) {
        return Math.floor(Math.random() * 11) + 30;
    } else if (rand < 0.9) {
        return Math.floor(Math.random() * 10);
    } else {
        return Math.floor(Math.random() * 60) + 41;
    }
}

function getRandomGender() {
    return Math.random() < 0.5 ? '男性' : '女性';
}