// AI AutoPilot Dashboard - Complete Implementation

class AutoPilotDashboard {
    constructor() {
        this.isRunning = true;
        this.currentView = 'cluster';
        this.mode = 'recommend'; // 'recommend' or 'auto'
        this.updateInterval = null;
        this.charts = {};
        
        // Core data structures
        this.cluster = this.initializeCluster();
        this.models = this.initializeModels();
        this.selectedModels = new Set();
        this.recommendations = [];
        this.appliedRecommendations = 0;
        this.costSavings = 0;
        
        // Metrics data
        this.data = this.initializeMetricsData();
        this.sloViolations = [];
        this.actionHistory = [];
        
        this.init();
    }

    initializeCluster() {
        return {
            nodeCount: 8,
            nodes: [],
            totalGPUs: 0,
            totalGPUMemory: 0,
            templates: [
                {
                    name: "Development",
                    description: "Small cluster for development and testing",
                    nodes: 3,
                    targetModels: ["Llama-2-7B", "CodeLlama-7B"],
                    quantization: "int8"
                },
                {
                    name: "Production",
                    description: "Large cluster optimized for production workloads", 
                    nodes: 12,
                    targetModels: ["Llama-2-13B", "Mistral-7B"],
                    quantization: "fp16"
                },
                {
                    name: "Cost-Optimized",
                    description: "Focus on cost efficiency and resource utilization",
                    nodes: 8,
                    targetModels: ["Llama-2-7B", "Mistral-7B"],
                    quantization: "int4"
                },
                {
                    name: "Performance-Optimized",
                    description: "Maximum performance for demanding workloads",
                    nodes: 20,
                    targetModels: ["Llama-2-70B", "Yi-34B"],
                    quantization: "fp16"
                }
            ]
        };
    }

    initializeModels() {
        return [
            {
                name: "Llama-2-7B",
                size: "7B",
                memory_fp16: 14,
                memory_int8: 8,
                memory_int4: 4,
                min_gpus: 1,
                tokens_per_second: 45,
                use_cases: ["General chat", "Code assistance", "Development"]
            },
            {
                name: "Llama-2-13B", 
                size: "13B",
                memory_fp16: 26,
                memory_int8: 14,
                memory_int4: 8,
                min_gpus: 1,
                tokens_per_second: 35,
                use_cases: ["Advanced reasoning", "Complex queries", "Production"]
            },
            {
                name: "Llama-2-70B",
                size: "70B", 
                memory_fp16: 140,
                memory_int8: 72,
                memory_int4: 38,
                min_gpus: 2,
                tokens_per_second: 18,
                use_cases: ["High-quality inference", "Research", "Premium services"]
            },
            {
                name: "CodeLlama-7B",
                size: "7B",
                memory_fp16: 14,
                memory_int8: 8, 
                memory_int4: 4,
                min_gpus: 1,
                tokens_per_second: 42,
                use_cases: ["Code generation", "Code completion", "Programming assistance"]
            },
            {
                name: "Mistral-7B",
                size: "7B",
                memory_fp16: 14,
                memory_int8: 8,
                memory_int4: 4,
                min_gpus: 1,
                tokens_per_second: 48,
                use_cases: ["Fast inference", "Real-time chat", "Edge deployment"]
            },
            {
                name: "Yi-34B", 
                size: "34B",
                memory_fp16: 68,
                memory_int8: 36,
                memory_int4: 20,
                min_gpus: 2,
                tokens_per_second: 25,
                use_cases: ["Multilingual tasks", "Advanced reasoning", "Research"]
            }
        ];
    }

    initializeMetricsData() {
        return {
            timestamps: [],
            dcgm: {
                gpu_utilization: [],
                gpu_memory_used: [],
                gpu_memory_free: [],
                gpu_power_usage: [],
                gpu_temperature: [],
                gpu_sm_clock: [],
                gpu_memory_clock: []
            },
            vllm: {
                requests_running: [],
                requests_waiting: [],
                gpu_cache_usage: [],
                generation_tokens_total: 0,
                prompt_tokens_total: 0,
                time_to_first_token: [],
                time_per_output_token: [],
                e2e_latency: [],
                request_success_total: 0
            },
            k8s: {
                pod_cpu_usage: [],
                pod_memory_usage: [],
                pod_network_receive: [],
                pod_network_transmit: [],
                node_cpu_usage: [],
                node_memory_usage: []
            },
            slo: {
                latency_compliance: [],
                gpu_util_compliance: [],
                power_compliance: [],
                queue_compliance: []
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.generateClusterNodes();
        this.renderClusterTopology();
        this.renderModels();
        this.renderTemplates();
        this.initializeCharts();
        this.startSimulation();
        this.updateClusterStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Mode toggle
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Cluster configuration
        const nodeCount = document.getElementById('nodeCount');
        nodeCount.addEventListener('input', (e) => {
            this.updateNodeCount(parseInt(e.target.value));
        });

        // Control buttons
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.toggleSimulation();
        });

        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('generateRecommendations')?.addEventListener('click', () => {
            this.generateRecommendations();
        });

        document.getElementById('resetCluster')?.addEventListener('click', () => {
            this.resetCluster();
        });

        document.getElementById('deployModels')?.addEventListener('click', () => {
            this.deploySelectedModels();
        });

        document.getElementById('applyAllRecommendations')?.addEventListener('click', () => {
            this.applyAllRecommendations();
        });

        document.getElementById('dismissAllRecommendations')?.addEventListener('click', () => {
            this.dismissAllRecommendations();
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('nav-btn--active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('nav-btn--active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('view--active');
        });
        document.getElementById(viewName).classList.add('view--active');

        this.currentView = viewName;
    }

    switchMode(mode) {
        this.mode = mode;
        
        // Update toggle UI
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.classList.remove('toggle-option--active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('toggle-option--active');

        this.showAlert(`AutoPilot switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`);
    }

    updateNodeCount(count) {
        this.cluster.nodeCount = count;
        document.getElementById('nodeCountValue').textContent = count;
        this.generateClusterNodes();
        this.renderClusterTopology();
        this.updateClusterStats();
    }

    generateClusterNodes() {
        this.cluster.nodes = [];
        this.cluster.totalGPUs = 0;
        this.cluster.totalGPUMemory = 0;

        const gpuTypes = ["NVIDIA A100", "NVIDIA H100", "NVIDIA L40S"];
        const gpuMemory = { "NVIDIA A100": 80, "NVIDIA H100": 80, "NVIDIA L40S": 48 };

        for (let i = 0; i < this.cluster.nodeCount; i++) {
            const gpuCount = Math.floor(Math.random() * 8) + 1; // 1-8 GPUs
            const gpuType = gpuTypes[Math.floor(Math.random() * gpuTypes.length)];
            const nodeMemory = gpuCount * gpuMemory[gpuType];

            this.cluster.nodes.push({
                id: `node-${i + 1}`,
                name: `Node ${i + 1}`,
                gpuCount: gpuCount,
                gpuType: gpuType,
                totalMemory: nodeMemory,
                utilization: Math.random() * 100,
                status: 'active'
            });

            this.cluster.totalGPUs += gpuCount;
            this.cluster.totalGPUMemory += nodeMemory;
        }
    }

    renderClusterTopology() {
        const container = document.getElementById('clusterTopology');
        container.innerHTML = '';

        this.cluster.nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node-card';
            nodeElement.innerHTML = `
                <div class="node-title">${node.name}</div>
                <div class="node-gpus">${node.gpuCount}x ${node.gpuType}</div>
                <div class="node-gpus">${node.totalMemory}GB Memory</div>
            `;
            container.appendChild(nodeElement);
        });
    }

    renderModels() {
        const container = document.getElementById('modelsGrid');
        container.innerHTML = '';

        this.models.forEach(model => {
            const modelElement = document.createElement('div');
            modelElement.className = 'model-card';
            modelElement.dataset.modelName = model.name;
            
            modelElement.innerHTML = `
                <div class="model-header">
                    <div class="model-name">${model.name}</div>
                    <div class="model-size">${model.size}</div>
                </div>
                <div class="model-specs">
                    <div class="spec-row">
                        <span class="spec-label">FP16 Memory:</span>
                        <span class="spec-value">${model.memory_fp16}GB</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">INT8 Memory:</span>
                        <span class="spec-value">${model.memory_int8}GB</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">INT4 Memory:</span>
                        <span class="spec-value">${model.memory_int4}GB</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">Min GPUs:</span>
                        <span class="spec-value">${model.min_gpus}</span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">Tokens/sec:</span>
                        <span class="spec-value">${model.tokens_per_second}</span>
                    </div>
                </div>
                <div class="model-use-cases">
                    ${model.use_cases.map(useCase => `<span class="use-case-tag">${useCase}</span>`).join('')}
                </div>
            `;

            modelElement.addEventListener('click', () => {
                this.toggleModelSelection(model.name, modelElement);
            });

            container.appendChild(modelElement);
        });
    }

    renderTemplates() {
        const container = document.getElementById('templateGrid');
        container.innerHTML = '';

        this.cluster.templates.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-card-item';
            templateElement.innerHTML = `
                <div class="template-title">${template.name}</div>
                <div class="template-description">${template.description}</div>
            `;

            templateElement.addEventListener('click', () => {
                this.applyTemplate(template);
            });

            container.appendChild(templateElement);
        });
    }

    toggleModelSelection(modelName, element) {
        if (this.selectedModels.has(modelName)) {
            this.selectedModels.delete(modelName);
            element.classList.remove('model-card--selected');
        } else {
            this.selectedModels.add(modelName);
            element.classList.add('model-card--selected');
        }
        this.updateDeploymentConfig();
    }

    updateDeploymentConfig() {
        const container = document.getElementById('deploymentConfig');
        
        if (this.selectedModels.size === 0) {
            container.innerHTML = '<p class="text-secondary">Select models to configure deployment settings</p>';
            return;
        }

        const selectedModelList = Array.from(this.selectedModels);
        const totalMemoryRequired = selectedModelList.reduce((total, modelName) => {
            const model = this.models.find(m => m.name === modelName);
            return total + model.memory_fp16; // Using FP16 as default
        }, 0);

        container.innerHTML = `
            <div class="deployment-summary">
                <h4>Deployment Summary</h4>
                <div class="stat-item">
                    <span class="stat-label">Selected Models:</span>
                    <span class="stat-value">${selectedModelList.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Memory Required:</span>
                    <span class="stat-value">${totalMemoryRequired}GB</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Available Memory:</span>
                    <span class="stat-value">${this.cluster.totalGPUMemory}GB</span>
                </div>
            </div>
            <div class="deployment-models">
                <h5>Selected Models:</h5>
                ${selectedModelList.map(name => `<span class="use-case-tag">${name}</span>`).join('')}
            </div>
        `;
    }

    applyTemplate(template) {
        this.updateNodeCount(template.nodes);
        
        // Clear current model selection
        this.selectedModels.clear();
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('model-card--selected');
        });

        // Select template models
        template.targetModels.forEach(modelName => {
            this.selectedModels.add(modelName);
            const modelCard = document.querySelector(`[data-model-name="${modelName}"]`);
            if (modelCard) {
                modelCard.classList.add('model-card--selected');
            }
        });

        this.updateDeploymentConfig();
        this.showAlert(`Applied ${template.name} template configuration`);
    }

    updateClusterStats() {
        document.getElementById('totalGPUs').textContent = this.cluster.totalGPUs;
        document.getElementById('totalGPUMemory').textContent = `${this.cluster.totalGPUMemory}GB`;
        
        const estimatedCapacity = Math.floor(this.cluster.totalGPUs * 20); // Simplified calculation
        document.getElementById('estimatedCapacity').textContent = `${estimatedCapacity} req/min`;
    }

    generateRecommendations() {
        this.recommendations = [];
        
        // Analyze current configuration and generate recommendations
        const utilizationData = this.getCurrentMetrics();
        
        // Memory optimization recommendations
        if (this.cluster.totalGPUMemory > 500) {
            this.recommendations.push({
                id: 'mem-opt-1',
                title: 'Memory Optimization Opportunity',
                description: 'Consider using INT8 quantization to reduce memory usage by ~40% with minimal accuracy loss',
                priority: 'medium',
                type: 'optimization',
                estimatedSavings: 120,
                actions: ['Switch to INT8 quantization', 'Reduce batch size', 'Enable memory pooling']
            });
        }

        // GPU utilization recommendations
        if (utilizationData.gpu_utilization < 70) {
            this.recommendations.push({
                id: 'util-1',
                title: 'Low GPU Utilization Detected',
                description: 'GPU utilization is below optimal range. Consider scaling down or consolidating workloads',
                priority: 'high',
                type: 'scaling',
                estimatedSavings: 250,
                actions: ['Scale down replicas', 'Consolidate models', 'Adjust resource requests']
            });
        }

        // Latency optimization
        if (utilizationData.e2e_latency > 200) {
            this.recommendations.push({
                id: 'latency-1',
                title: 'Latency SLO Violation',
                description: 'End-to-end latency exceeds 200ms target. Immediate action required',
                priority: 'high',
                type: 'performance',
                estimatedSavings: 0,
                actions: ['Scale up prefill pods', 'Optimize model loading', 'Increase batch size']
            });
        }

        // Power efficiency recommendations
        if (utilizationData.gpu_power_usage > 250) {
            this.recommendations.push({
                id: 'power-1',
                title: 'Power Consumption Optimization',
                description: 'GPU power usage exceeds efficiency targets. Apply power management policies',
                priority: 'medium',
                type: 'efficiency',
                estimatedSavings: 80,
                actions: ['Enable GPU power capping', 'Reduce clock speeds', 'Optimize cooling']
            });
        }

        // Model deployment recommendations
        if (this.selectedModels.size > 0) {
            const totalSelectedMemory = Array.from(this.selectedModels).reduce((total, name) => {
                const model = this.models.find(m => m.name === name);
                return total + model.memory_fp16;
            }, 0);

            if (totalSelectedMemory > this.cluster.totalGPUMemory * 0.8) {
                this.recommendations.push({
                    id: 'deploy-1',
                    title: 'Resource Constraint Warning',
                    description: 'Selected models require more than 80% of available GPU memory',
                    priority: 'high',
                    type: 'deployment',
                    estimatedSavings: 0,
                    actions: ['Use quantized models', 'Add more nodes', 'Reduce concurrent models']
                });
            }
        }

        // Prefill/Decode ratio optimization
        this.recommendations.push({
            id: 'ratio-1',
            title: 'Optimize Prefill/Decode Ratio',
            description: 'Current 1:3 ratio can be optimized to 1:4 for better throughput',
            priority: 'low',
            type: 'configuration',
            estimatedSavings: 60,
            actions: ['Adjust pod ratios', 'Rebalance workloads', 'Update deployment config']
        });

        this.renderRecommendations();
        this.updateRecommendationStats();
        this.showAlert(`Generated ${this.recommendations.length} recommendations`);
    }

    renderRecommendations() {
        const container = document.getElementById('recommendationsList');
        
        if (this.recommendations.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recommendations available. Generate recommendations from cluster configuration.</p>';
            return;
        }

        container.innerHTML = this.recommendations.map(rec => `
            <div class="recommendation-item recommendation-item--${rec.priority}" data-rec-id="${rec.id}">
                <div class="recommendation-header">
                    <div>
                        <div class="recommendation-title">${rec.title}</div>
                        <div class="recommendation-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</div>
                    </div>
                </div>
                <div class="recommendation-description">${rec.description}</div>
                ${rec.estimatedSavings > 0 ? `<div class="recommendation-savings">Estimated savings: $${rec.estimatedSavings}/month</div>` : ''}
                <div class="recommendation-actions">
                    <button class="btn btn--sm btn--primary" onclick="dashboard.applyRecommendation('${rec.id}')">
                        ${this.mode === 'auto' ? 'Auto-Applied' : 'Apply'}
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="dashboard.dismissRecommendation('${rec.id}')">Dismiss</button>
                </div>
            </div>
        `).join('');
    }

    updateRecommendationStats() {
        document.getElementById('pendingRecommendations').textContent = this.recommendations.length;
        document.getElementById('appliedRecommendations').textContent = this.appliedRecommendations;
        
        const totalSavings = this.recommendations.reduce((total, rec) => total + rec.estimatedSavings, 0);
        document.getElementById('estimatedSavings').textContent = `$${totalSavings}`;
    }

    applyRecommendation(recId) {
        const recommendation = this.recommendations.find(r => r.id === recId);
        if (!recommendation) return;

        // Simulate applying the recommendation
        this.appliedRecommendations++;
        this.costSavings += recommendation.estimatedSavings;
        
        // Remove from recommendations list
        this.recommendations = this.recommendations.filter(r => r.id !== recId);
        
        // Add to action history
        this.actionHistory.unshift({
            timestamp: Date.now(),
            trigger: 'Manual application',
            action: 'apply_recommendation',
            description: recommendation.title,
            status: 'completed'
        });

        this.renderRecommendations();
        this.updateRecommendationStats();
        this.showAlert(`Applied recommendation: ${recommendation.title}`);
    }

    dismissRecommendation(recId) {
        this.recommendations = this.recommendations.filter(r => r.id !== recId);
        this.renderRecommendations();
        this.updateRecommendationStats();
    }

    applyAllRecommendations() {
        const count = this.recommendations.length;
        this.recommendations.forEach(rec => {
            this.appliedRecommendations++;
            this.costSavings += rec.estimatedSavings;
        });
        this.recommendations = [];
        this.renderRecommendations();
        this.updateRecommendationStats();
        this.showAlert(`Applied all ${count} recommendations`);
    }

    dismissAllRecommendations() {
        const count = this.recommendations.length;
        this.recommendations = [];
        this.renderRecommendations();
        this.updateRecommendationStats();
        this.showAlert(`Dismissed all ${count} recommendations`);
    }

    deploySelectedModels() {
        if (this.selectedModels.size === 0) {
            this.showAlert('No models selected for deployment');
            return;
        }

        const modelList = Array.from(this.selectedModels);
        this.showAlert(`Deploying ${modelList.length} models: ${modelList.join(', ')}`);
        
        // Add to action history
        this.actionHistory.unshift({
            timestamp: Date.now(),
            trigger: 'Manual deployment',
            action: 'deploy_models',
            description: `Deployed ${modelList.length} models`,
            status: 'completed'
        });
    }

    resetCluster() {
        this.updateNodeCount(8);
        this.selectedModels.clear();
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('model-card--selected');
        });
        this.updateDeploymentConfig();
        this.recommendations = [];
        this.renderRecommendations();
        this.updateRecommendationStats();
        this.showAlert('Cluster configuration reset');
    }

    startSimulation() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isRunning) {
                this.generateMetrics();
                this.checkSLOs();
                this.runAutoPilot();
                this.updateAllDisplays();
            }
        }, 2000);
    }

    generateMetrics() {
        const timestamp = new Date().toLocaleTimeString();
        
        // Keep only last 100 data points
        if (this.data.timestamps.length >= 100) {
            this.data.timestamps.shift();
            Object.keys(this.data.dcgm).forEach(key => {
                if (Array.isArray(this.data.dcgm[key])) {
                    this.data.dcgm[key].shift();
                }
            });
            Object.keys(this.data.vllm).forEach(key => {
                if (Array.isArray(this.data.vllm[key])) {
                    this.data.vllm[key].shift();
                }
            });
            Object.keys(this.data.k8s).forEach(key => {
                if (Array.isArray(this.data.k8s[key])) {
                    this.data.k8s[key].shift();
                }
            });
            Object.keys(this.data.slo).forEach(key => {
                this.data.slo[key].shift();
            });
        }

        this.data.timestamps.push(timestamp);

        // Generate realistic metrics with cluster scaling effects
        const nodeScaling = Math.max(0.5, this.cluster.nodeCount / 20);
        const selectedModelCount = this.selectedModels.size;
        const loadFactor = selectedModelCount > 0 ? selectedModelCount * 0.3 + 0.7 : 1.0;

        // DCGM metrics
        this.data.dcgm.gpu_utilization.push(this.generateRealisticValue(75 * loadFactor, 15, 0, 100));
        this.data.dcgm.gpu_memory_used.push(this.generateRealisticValue(25000 * loadFactor, 8000, 1000, 60000));
        this.data.dcgm.gpu_memory_free.push(80000 - this.data.dcgm.gpu_memory_used[this.data.dcgm.gpu_memory_used.length - 1]);
        this.data.dcgm.gpu_power_usage.push(this.generateRealisticValue(220 * loadFactor, 40, 100, 400));
        this.data.dcgm.gpu_temperature.push(this.generateRealisticValue(65 + loadFactor * 10, 10, 40, 85));
        this.data.dcgm.gpu_sm_clock.push(this.generateRealisticValue(1500, 300, 500, 2000));
        this.data.dcgm.gpu_memory_clock.push(this.generateRealisticValue(1200, 200, 800, 1800));

        // vLLM metrics
        const runningRequests = this.generateRealisticValue(15 * nodeScaling, 10, 0, 50);
        const waitingRequests = this.generateRealisticValue(20 * loadFactor, 15, 0, 100);
        
        this.data.vllm.requests_running.push(runningRequests);
        this.data.vllm.requests_waiting.push(waitingRequests);
        this.data.vllm.gpu_cache_usage.push(this.generateRealisticValue(70 * loadFactor, 15, 0, 100));
        this.data.vllm.time_to_first_token.push(this.generateRealisticValue(150 / nodeScaling, 100, 50, 500));
        this.data.vllm.time_per_output_token.push(this.generateRealisticValue(40, 20, 10, 100));
        this.data.vllm.e2e_latency.push(this.generateRealisticValue(180 * loadFactor / nodeScaling, 80, 100, 2000));

        // Update counters
        this.data.vllm.generation_tokens_total += Math.floor(Math.random() * 100 + 50) * nodeScaling;
        this.data.vllm.prompt_tokens_total += Math.floor(Math.random() * 50 + 20) * nodeScaling;
        this.data.vllm.request_success_total += Math.floor(Math.random() * 5 + 1) * nodeScaling;

        // K8s metrics
        this.data.k8s.pod_cpu_usage.push(this.generateRealisticValue(4 * loadFactor, 2, 0, 8));
        this.data.k8s.pod_memory_usage.push(this.generateRealisticValue(16 * loadFactor, 8, 1, 32));
        this.data.k8s.pod_network_receive.push(this.generateRealisticValue(100 * nodeScaling, 50, 1, 1000));
        this.data.k8s.pod_network_transmit.push(this.generateRealisticValue(80 * nodeScaling, 40, 1, 1000));
        this.data.k8s.node_cpu_usage.push(this.generateRealisticValue(60 * loadFactor, 20, 0, 100));
        this.data.k8s.node_memory_usage.push(this.generateRealisticValue(40 * loadFactor, 15, 10, 64));
    }

    generateRealisticValue(mean, stdDev, min, max) {
        // Generate value with trending and noise
        let value = mean + (Math.random() - 0.5) * stdDev * 2;
        
        // Add trending based on time
        const trend = Math.sin(Date.now() / 60000) * stdDev * 0.3;
        value += trend;
        
        return Math.max(min, Math.min(max, Math.round(value * 100) / 100));
    }

    checkSLOs() {
        const current = this.getCurrentMetrics();
        
        // Check latency SLO (95% < 200ms)
        const latencyCompliant = current.e2e_latency < 200;
        this.data.slo.latency_compliance.push(latencyCompliant ? 100 : 0);
        
        // Check GPU utilization SLO (70-85%)
        const gpuCompliant = current.gpu_utilization >= 70 && current.gpu_utilization <= 85;
        this.data.slo.gpu_util_compliance.push(gpuCompliant ? 100 : 0);
        
        // Check power SLO (≤ 250W)
        const powerCompliant = current.gpu_power_usage <= 250;
        this.data.slo.power_compliance.push(powerCompliant ? 100 : 0);
        
        // Check queue pressure SLO (ratio < 2.0)
        const queuePressure = current.requests_waiting / Math.max(current.requests_running, 1);
        const queueCompliant = queuePressure < 2.0;
        this.data.slo.queue_compliance.push(queueCompliant ? 100 : 0);

        // Record violations
        if (!latencyCompliant) {
            this.recordViolation('Latency SLO', `E2E latency ${current.e2e_latency}ms exceeds 200ms target`);
        }
        if (!powerCompliant) {
            this.recordViolation('Power SLO', `GPU power usage ${current.gpu_power_usage}W exceeds 250W limit`);
        }
        if (!queueCompliant) {
            this.recordViolation('Queue Pressure SLO', `Queue pressure ratio ${queuePressure.toFixed(2)} exceeds 2.0 limit`);
        }
        if (!gpuCompliant) {
            this.recordViolation('GPU Utilization SLO', `GPU utilization ${current.gpu_utilization}% outside 70-85% target range`);
        }
    }

    recordViolation(type, description) {
        this.sloViolations.push({
            type,
            description,
            timestamp: new Date().toLocaleTimeString()
        });

        if (this.sloViolations.length > 50) {
            this.sloViolations.shift();
        }

        // Alert removed to prevent continuous blinking banner
        // this.showAlert(`SLO Violation: ${type} - ${description}`);
    }

    runAutoPilot() {
        if (this.mode !== 'auto') return;

        const current = this.getCurrentMetrics();
        const queuePressure = current.requests_waiting / Math.max(current.requests_running, 1);

        // AutoPilot decision logic
        if (queuePressure > 2.0) {
            this.executeAction('scale_up', 'Queue pressure exceeded threshold', 'Scale up vLLM replicas');
        } else if (current.gpu_utilization > 85) {
            this.executeAction('scale_up', 'GPU utilization > 85%', 'Scale up vLLM replicas');
        } else if (current.gpu_utilization < 70) {
            this.executeAction('scale_down', 'GPU utilization < 70%', 'Scale down vLLM replicas');
        } else if (current.e2e_latency > 200) {
            this.executeAction('model_switch', 'E2E latency > 200ms', 'Switch to quantized model');
        } else if (current.gpu_power_usage > 250) {
            this.executeAction('power_cap', 'Power usage > 250W', 'Reduce GPU clock speeds');
        } else if (current.gpu_temperature > 80) {
            this.executeAction('emergency_throttle', 'Temperature > 80°C', 'Emergency GPU throttling');
        }
    }

    executeAction(action, trigger, description) {
        // Prevent duplicate actions within 30 seconds
        const recentActions = this.actionHistory.filter(a => 
            Date.now() - a.timestamp < 30000 && a.action === action
        );
        
        if (recentActions.length > 0) return;

        const actionRecord = {
            timestamp: Date.now(),
            trigger,
            action,
            description,
            status: 'completed'
        };

        this.actionHistory.unshift(actionRecord);
        
        if (this.actionHistory.length > 100) {
            this.actionHistory.pop();
        }

        this.costSavings += Math.floor(Math.random() * 50 + 10);
        this.updateActionHistory();
    }

    getCurrentMetrics() {
        const latest = this.data.timestamps.length - 1;
        if (latest < 0) return {};

        return {
            gpu_utilization: this.data.dcgm.gpu_utilization[latest] || 0,
            gpu_power_usage: this.data.dcgm.gpu_power_usage[latest] || 0,
            gpu_temperature: this.data.dcgm.gpu_temperature[latest] || 0,
            requests_running: this.data.vllm.requests_running[latest] || 1,
            requests_waiting: this.data.vllm.requests_waiting[latest] || 0,
            e2e_latency: this.data.vllm.e2e_latency[latest] || 0
        };
    }

    showAlert(message) {
        const alertBar = document.getElementById('alertBar');
        alertBar.textContent = message;
        alertBar.classList.add('show');
        
        setTimeout(() => {
            alertBar.classList.remove('show');
        }, 5000);
    }

    hideAlert() {
        document.getElementById('alertBar').classList.remove('show');
    }

    toggleSimulation() {
        this.isRunning = !this.isRunning;
        const btn = document.getElementById('pauseBtn');
        const statusElement = document.getElementById('systemStatus');
        
        if (this.isRunning) {
            btn.textContent = 'Pause Simulation';
            statusElement.innerHTML = '<span class="status-dot status-dot--active"></span><span>ACTIVE</span>';
            this.startSimulation();
        } else {
            btn.textContent = 'Resume Simulation';
            statusElement.innerHTML = '<span class="status-dot"></span><span>PAUSED</span>';
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        }
    }

    resetSimulation() {
        this.data = this.initializeMetricsData();
        this.sloViolations = [];
        this.actionHistory = [];
        this.costSavings = 0;
        this.appliedRecommendations = 0;
        this.updateAllDisplays();
        this.updateActionHistory();
        this.hideAlert();
    }

    updateAllDisplays() {
        this.updateOverviewMetrics();
        this.updateCharts();
        this.updateSLOSummary();
        this.updateViolationHistory();
        this.updatePerformanceImpact();
        document.getElementById('costSavings').textContent = this.costSavings;
    }

    updateOverviewMetrics() {
        const current = this.getCurrentMetrics();
        const queuePressure = current.requests_waiting / Math.max(current.requests_running, 1);

        // Update metric values
        document.getElementById('gpuUtilization').textContent = current.gpu_utilization.toFixed(1);
        document.getElementById('latencyP95').textContent = current.e2e_latency.toFixed(0);
        document.getElementById('powerUsage').textContent = current.gpu_power_usage.toFixed(0);
        document.getElementById('queuePressure').textContent = queuePressure.toFixed(2);

        // Update status indicators
        this.updateStatusIndicator('gpuUtilStatus', current.gpu_utilization >= 70 && current.gpu_utilization <= 85, 'Optimal', 'Suboptimal');
        this.updateStatusIndicator('latencyStatus', current.e2e_latency < 200, 'Meeting SLO', 'SLO Violation');
        this.updateStatusIndicator('powerStatus', current.gpu_power_usage <= 250, 'Within Limits', 'Exceeds Limit');
        this.updateStatusIndicator('queueStatus', queuePressure < 2.0, 'Normal', 'High Pressure');
    }

    updateStatusIndicator(elementId, isGood, goodText, badText) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const status = element.querySelector('.status');
        if (!status) return;
        
        if (isGood) {
            status.className = 'status status--success';
            status.textContent = goodText;
        } else {
            status.className = 'status status--error';
            status.textContent = badText;
        }
    }

    updateSLOSummary() {
        const sloSummary = document.getElementById('sloSummary');
        if (!sloSummary) return;

        const current = this.getCurrentMetrics();
        const queuePressure = current.requests_waiting / Math.max(current.requests_running, 1);
        
        const slos = [
            { name: 'Latency (P95)', target: '< 200ms', current: current.e2e_latency?.toFixed(0) + 'ms' || '--', compliant: current.e2e_latency < 200 },
            { name: 'GPU Utilization', target: '70-85%', current: current.gpu_utilization?.toFixed(1) + '%' || '--', compliant: current.gpu_utilization >= 70 && current.gpu_utilization <= 85 },
            { name: 'Power Usage', target: '≤ 250W', current: current.gpu_power_usage?.toFixed(0) + 'W' || '--', compliant: current.gpu_power_usage <= 250 },
            { name: 'Queue Pressure', target: '< 2.0', current: queuePressure.toFixed(2) || '--', compliant: queuePressure < 2.0 }
        ];

        sloSummary.innerHTML = slos.map(slo => `
            <div class="slo-item ${slo.compliant ? '' : 'slo-item--error'}">
                <div class="slo-title">${slo.name}</div>
                <div class="slo-value">${slo.current}</div>
                <div class="slo-target">Target: ${slo.target}</div>
            </div>
        `).join('');
    }

    updateViolationHistory() {
        const violationHistory = document.getElementById('violationHistory');
        if (!violationHistory) return;
        
        if (this.sloViolations.length === 0) {
            violationHistory.innerHTML = '<p class="text-secondary">No violations in the monitoring period</p>';
            return;
        }

        violationHistory.innerHTML = this.sloViolations.slice(-10).reverse().map(violation => `
            <div class="violation-item">
                <div class="violation-details">
                    <div class="violation-title">${violation.type}</div>
                    <div class="violation-description">${violation.description}</div>
                </div>
                <div class="violation-time">${violation.timestamp}</div>
            </div>
        `).join('');
    }

    updatePerformanceImpact() {
        const current = this.getCurrentMetrics();
        const throughput = Math.floor(Math.random() * 50 + 100); // Simulated
        const efficiency = Math.floor((current.gpu_utilization / 85) * 100); // Based on optimal utilization

        const avgResponseTime = document.getElementById('avgResponseTime');
        const throughputElement = document.getElementById('throughput');
        const resourceEfficiency = document.getElementById('resourceEfficiency');

        if (avgResponseTime) avgResponseTime.textContent = current.e2e_latency.toFixed(0) + 'ms';
        if (throughputElement) throughputElement.textContent = throughput + ' req/s';
        if (resourceEfficiency) resourceEfficiency.textContent = efficiency + '%';
    }

    updateActionHistory() {
        const recentActions = document.getElementById('recentActions');
        if (!recentActions) return;
        
        const recent = this.actionHistory.slice(0, 3);
        
        if (recent.length === 0) {
            recentActions.innerHTML = '<p class="text-secondary">No recent actions</p>';
        } else {
            recentActions.innerHTML = recent.map(action => `
                <div class="action-item">
                    <div>
                        <div>${action.description}</div>
                        <div class="action-time">${new Date(action.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <span class="status status--success">${action.status}</span>
                </div>
            `).join('');
        }
    }

    initializeCharts() {
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        Chart.defaults.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim();

        this.createOverviewChart();
        this.createSLOChart();
        this.createResourceChart();
        this.createGPUCharts();
        this.createVLLMCharts();
        this.createSLOComplianceChart();
    }

    createOverviewChart() {
        const ctx = document.getElementById('overviewChart');
        if (!ctx) return;
        
        this.charts.overview = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'GPU Utilization (%)',
                    data: [],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true
                }, {
                    label: 'E2E Latency (ms)',
                    data: [],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false },
                scales: {
                    y: { beginAtZero: true, max: 100 },
                    y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 500 }
                },
                plugins: { legend: { display: true } }
            }
        });
    }

    createSLOChart() {
        const ctx = document.getElementById('sloChart');
        if (!ctx) return;
        
        this.charts.slo = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Latency SLO', 'GPU Util SLO', 'Power SLO', 'Queue SLO'],
                datasets: [{
                    data: [95, 92, 98, 88],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    createResourceChart() {
        const ctx = document.getElementById('resourceChart');
        if (!ctx) return;
        
        this.charts.resource = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Total GPUs', 'GPU Memory (GB)', 'Estimated Capacity'],
                datasets: [{
                    data: [this.cluster.totalGPUs, this.cluster.totalGPUMemory, Math.floor(this.cluster.totalGPUs * 20)],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    createGPUCharts() {
        // GPU Utilization
        const gpuUtilCtx = document.getElementById('gpuUtilChart');
        if (gpuUtilCtx) {
            this.charts.gpuUtil = new Chart(gpuUtilCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'GPU Utilization (%)',
                        data: [],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
        }

        // GPU Memory
        const gpuMemCtx = document.getElementById('gpuMemoryChart');
        if (gpuMemCtx) {
            this.charts.gpuMemory = new Chart(gpuMemCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Memory Used (MB)',
                        data: [],
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // GPU Power & Temperature
        const gpuPowerTempCtx = document.getElementById('gpuPowerTempChart');
        if (gpuPowerTempCtx) {
            this.charts.gpuPowerTemp = new Chart(gpuPowerTempCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Power (W)',
                        data: [],
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        fill: true
                    }, {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#D2BA4C',
                        backgroundColor: 'rgba(210, 186, 76, 0.1)',
                        fill: true,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true },
                        y1: { type: 'linear', display: true, position: 'right', beginAtZero: true }
                    }
                }
            });
        }

        // GPU Clock Speeds
        const gpuClockCtx = document.getElementById('gpuClockChart');
        if (gpuClockCtx) {
            this.charts.gpuClock = new Chart(gpuClockCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'SM Clock (MHz)',
                        data: [],
                        borderColor: '#5D878F',
                        backgroundColor: 'rgba(93, 135, 143, 0.1)',
                        fill: true
                    }, {
                        label: 'Memory Clock (MHz)',
                        data: [],
                        borderColor: '#944454',
                        backgroundColor: 'rgba(148, 68, 84, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    createVLLMCharts() {
        // vLLM Queue
        const vllmQueueCtx = document.getElementById('vllmQueueChart');
        if (vllmQueueCtx) {
            this.charts.vllmQueue = new Chart(vllmQueueCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Running Requests',
                        data: [],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true
                    }, {
                        label: 'Waiting Requests',
                        data: [],
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // vLLM Latency
        const vllmLatencyCtx = document.getElementById('vllmLatencyChart');
        if (vllmLatencyCtx) {
            this.charts.vllmLatency = new Chart(vllmLatencyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Time to First Token (ms)',
                        data: [],
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        fill: true
                    }, {
                        label: 'E2E Latency (ms)',
                        data: [],
                        borderColor: '#D2BA4C',
                        backgroundColor: 'rgba(210, 186, 76, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // vLLM Tokens
        const vllmTokenCtx = document.getElementById('vllmTokenChart');
        if (vllmTokenCtx) {
            this.charts.vllmToken = new Chart(vllmTokenCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Generation Tokens', 'Prompt Tokens', 'Successful Requests'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#5D878F']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        // vLLM Cache
        const vllmCacheCtx = document.getElementById('vllmCacheChart');
        if (vllmCacheCtx) {
            this.charts.vllmCache = new Chart(vllmCacheCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Cache Usage (%)',
                        data: [],
                        borderColor: '#5D878F',
                        backgroundColor: 'rgba(93, 135, 143, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
        }
    }

    createSLOComplianceChart() {
        const ctx = document.getElementById('sloComplianceChart');
        if (!ctx) return;
        
        this.charts.sloCompliance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Latency Compliance (%)',
                    data: [],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true
                }, {
                    label: 'GPU Util Compliance (%)',
                    data: [],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true
                }, {
                    label: 'Power Compliance (%)',
                    data: [],
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    fill: true
                }, {
                    label: 'Queue Compliance (%)',
                    data: [],
                    borderColor: '#5D878F',
                    backgroundColor: 'rgba(93, 135, 143, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    updateCharts() {
        const labels = this.data.timestamps.slice(-50);
        
        // Update overview chart
        if (this.charts.overview) {
            this.charts.overview.data.labels = labels;
            this.charts.overview.data.datasets[0].data = this.data.dcgm.gpu_utilization.slice(-50);
            this.charts.overview.data.datasets[1].data = this.data.vllm.e2e_latency.slice(-50);
            this.charts.overview.update('none');
        }

        // Update SLO doughnut chart
        if (this.charts.slo && this.data.slo.latency_compliance.length > 0) {
            const latest = Math.max(0, this.data.slo.latency_compliance.length - 10);
            const latencyAvg = this.calculateAverage(this.data.slo.latency_compliance.slice(latest));
            const gpuAvg = this.calculateAverage(this.data.slo.gpu_util_compliance.slice(latest));
            const powerAvg = this.calculateAverage(this.data.slo.power_compliance.slice(latest));
            const queueAvg = this.calculateAverage(this.data.slo.queue_compliance.slice(latest));
            
            this.charts.slo.data.datasets[0].data = [latencyAvg, gpuAvg, powerAvg, queueAvg];
            this.charts.slo.update('none');
        }

        // Update resource chart
        if (this.charts.resource) {
            this.charts.resource.data.datasets[0].data = [
                this.cluster.totalGPUs,
                this.cluster.totalGPUMemory,
                Math.floor(this.cluster.totalGPUs * 20)
            ];
            this.charts.resource.update('none');
        }

        // Update GPU charts
        if (this.charts.gpuUtil) {
            this.charts.gpuUtil.data.labels = labels;
            this.charts.gpuUtil.data.datasets[0].data = this.data.dcgm.gpu_utilization.slice(-50);
            this.charts.gpuUtil.update('none');
        }

        if (this.charts.gpuMemory) {
            this.charts.gpuMemory.data.labels = labels;
            this.charts.gpuMemory.data.datasets[0].data = this.data.dcgm.gpu_memory_used.slice(-50);
            this.charts.gpuMemory.update('none');
        }

        if (this.charts.gpuPowerTemp) {
            this.charts.gpuPowerTemp.data.labels = labels;
            this.charts.gpuPowerTemp.data.datasets[0].data = this.data.dcgm.gpu_power_usage.slice(-50);
            this.charts.gpuPowerTemp.data.datasets[1].data = this.data.dcgm.gpu_temperature.slice(-50);
            this.charts.gpuPowerTemp.update('none');
        }

        if (this.charts.gpuClock) {
            this.charts.gpuClock.data.labels = labels;
            this.charts.gpuClock.data.datasets[0].data = this.data.dcgm.gpu_sm_clock.slice(-50);
            this.charts.gpuClock.data.datasets[1].data = this.data.dcgm.gpu_memory_clock.slice(-50);
            this.charts.gpuClock.update('none');
        }

        // Update vLLM charts
        if (this.charts.vllmQueue) {
            this.charts.vllmQueue.data.labels = labels;
            this.charts.vllmQueue.data.datasets[0].data = this.data.vllm.requests_running.slice(-50);
            this.charts.vllmQueue.data.datasets[1].data = this.data.vllm.requests_waiting.slice(-50);
            this.charts.vllmQueue.update('none');
        }

        if (this.charts.vllmLatency) {
            this.charts.vllmLatency.data.labels = labels;
            this.charts.vllmLatency.data.datasets[0].data = this.data.vllm.time_to_first_token.slice(-50);
            this.charts.vllmLatency.data.datasets[1].data = this.data.vllm.e2e_latency.slice(-50);
            this.charts.vllmLatency.update('none');
        }

        if (this.charts.vllmToken) {
            this.charts.vllmToken.data.datasets[0].data = [
                this.data.vllm.generation_tokens_total,
                this.data.vllm.prompt_tokens_total,
                this.data.vllm.request_success_total
            ];
            this.charts.vllmToken.update('none');
        }

        if (this.charts.vllmCache) {
            this.charts.vllmCache.data.labels = labels;
            this.charts.vllmCache.data.datasets[0].data = this.data.vllm.gpu_cache_usage.slice(-50);
            this.charts.vllmCache.update('none');
        }

        // Update SLO compliance chart
        if (this.charts.sloCompliance) {
            this.charts.sloCompliance.data.labels = labels;
            this.charts.sloCompliance.data.datasets[0].data = this.data.slo.latency_compliance.slice(-50);
            this.charts.sloCompliance.data.datasets[1].data = this.data.slo.gpu_util_compliance.slice(-50);
            this.charts.sloCompliance.data.datasets[2].data = this.data.slo.power_compliance.slice(-50);
            this.charts.sloCompliance.data.datasets[3].data = this.data.slo.queue_compliance.slice(-50);
            this.charts.sloCompliance.update('none');
        }
    }

    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
}

// Initialize the dashboard when the page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AutoPilotDashboard();
});