# AI AutoPilot Simulation & Dashboard Guide

## Overview

The AI AutoPilot Dashboard is a comprehensive simulation and monitoring system designed to demonstrate automated optimization of vLLM inference workloads on Kubernetes through real-time analysis of GPU telemetry, vLLM performance metrics, and cluster resource utilization.

## Dashboard Features

### 1. Real-Time Metrics Simulation

The dashboard simulates realistic data for three main metric categories:

#### DCGM GPU Metrics
- **GPU Utilization**: 0-100% with target range 70-85%
- **GPU Memory**: Used/Free memory in MB with dynamic allocation
- **GPU Power Usage**: 100-400W with SLO threshold at 250W
- **GPU Temperature**: 40-85°C with alert threshold at 80°C
- **GPU Clock Speeds**: SM Clock (500-2000MHz), Memory Clock (800-1800MHz)
- **GPU Encoder/Decoder Utilization**: 0-100% for video processing workloads

#### vLLM Inference Metrics
- **Request Queue**: Running (0-50) and Waiting (0-100) requests
- **GPU Cache Usage**: 0-100% cache utilization
- **Token Metrics**: Generation and prompt token counters
- **Latency Metrics**: 
  - Time to First Token: 50-500ms
  - Time per Output Token: 10-100ms
  - End-to-End Latency: 100-2000ms (SLO target: <200ms)
- **Success Rate**: Request completion tracking
- **Preemption Events**: Resource contention indicators

#### Kubernetes Cluster Metrics
- **Pod Resources**: CPU usage (0-8 cores), Memory usage (1-32GB)
- **Node Resources**: CPU utilization (0-100%), Available memory (10-64GB)
- **Network Traffic**: Receive/Transmit rates (1-1000 MB/s)

### 2. Service Level Objectives (SLOs)

The AutoPilot monitors five critical SLOs:

1. **Latency SLO**: 95% of requests complete within 200ms
2. **GPU Utilization SLO**: Maintain 70-85% utilization for cost efficiency
3. **Power Consumption SLO**: Keep power usage ≤250W per GPU
4. **Queue Pressure SLO**: Maintain waiting/running ratio <2.0
5. **Temperature SLO**: Alert when GPU temperature >80°C

### 3. AutoPilot Decision Engine

The AutoPilot automatically takes optimization actions based on SLO violations:

#### Scale Up Actions
- **Trigger**: Queue pressure >2.0 OR GPU utilization >85%
- **Action**: Increase vLLM replica count
- **Impact**: Distributes load, reduces latency

#### Scale Down Actions
- **Trigger**: GPU utilization <70% for 5+ minutes
- **Action**: Decrease vLLM replica count
- **Impact**: Reduces costs, improves efficiency

#### Model Optimization
- **Trigger**: End-to-end latency >200ms consistently
- **Action**: Switch to quantized model variant
- **Impact**: Faster inference at slight accuracy trade-off

#### Power Management
- **Trigger**: Power consumption >250W
- **Action**: Apply GPU frequency caps
- **Impact**: Reduces power draw, may slightly impact performance

#### Emergency Protection
- **Trigger**: GPU temperature >80°C
- **Action**: Emergency throttling and workload reduction
- **Impact**: Prevents hardware damage

## Dashboard Views

### 1. Overview Dashboard
- **SLO Compliance Summary**: Real-time compliance percentages
- **Key Performance Indicators**: Current values for critical metrics
- **Recent AutoPilot Actions**: Latest optimization decisions
- **Cost Savings Tracker**: Estimated savings from automation
- **System Status**: Overall health indicator

### 2. GPU Performance View
- **GPU Utilization Chart**: Real-time utilization with target bands
- **Memory Usage Tracking**: Used vs. available memory trends
- **Power Consumption Monitor**: Power usage with SLO thresholds
- **Temperature Monitoring**: Thermal status with alerts
- **Clock Speed Tracking**: SM and memory clock frequencies

### 3. vLLM Inference View
- **Request Queue Visualization**: Running vs. waiting requests
- **Latency Distribution**: Time to first token and end-to-end latency
- **Token Generation Metrics**: Throughput and generation rates
- **Cache Utilization**: GPU cache usage optimization
- **Success Rate Tracking**: Request completion statistics

### 4. Kubernetes Resources View
- **Pod Resource Utilization**: CPU and memory usage per pod
- **Node Capacity Planning**: Cluster resource availability
- **Network Traffic Analysis**: Data flow patterns
- **Resource Efficiency Metrics**: Utilization optimization

### 5. SLO Monitoring View
- **SLO Compliance Trends**: Historical compliance percentages
- **Violation History**: Timeline of SLO breaches
- **Performance Impact Analysis**: Correlation between metrics and SLOs
- **Cost-Performance Trade-offs**: Efficiency vs. performance balance

### 6. AutoPilot Actions View
- **Decision History**: Chronological log of all AutoPilot actions
- **Action Effectiveness**: Success rate and impact measurement
- **Manual Override Controls**: Ability to pause/resume automation
- **Configuration Management**: SLO threshold adjustments

## Technical Implementation

### Data Simulation
- **Update Frequency**: Metrics updated every 2 seconds
- **Data Retention**: Last 100 data points for trending
- **Realistic Patterns**: Includes noise, trends, and workload variations
- **Correlation Effects**: Actions impact subsequent metrics realistically

### SLO Calculation
- **Rolling Windows**: 5-minute windows for SLO compliance
- **Percentile Calculations**: P95 latency tracking
- **Threshold Monitoring**: Real-time violation detection
- **Hysteresis Logic**: Prevents action thrashing

### Alert System
- **Visual Indicators**: Color-coded status displays
- **Alert Notifications**: Pop-up alerts for critical violations
- **Action Logging**: Detailed history of all AutoPilot decisions
- **Performance Impact**: Tracks effectiveness of each action

## Usage Instructions

### Getting Started
1. **Load Dashboard**: Open the application in a web browser
2. **Observe Simulation**: Real-time metrics begin automatically
3. **Navigate Views**: Use the top navigation to switch between views
4. **Monitor SLOs**: Watch for violations and AutoPilot responses

### Control Options
- **Pause/Resume**: Control simulation execution
- **Reset Data**: Clear all historical data and restart
- **View Switching**: Navigate between different dashboard views
- **Alert Management**: Acknowledge and track alerts

### Understanding Metrics
- **Green Indicators**: SLO compliance, healthy operation
- **Yellow Indicators**: Warning thresholds, potential issues
- **Red Indicators**: SLO violations, active problems
- **Trend Lines**: Historical performance patterns

## Benefits Demonstrated

### Cost Optimization
- **Resource Right-sizing**: Automatic scaling based on demand
- **Power Efficiency**: GPU power management reduces electricity costs
- **Utilization Optimization**: Maintains target utilization ranges

### Performance Improvement
- **Latency Reduction**: Proactive scaling prevents queue buildup
- **Throughput Optimization**: Model switching for performance gains
- **Reliability Enhancement**: Temperature protection prevents failures

### Operational Efficiency
- **Automated Response**: Reduces manual intervention requirements
- **Predictive Actions**: Prevents issues before they impact users
- **Comprehensive Monitoring**: Single pane of glass for all metrics

## Next Steps

This simulation demonstrates the core capabilities of an AI AutoPilot system for Kubernetes-based vLLM deployments. Future enhancements could include:

- **Machine Learning Models**: Replace rule-based decisions with ML predictions
- **Advanced Scheduling**: Multi-objective optimization algorithms
- **Integration APIs**: Connect with real Prometheus/Kubernetes systems
- **Historical Analysis**: Long-term trend analysis and capacity planning
- **Multi-Cluster Support**: Federated AutoPilot across multiple clusters

The dashboard provides a comprehensive view of how AI AutoPilot can optimize inference workloads through intelligent automation, demonstrating significant potential for cost savings and performance improvements in production environments.