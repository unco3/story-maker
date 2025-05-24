document.addEventListener('DOMContentLoaded', function() {
    const personCountSelect = document.getElementById('person-count');
    const containerArea = document.getElementById('container-area');
    const generateBtn = document.getElementById('generate-btn');
    const scenarioBtn = document.getElementById('scenario-btn');
    const regenerateScenarioBtn = document.getElementById('regenerate-scenario-btn');
    const selectedCountSpan = document.getElementById('selected-count');
    const genderOptions = ['男性', '女性'];

    const generateStructureBtn = document.getElementById('generate-structure');
    const regenerateStructureBtn = document.getElementById('regenerate-structure-btn');
    const scenariosContainer = document.getElementById('scenarios-container');
    const structureContainer = document.getElementById('structure-container');
    const selectedScenarioIndexInput = document.getElementById('selected-scenario-index');

    const generateOutlineBtn = document.getElementById('generate-outline');
    const outlineContainer = document.getElementById('outline-container');

    let currentProfiles = [];
    let currentScenarios = [];
    let lastScenarioProfilesHash = null;
    let currentStructure = null; 

    // Remove old icons - using SVG icons instead

    // UI State Management
    const panels = {
        profiles: document.querySelector('.panel-profiles'),
        scenarios: document.querySelector('.panel-scenarios'),
        structure: document.querySelector('.panel-structure'),
        outline: document.querySelector('.panel-outline')
    };

    const steps = ['people', 'profiles', 'scenario', 'structure', 'outline'];
    let currentStep = 0;

    // Helper function for fetching JSON
    async function fetchJSON(url, method='POST', body={}) {
        showLoading();
        try {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (method !== 'GET' && body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            showAlert('エラーが発生しました。もう一度お試しください。', 'destructive');
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Progress and Navigation Functions
    function updateProgress() {
        const progress = ((currentStep + 1) / steps.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressContainer = document.querySelector('.progress');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressContainer) {
            progressContainer.setAttribute('aria-valuenow', progress);
        }
    }

    function updateBreadcrumb() {
        steps.forEach((step, index) => {
            const element = document.getElementById(`step-${step}`);
            
            if (index < currentStep) {
                element.setAttribute('data-state', 'completed');
                element.setAttribute('tabindex', '0');
                element.setAttribute('aria-current', 'false');
            } else if (index === currentStep) {
                element.setAttribute('data-state', 'active');
                element.setAttribute('tabindex', '0');
                element.setAttribute('aria-current', 'step');
            } else {
                element.setAttribute('data-state', 'inactive');
                element.setAttribute('tabindex', '-1');
                element.setAttribute('aria-current', 'false');
            }
        });
    }

    function updatePanelStates() {
        Object.entries(panels).forEach(([key, panel], index) => {
            if (index <= currentStep - 1) {
                panel.classList.remove('panel-disabled', 'panel-hidden');
            } else if (index === currentStep) {
                panel.classList.remove('panel-disabled', 'panel-hidden');
            } else {
                panel.classList.add('panel-disabled');
            }
        });

        // Enable/disable buttons based on step
        scenarioBtn.disabled = currentStep < 1 || currentProfiles.length === 0;
        regenerateScenarioBtn.disabled = currentStep < 1 || currentProfiles.length === 0;
        generateStructureBtn.disabled = currentStep < 2 || !selectedScenarioIndexInput.value;
        regenerateStructureBtn.disabled = currentStep < 2 || !selectedScenarioIndexInput.value;
        generateOutlineBtn.disabled = currentStep < 3 || !currentStructure;
    }

    function moveToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= steps.length) return;
        if (stepIndex > currentStep + 1) return; // Can't skip steps
        
        currentStep = stepIndex;
        updateProgress();
        updateBreadcrumb();
        updatePanelStates();
        
        // Smooth scroll to current panel
        const targetPanel = Object.values(panels)[Math.max(0, stepIndex - 1)];
        if (targetPanel) {
            targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Alert System
    function showAlert(message, type = 'default', duration = 5000) {
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

    // Loading States
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
        document.getElementById('loading-overlay').setAttribute('aria-hidden', 'false');
    }

    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('loading-overlay').setAttribute('aria-hidden', 'true');
    }

    function setButtonLoading(button, loading) {
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

    function hashProfiles(profiles) {
        return JSON.stringify(profiles);
    }

    function getRandomAge(min = 0, max = 100) {
        // 10-29歳が出やすいように重み付けする
        const rand = Math.random();
        if (rand < 0.6) { // 60%の確率で10-29歳
            return Math.floor(Math.random() * 20) + 10; // 10-29歳
        } else if (rand < 0.8) { // 20%の確率で30-40歳
            return Math.floor(Math.random() * 11) + 30; // 30-40歳
        } else if (rand < 0.9) { // 10%の確率で0-9歳
            return Math.floor(Math.random() * 10);
        } else { // 10%の確率で41-100歳
            return Math.floor(Math.random() * 60) + 41;
        }
    }

    function getRandomGender() {
        const randomIndex = Math.floor(Math.random() * genderOptions.length);
        return genderOptions[randomIndex];
    }

    // Removed getRandomIcon - using SVG icons instead

    function getTooltipText(fieldName) {
        const tooltips = {
            'age': '年齢を変更すると、職業・性格・来歴も変更されます',
            'gender': '性別を変更すると、名前・性格・来歴も変更されます',
            'name': '現在の性別に合った名前のみを変更します',
            'job': '職業を変更すると、性格・来歴のみ変更されます',
            'personality': '性格を変更すると、来歴のみ変更されます',
            'history': '来歴のみを変更します'
        };
        return tooltips[fieldName] || `${fieldName}を再生成`;
    }

    // Removed old createProfileField - using new UI design

    function validateAge(ageInput) {
        const age = parseInt(ageInput.value);
        const parent = ageInput.parentElement;
        let feedback = parent.querySelector('.invalid-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            parent.appendChild(feedback);
        }
        
        if (isNaN(age) || age < 0 || age > 120) {
            ageInput.classList.add('is-invalid');
            feedback.textContent = '年齢は0から120の間で入力してください。';
            return false;
        } else {
            ageInput.classList.remove('is-invalid');
            return true;
        }
    }

    function createPersonContainer(profileData = null, initialAge = null, initialGender = null, index) {
        const age = initialAge || getRandomAge();
        const gender = initialGender || getRandomGender();
        const genderColor = gender === '男性' ? 'blue' : 'pink';
        
        const card = document.createElement('div');
        card.className = `card relative overflow-hidden transition-all duration-300 hover:shadow-lg ${profileData ? 'animate-in slide-in' : ''}`;
        card.dataset.index = index;
        
        // Create card content
        let cardContent = `
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
        `;
        
        if (profileData) {
            cardContent += `
                <div class="space-y-3 pt-4 border-t border-border">
                    ${createNewProfileField('名前', 'name', profileData.name)}
                    ${createNewProfileField('職業', 'job', profileData.job)}
                    ${createNewProfileField('性格', 'personality', profileData.personality)}
                    ${createNewProfileField('来歴', 'history', profileData.history)}
                </div>
            `;
        } else {
            cardContent += `
                <div class="h-48 flex items-center justify-center">
                    <div class="text-center">
                        <svg class="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p class="text-muted-foreground text-sm">プロフィールを生成してください</p>
                    </div>
                </div>
            `;
        }
        
        cardContent += '</div>';
        card.innerHTML = cardContent;
        
        // Add event listeners
        const ageInput = card.querySelector('input[type="number"]');
        ageInput.addEventListener('input', function() {
            validateAge(this);
        });
        
        ageInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!validateAge(this)) return;
                
                const container = this.closest('.card');
                const index = parseInt(container.dataset.index, 10);
                const profile = JSON.parse(JSON.stringify(currentProfiles[index]));
                
                const newAge = parseInt(this.value);
                profile.age = newAge.toString();
                profile.gender = container.querySelector('select').value;

                try {
                    setButtonLoading(generateBtn, true);
                    const data = await fetchJSON('http://127.0.0.1:5000/update-fields', 'POST', { 
                        profile: profile, 
                        changed_field: 'age' 
                    });
                    if (data.updated_fields) {
                        const updated = data.updated_fields;
                        updated.age = newAge.toString();
                        
                        for (let key in updated) {
                            if (updated[key] !== null && updated[key] !== undefined) {
                                profile[key] = updated[key];
                            }
                        }

                        currentProfiles[index] = profile;
                        const newContainer = createPersonContainer(profile, profile.age, profile.gender, index);
                        containerArea.replaceChild(newContainer, container);
                        attachIconEvents();
                        showAlert('年齢を更新しました', 'success');

                        // Reset downstream content
                        resetDownstreamContent();
                    }
                } catch (error) {
                    console.error('Error updating age:', error);
                } finally {
                    setButtonLoading(generateBtn, false);
                }
            }
        });
        
        return card;
    }
    
    function createNewProfileField(label, field, value) {
        const tooltips = {
            'name': '現在の性別に合った名前のみを変更します',
            'job': '職業を変更すると、性格・来歴のみ変更されます',
            'personality': '性格を変更すると、来歴のみ変更されます',
            'history': '来歴のみを変更します'
        };
        
        return `
            <div class="flex items-start gap-3 profile-field-wrapper" data-field="${field}">
                <div class="flex-shrink-0 w-20">
                    <span class="text-sm font-medium text-muted-foreground">${label}</span>
                </div>
                <div class="flex-1 profile-value-wrapper">
                    <span class="profile-value profile-value-display" data-field="${field}">${value}</span>
                    <input type="text" class="input w-full profile-value-edit hidden" value="${value}" data-field="${field}">
                </div>
                <div class="tooltip">
                    <button class="btn btn-ghost btn-sm regenerate-btn flex-shrink-0" data-field="${field}" aria-label="${label}を再生成">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </button>
                    <span class="tooltip-content">${tooltips[field]}</span>
                </div>
                <div class="profile-edit-controls hidden flex gap-1">
                    <button class="btn btn-primary btn-sm save-profile-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    <button class="btn btn-outline btn-sm cancel-profile-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    function resetDownstreamContent() {
        currentScenarios = [];
        lastScenarioProfilesHash = null;
        currentStructure = null;
        scenariosContainer.innerHTML = '';
        structureContainer.innerHTML = '';
        outlineContainer.innerHTML = '';
        selectedScenarioIndexInput.value = '';
        
        // Reset scenario buttons
        scenarioBtn.style.display = 'inline-flex';
        regenerateScenarioBtn.style.display = 'none';
        
        if (currentStep > 1) {
            moveToStep(1);
        }
    }

    async function generateProfiles() {
        const containers = document.querySelectorAll('#container-area > .card');
        const profiles = [];
        const originalValues = [];
        
        containers.forEach(container => {
            const age = container.querySelector('input[type="number"]').value;
            const gender = container.querySelector('select').value;
            profiles.push(`${age}歳${gender}`);
            originalValues.push({ age, gender });
        });

        try {
            setButtonLoading(generateBtn, true);
            const data = await fetchJSON('http://127.0.0.1:5000/generate-profiles', 'POST', { profiles: profiles });
            updateContainersWithProfiles(data.profiles || [], originalValues);
            showAlert('プロフィールを生成しました', 'success');
            moveToStep(1);
        } catch (error) {
            console.error('Error generating profiles:', error);
        } finally {
            setButtonLoading(generateBtn, false);
        }
    }

    function updateContainersWithProfiles(profiles, originalValues) {
        containerArea.innerHTML = '';
        
        // Add edit mode toggle for profiles
        if (profiles.length > 0) {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'flex justify-between items-center mb-4';
            controlsDiv.innerHTML = `
                <p class="text-sm text-muted-foreground">プロフィールを直接編集できます</p>
                <button id="toggle-profile-edit-mode" class="btn btn-outline btn-sm">
                    <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>編集モード</span>
                </button>
            `;
            containerArea.appendChild(controlsDiv);
        }
        
        currentProfiles = [];
        profiles.forEach((profile, index) => {
            const originalValue = originalValues[index];
            const p = {
                age: originalValue.age,
                gender: originalValue.gender,
                name: profile.name,
                job: profile.job,
                personality: profile.personality,
                history: profile.history
            };
            currentProfiles.push(p);
            containerArea.appendChild(createPersonContainer(p, p.age, p.gender, index));
        });
        attachIconEvents();
        updateSelectedCount();
        
        // Initialize profile edit mode
        if (profiles.length > 0) {
            initializeProfileEditMode();
        }
    }

    function updateContainers() {
        containerArea.innerHTML = '';
        currentProfiles = [];
        const count = parseInt(document.getElementById('person-count').value);
        
        for (let i = 0; i < count; i++) {
            const p = {
                age: getRandomAge(),
                gender: getRandomGender(),
                name: '',
                job: '',
                personality: '',
                history: ''
            };
            currentProfiles.push(p);
            containerArea.appendChild(createPersonContainer(null, p.age, p.gender, i));
        }
        attachIconEvents();
        resetDownstreamContent();
        updateSelectedCount();
    }

    function updateSelectedCount() {
        const count = document.querySelectorAll('#container-area > .card').length;
        if (selectedCountSpan) {
            selectedCountSpan.textContent = `(${count}人選択中)`;
        }
    }

    async function regenerateField(container, field) {
        const index = parseInt(container.dataset.index, 10);
        const profile = JSON.parse(JSON.stringify(currentProfiles[index]));
        
        if (field === 'age') {
            profile.age = getRandomAge().toString();
        } else if (field === 'gender') {
            const currentGender = container.querySelector('select[data-field="gender"]').value;
            const newGender = currentGender === '男性' ? '女性' : '男性';
            profile.gender = newGender;
        }

        try {
            setButtonLoading(generateBtn, true);
            const data = await fetchJSON('http://127.0.0.1:5000/update-fields', 'POST', { 
                profile: profile, 
                changed_field: field 
            });
            if (data.updated_fields) {
                const updated = data.updated_fields;
                
                for (let key in updated) {
                    if (updated[key] !== null && updated[key] !== undefined) {
                        profile[key] = updated[key];
                    }
                }

                currentProfiles[index] = profile;
                const newContainer = createPersonContainer(profile, profile.age, profile.gender, index);
                containerArea.replaceChild(newContainer, container);
                attachIconEvents();
                showAlert(`${field}を更新しました`, 'success');
                resetDownstreamContent();
            }
        } catch (error) {
            console.error('Error regenerating field:', error);
        } finally {
            setButtonLoading(generateBtn, false);
        }
    }

    function attachIconEvents() {
        document.querySelectorAll('.regenerate-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const field = this.dataset.field;
                const container = this.closest('.card');
                await regenerateField(container, field);
            });
            
            btn.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const field = this.dataset.field;
                    const container = this.closest('.card');
                    await regenerateField(container, field);
                }
            });
        });
    }

    async function generateScenarios(forceRegenerate = false) {
        const currentHash = hashProfiles(currentProfiles);
        
        if (!forceRegenerate && lastScenarioProfilesHash === currentHash && currentScenarios.length > 0) {
            displayScenarios(currentScenarios);
            showAlert('既存のシナリオを表示しています', 'info');
            return;
        }
        
        if (currentProfiles.length === 0) {
            showAlert('先にプロフィールを生成してください', 'warning');
            return;
        }

        try {
            setButtonLoading(scenarioBtn, true);
            setButtonLoading(regenerateScenarioBtn, true);
            
            // Clear current selection when regenerating
            if (forceRegenerate) {
                selectedScenarioIndexInput.value = '';
                currentStructure = null;
                structureContainer.innerHTML = '';
                outlineContainer.innerHTML = '';
                updatePanelStates();
            }
            
            const data = await fetchJSON('http://127.0.0.1:5000/generate-scenarios', 'POST', { profiles: currentProfiles });
            if (data.scenarios) {
                currentScenarios = data.scenarios;
                lastScenarioProfilesHash = currentHash;
                displayScenarios(data.scenarios);
                showAlert('舞台設定を生成しました', 'success');
                moveToStep(2);
                
                // Show regenerate button and hide generate button
                scenarioBtn.style.display = 'none';
                regenerateScenarioBtn.style.display = 'inline-flex';
            }
        } catch (error) {
            console.error('Error generating scenarios:', error);
        } finally {
            setButtonLoading(scenarioBtn, false);
            setButtonLoading(regenerateScenarioBtn, false);
        }
    }

    function displayScenarios(scenarios) {
        scenariosContainer.innerHTML = '';
        
        // Add edit mode toggle for scenarios
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex justify-between items-center mb-4';
        controlsDiv.innerHTML = `
            <p class="text-sm text-muted-foreground">シナリオを編集して、より良い舞台設定を作成できます</p>
            <button id="toggle-scenario-edit-mode" class="btn btn-outline btn-sm">
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>編集モード</span>
            </button>
        `;
        scenariosContainer.appendChild(controlsDiv);
        
        const scenariosWrapper = document.createElement('div');
        scenariosWrapper.className = 'space-y-4';
        
        scenarios.forEach((scenario, index) => {
            const card = document.createElement('div');
            card.className = 'card cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in slide-in scenario-card';
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
                        <h3 class="text-lg font-semibold mb-2 scenario-title-display">${scenario.title}</h3>
                        <input type="text" class="input w-full mb-2 scenario-title-edit hidden" value="${scenario.title}">
                        <div class="scenario-content-wrapper">
                            <p class="text-muted-foreground scenario-description-display">${scenario.description}</p>
                            <textarea class="w-full p-3 bg-background border border-border rounded-md text-sm scenario-description-edit hidden" rows="4">${scenario.description}</textarea>
                        </div>
                        <div class="mt-3 flex gap-2 scenario-edit-controls hidden">
                            <button class="btn btn-primary btn-sm save-scenario-btn">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                保存
                            </button>
                            <button class="btn btn-outline btn-sm cancel-scenario-btn">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                キャンセル
                            </button>
                        </div>
                    </div>
                    <div class="flex-shrink-0 opacity-0 transition-opacity duration-300 selected-indicator">
                        <span class="badge badge-success">選択中</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', function(e) {
                // Don't select if clicking on edit fields
                if (!e.target.classList.contains('scenario-title-edit') && 
                    !e.target.classList.contains('scenario-description-edit') &&
                    !e.target.closest('.scenario-edit-controls')) {
                    selectScenario(index);
                }
            });
            
            card.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (!e.target.classList.contains('scenario-title-edit') && 
                        !e.target.classList.contains('scenario-description-edit')) {
                        e.preventDefault();
                        selectScenario(index);
                    }
                }
            });
            
            scenariosWrapper.appendChild(card);
        });
        
        scenariosContainer.appendChild(scenariosWrapper);
        
        // Initialize scenario edit mode
        initializeScenarioEditMode();
    }

    function selectScenario(index) {
        document.querySelectorAll('#scenarios-container .card').forEach((el, i) => {
            const indicator = el.querySelector('.selected-indicator');
            if (i === index) {
                el.classList.add('ring-2', 'ring-green-500');
                indicator.style.opacity = '1';
                el.setAttribute('aria-pressed', 'true');
            } else {
                el.classList.remove('ring-2', 'ring-green-500');
                indicator.style.opacity = '0';
                el.setAttribute('aria-pressed', 'false');
            }
        });
        selectedScenarioIndexInput.value = index;
        currentStructure = null;
        structureContainer.innerHTML = '';
        outlineContainer.innerHTML = '';
        
        // Reset structure buttons
        generateStructureBtn.style.display = 'inline-flex';
        regenerateStructureBtn.style.display = 'none';
        
        updatePanelStates();
        showAlert('シナリオを選択しました', 'success');
    }

    async function generateStructure(forceRegenerate = false) {
        const selectedIndex = selectedScenarioIndexInput.value;
        if (selectedIndex === '' || !currentScenarios[selectedIndex]) {
            showAlert('先にシナリオを選択してください', 'warning');
            return;
        }

        try {
            setButtonLoading(generateStructureBtn, true);
            setButtonLoading(regenerateStructureBtn, true);
            
            // Clear outline when regenerating structure
            if (forceRegenerate) {
                outlineContainer.innerHTML = '';
                updatePanelStates();
            }
            
            const data = await fetchJSON('http://127.0.0.1:5000/generate-story-structure', 'POST', {
                profiles: currentProfiles,
                selected_scenario: currentScenarios[selectedIndex]
            });
            
            if (data.story_beats) {
                currentStructure = data.story_beats;
                displayStructure(data.story_beats);
                showAlert('シナリオ構成を生成しました', 'success');
                moveToStep(3);
                
                // Show regenerate button and hide generate button
                generateStructureBtn.style.display = 'none';
                regenerateStructureBtn.style.display = 'inline-flex';
            }
        } catch (error) {
            console.error('Error generating structure:', error);
        } finally {
            setButtonLoading(generateStructureBtn, false);
            setButtonLoading(regenerateStructureBtn, false);
        }
    }

    function displayStructure(beats) {
        structureContainer.innerHTML = '';
        
        // Add edit mode toggle button
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex justify-between items-center mb-4';
        controlsDiv.innerHTML = `
            <p class="text-sm text-muted-foreground">ビート構成を編集して、より良いストーリーを作成できます</p>
            <button id="toggle-edit-mode" class="btn btn-outline btn-sm">
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>編集モード</span>
            </button>
        `;
        structureContainer.appendChild(controlsDiv);
        
        const beatsContainer = document.createElement('div');
        beatsContainer.className = 'space-y-4';
        beatsContainer.id = 'beats-container';
        
        beats.forEach((beat, index) => {
            const card = document.createElement('div');
            card.className = 'card animate-in slide-in beat-card';
            card.dataset.beatIndex = index;
            
            card.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                            <span class="text-sm font-bold text-purple-500">${beat.beat_number}</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold mb-2 beat-name">${beat.beat_name}</h4>
                        <div class="beat-content-wrapper">
                            <p class="text-muted-foreground beat-content-display">${beat.content}</p>
                            <textarea class="w-full p-3 bg-background border border-border rounded-md text-sm beat-content-edit hidden" rows="4">${beat.content}</textarea>
                        </div>
                        <div class="mt-3 flex gap-2 edit-controls hidden">
                            <button class="btn btn-primary btn-sm save-beat-btn">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                保存
                            </button>
                            <button class="btn btn-outline btn-sm cancel-beat-btn">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            beatsContainer.appendChild(card);
        });
        
        structureContainer.appendChild(beatsContainer);
        
        // Add event listener for edit mode toggle
        const toggleBtn = document.getElementById('toggle-edit-mode');
        toggleBtn.addEventListener('click', function() {
            toggleEditMode();
        });
        
        // Initialize edit mode event listeners
        initializeEditModeListeners();
    }
    
    function toggleEditMode() {
        const isEditMode = document.body.classList.toggle('structure-edit-mode');
        const toggleBtn = document.getElementById('toggle-edit-mode');
        const beatCards = document.querySelectorAll('.beat-card');
        
        if (isEditMode) {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>閲覧モード</span>
            `;
            toggleBtn.classList.remove('btn-outline');
            toggleBtn.classList.add('btn-primary');
            
            // Make content editable
            beatCards.forEach(card => {
                const display = card.querySelector('.beat-content-display');
                const edit = card.querySelector('.beat-content-edit');
                display.classList.add('cursor-pointer', 'hover:bg-muted/50', 'p-2', 'rounded', 'transition-colors');
                display.setAttribute('title', 'クリックして編集');
            });
        } else {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>編集モード</span>
            `;
            toggleBtn.classList.add('btn-outline');
            toggleBtn.classList.remove('btn-primary');
            
            // Remove editable styling
            beatCards.forEach(card => {
                const display = card.querySelector('.beat-content-display');
                display.classList.remove('cursor-pointer', 'hover:bg-muted/50', 'p-2', 'rounded', 'transition-colors');
                display.removeAttribute('title');
            });
        }
    }
    
    function initializeProfileEditMode() {
        const toggleBtn = document.getElementById('toggle-profile-edit-mode');
        if (!toggleBtn) return;
        
        toggleBtn.addEventListener('click', function() {
            toggleProfileEditMode();
        });
        
        // Initialize profile field edit listeners
        initializeProfileFieldListeners();
    }
    
    function toggleProfileEditMode() {
        const isEditMode = document.body.classList.toggle('profile-edit-mode');
        const toggleBtn = document.getElementById('toggle-profile-edit-mode');
        const profileFields = document.querySelectorAll('.profile-value-display');
        
        if (isEditMode) {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>閲覧モード</span>
            `;
            toggleBtn.classList.remove('btn-outline');
            toggleBtn.classList.add('btn-primary');
            
            profileFields.forEach(field => {
                field.classList.add('cursor-pointer', 'hover:bg-muted/50', 'p-1', 'rounded', 'transition-colors');
                field.setAttribute('title', 'クリックして編集');
            });
        } else {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>編集モード</span>
            `;
            toggleBtn.classList.add('btn-outline');
            toggleBtn.classList.remove('btn-primary');
            
            profileFields.forEach(field => {
                field.classList.remove('cursor-pointer', 'hover:bg-muted/50', 'p-1', 'rounded', 'transition-colors');
                field.removeAttribute('title');
            });
        }
    }
    
    function initializeProfileFieldListeners() {
        const profileFields = document.querySelectorAll('.profile-field-wrapper');
        
        profileFields.forEach(fieldWrapper => {
            const display = fieldWrapper.querySelector('.profile-value-display');
            const edit = fieldWrapper.querySelector('.profile-value-edit');
            const controls = fieldWrapper.querySelector('.profile-edit-controls');
            const regenerateBtn = fieldWrapper.querySelector('.regenerate-btn');
            const saveBtn = fieldWrapper.querySelector('.save-profile-btn');
            const cancelBtn = fieldWrapper.querySelector('.cancel-profile-btn');
            
            if (!display || !edit) return;
            
            // Click to edit
            display.addEventListener('click', function() {
                if (document.body.classList.contains('profile-edit-mode')) {
                    display.classList.add('hidden');
                    edit.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    regenerateBtn.parentElement.classList.add('hidden');
                    edit.focus();
                    edit.setSelectionRange(edit.value.length, edit.value.length);
                }
            });
            
            // Save edit
            if (saveBtn) {
                saveBtn.addEventListener('click', async function() {
                    const card = fieldWrapper.closest('.card');
                    const cardIndex = parseInt(card.dataset.index);
                    const field = edit.dataset.field;
                    const newValue = edit.value.trim();
                    
                    if (newValue && newValue !== currentProfiles[cardIndex][field]) {
                        // Update the profile
                        currentProfiles[cardIndex][field] = newValue;
                        display.textContent = newValue;
                        
                        // Reset downstream content since profile changed
                        resetDownstreamContent();
                        showAlert(`${field}を更新しました`, 'success');
                    }
                    
                    // Hide edit mode
                    display.classList.remove('hidden');
                    edit.classList.add('hidden');
                    controls.classList.add('hidden');
                    regenerateBtn.parentElement.classList.remove('hidden');
                });
            }
            
            // Cancel edit
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    edit.value = display.textContent;
                    display.classList.remove('hidden');
                    edit.classList.add('hidden');
                    controls.classList.add('hidden');
                    regenerateBtn.parentElement.classList.remove('hidden');
                });
            }
            
            // Save on Enter
            edit.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (saveBtn) saveBtn.click();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    if (cancelBtn) cancelBtn.click();
                }
            });
        });
    }
    
    function initializeScenarioEditMode() {
        const toggleBtn = document.getElementById('toggle-scenario-edit-mode');
        if (!toggleBtn) return;
        
        toggleBtn.addEventListener('click', function() {
            toggleScenarioEditMode();
        });
        
        // Initialize scenario edit listeners
        initializeScenarioEditListeners();
    }
    
    function toggleScenarioEditMode() {
        const isEditMode = document.body.classList.toggle('scenario-edit-mode');
        const toggleBtn = document.getElementById('toggle-scenario-edit-mode');
        const scenarioCards = document.querySelectorAll('.scenario-card');
        
        if (isEditMode) {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>閲覧モード</span>
            `;
            toggleBtn.classList.remove('btn-outline');
            toggleBtn.classList.add('btn-primary');
            
            scenarioCards.forEach(card => {
                const titleDisplay = card.querySelector('.scenario-title-display');
                const descDisplay = card.querySelector('.scenario-description-display');
                titleDisplay.classList.add('cursor-pointer', 'hover:bg-muted/50', 'p-1', 'rounded', 'transition-colors');
                descDisplay.classList.add('cursor-pointer', 'hover:bg-muted/50', 'p-2', 'rounded', 'transition-colors');
                titleDisplay.setAttribute('title', 'クリックして編集');
                descDisplay.setAttribute('title', 'クリックして編集');
            });
        } else {
            toggleBtn.innerHTML = `
                <svg class="w-4 h-4 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span>編集モード</span>
            `;
            toggleBtn.classList.add('btn-outline');
            toggleBtn.classList.remove('btn-primary');
            
            scenarioCards.forEach(card => {
                const titleDisplay = card.querySelector('.scenario-title-display');
                const descDisplay = card.querySelector('.scenario-description-display');
                titleDisplay.classList.remove('cursor-pointer', 'hover:bg-muted/50', 'p-1', 'rounded', 'transition-colors');
                descDisplay.classList.remove('cursor-pointer', 'hover:bg-muted/50', 'p-2', 'rounded', 'transition-colors');
                titleDisplay.removeAttribute('title');
                descDisplay.removeAttribute('title');
            });
        }
    }
    
    function initializeScenarioEditListeners() {
        const scenarioCards = document.querySelectorAll('.scenario-card');
        
        scenarioCards.forEach(card => {
            const titleDisplay = card.querySelector('.scenario-title-display');
            const titleEdit = card.querySelector('.scenario-title-edit');
            const descDisplay = card.querySelector('.scenario-description-display');
            const descEdit = card.querySelector('.scenario-description-edit');
            const controls = card.querySelector('.scenario-edit-controls');
            const saveBtn = card.querySelector('.save-scenario-btn');
            const cancelBtn = card.querySelector('.cancel-scenario-btn');
            
            // Edit title
            titleDisplay.addEventListener('click', function() {
                if (document.body.classList.contains('scenario-edit-mode')) {
                    titleDisplay.classList.add('hidden');
                    titleEdit.classList.remove('hidden');
                    descDisplay.classList.add('hidden');
                    descEdit.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    titleEdit.focus();
                    titleEdit.setSelectionRange(titleEdit.value.length, titleEdit.value.length);
                }
            });
            
            // Edit description
            descDisplay.addEventListener('click', function() {
                if (document.body.classList.contains('scenario-edit-mode')) {
                    titleDisplay.classList.add('hidden');
                    titleEdit.classList.remove('hidden');
                    descDisplay.classList.add('hidden');
                    descEdit.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    descEdit.focus();
                    descEdit.setSelectionRange(descEdit.value.length, descEdit.value.length);
                }
            });
            
            // Save changes
            saveBtn.addEventListener('click', function() {
                const scenarioIndex = parseInt(card.dataset.index);
                const newTitle = titleEdit.value.trim();
                const newDesc = descEdit.value.trim();
                
                if (newTitle && newDesc) {
                    // Update scenario
                    currentScenarios[scenarioIndex].title = newTitle;
                    currentScenarios[scenarioIndex].description = newDesc;
                    titleDisplay.textContent = newTitle;
                    descDisplay.textContent = newDesc;
                    
                    // Reset downstream content
                    currentStructure = null;
                    structureContainer.innerHTML = '';
                    outlineContainer.innerHTML = '';
                    updatePanelStates();
                    
                    showAlert('シナリオを更新しました', 'success');
                }
                
                // Hide edit mode
                titleDisplay.classList.remove('hidden');
                titleEdit.classList.add('hidden');
                descDisplay.classList.remove('hidden');
                descEdit.classList.add('hidden');
                controls.classList.add('hidden');
            });
            
            // Cancel changes
            cancelBtn.addEventListener('click', function() {
                titleEdit.value = titleDisplay.textContent;
                descEdit.value = descDisplay.textContent;
                
                titleDisplay.classList.remove('hidden');
                titleEdit.classList.add('hidden');
                descDisplay.classList.remove('hidden');
                descEdit.classList.add('hidden');
                controls.classList.add('hidden');
            });
            
            // Keyboard shortcuts
            const handleKeydown = function(e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelBtn.click();
                }
            };
            
            titleEdit.addEventListener('keydown', handleKeydown);
            descEdit.addEventListener('keydown', handleKeydown);
        });
    }

    function initializeEditModeListeners() {
        const beatCards = document.querySelectorAll('.beat-card');
        
        beatCards.forEach(card => {
            const display = card.querySelector('.beat-content-display');
            const edit = card.querySelector('.beat-content-edit');
            const controls = card.querySelector('.edit-controls');
            const saveBtn = card.querySelector('.save-beat-btn');
            const cancelBtn = card.querySelector('.cancel-beat-btn');
            
            // Click to edit
            display.addEventListener('click', function() {
                if (document.body.classList.contains('structure-edit-mode')) {
                    display.classList.add('hidden');
                    edit.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    edit.focus();
                    edit.setSelectionRange(edit.value.length, edit.value.length);
                }
            });
            
            // Save edit
            saveBtn.addEventListener('click', function() {
                const beatIndex = parseInt(card.dataset.beatIndex);
                const newContent = edit.value.trim();
                
                if (newContent) {
                    // Update the beat content
                    currentStructure[beatIndex].content = newContent;
                    display.textContent = newContent;
                    
                    // Hide edit mode for this card
                    display.classList.remove('hidden');
                    edit.classList.add('hidden');
                    controls.classList.add('hidden');
                    
                    showAlert('ビート内容を更新しました', 'success');
                }
            });
            
            // Cancel edit
            cancelBtn.addEventListener('click', function() {
                // Restore original content
                edit.value = display.textContent;
                
                // Hide edit mode for this card
                display.classList.remove('hidden');
                edit.classList.add('hidden');
                controls.classList.add('hidden');
            });
            
            // Save on Enter (Ctrl/Cmd + Enter)
            edit.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelBtn.click();
                }
            });
        });
    }

    async function generateOutline() {
        if (!currentStructure) {
            showAlert('先にシナリオ構成を生成してください', 'warning');
            return;
        }

        try {
            setButtonLoading(generateOutlineBtn, true);
            const selectedIndex = selectedScenarioIndexInput.value;
            const data = await fetchJSON('http://127.0.0.1:5000/generate-outline', 'POST', {
                profiles: currentProfiles,
                selected_scenario: currentScenarios[selectedIndex],
                story_beats: currentStructure
            });
            
            if (data.outline) {
                displayOutline(data.outline);
                showAlert('アウトラインを生成しました', 'success');
                moveToStep(4);
            }
        } catch (error) {
            console.error('Error generating outline:', error);
        } finally {
            setButtonLoading(generateOutlineBtn, false);
        }
    }

    function displayOutline(outline) {
        outlineContainer.innerHTML = '';
        
        // Display title if available
        if (outline.title) {
            const titleCard = document.createElement('div');
            titleCard.className = 'card mb-4 animate-in slide-in';
            titleCard.innerHTML = `
                <h3 class="text-2xl font-bold text-orange-500">${outline.title}</h3>
            `;
            outlineContainer.appendChild(titleCard);
        }
        
        outline.chapters.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'card animate-in slide-in';
            
            let highlightsHtml = '';
            if (chapter.highlights && chapter.highlights.length > 0) {
                highlightsHtml = `
                    <div class="pl-16 mt-4">
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
                `;
            }
            
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
                    ${highlightsHtml}
                </div>
            `;
            
            outlineContainer.appendChild(card);
        });
    }

    // Breadcrumb Navigation
    steps.forEach((step, index) => {
        const element = document.getElementById(`step-${step}`);
        element.addEventListener('click', function() {
            if (!this.classList.contains('inactive') && index <= currentStep) {
                moveToStep(index);
            }
        });
        
        element.addEventListener('keypress', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && !this.classList.contains('inactive') && index <= currentStep) {
                e.preventDefault();
                moveToStep(index);
            }
        });
    });

    // Event Listeners
    personCountSelect.addEventListener('change', updateContainers);
    generateBtn.addEventListener('click', generateProfiles);
    scenarioBtn.addEventListener('click', () => generateScenarios(false));
    regenerateScenarioBtn.addEventListener('click', () => generateScenarios(true));
    generateStructureBtn.addEventListener('click', () => generateStructure(false));
    regenerateStructureBtn.addEventListener('click', () => generateStructure(true));
    generateOutlineBtn.addEventListener('click', generateOutline);

    // Initialize
    updateContainers();
    updateProgress();
    updateBreadcrumb();
    updatePanelStates();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    if (currentStep >= 0) moveToStep(0);
                    break;
                case '2':
                    e.preventDefault();
                    if (currentStep >= 1) moveToStep(1);
                    break;
                case '3':
                    e.preventDefault();
                    if (currentStep >= 2) moveToStep(2);
                    break;
                case '4':
                    e.preventDefault();
                    if (currentStep >= 3) moveToStep(3);
                    break;
                case '5':
                    e.preventDefault();
                    if (currentStep >= 4) moveToStep(4);
                    break;
            }
        }
    });
});