const express = require('express');
const client = require('prom-client');

const app = express();

// Coletar métricas padrão
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Contador de requisições
const requestCounter = new client.Counter({
    name: 'app_requests_total',
    help: 'Total de requisições recebidas pela aplicação',
    labelNames: ['method', 'route', 'status_code']
});

// Tempo de resposta
const responseTimeHistogram = new client.Histogram({
    name: 'app_response_time_seconds',
    help: 'Tempo de resposta das requisições em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

// Uso de memória
const memoryGauge = new client.Gauge({
    name: 'app_memory_usage_bytes',
    help: 'Uso de memória da aplicação em bytes'
});

//Contador de erros
const errorCounter = new client.Counter({
    name: 'app_errors_total',
    help: 'Total de erros na aplicação por tipo',
    labelNames: ['error_type']
});

//Usuários ativos
const activeUsersGauge = new client.Gauge({
    name: 'app_active_users',
    help: 'Número de usuários ativos na aplicação'
});

// Simular usuários ativos
setInterval(() => {
    const activeUsers = Math.floor(Math.random() * 100) + 1;
    activeUsersGauge.set(activeUsers);
}, 10000);

// Middleware para métricas
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
        
        responseTimeHistogram.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        }, duration);
        
        const memoryUsage = process.memoryUsage();
        memoryGauge.set(memoryUsage.heapUsed);
    });
    
    next();
});

app.get('/', (req, res) => {
    res.send("Prometheus + Grafana + Kubernetes + NGINX - Sistema de Monitoramento");
    res.send("🚀 CI/CD TESTE - Deploy Automático " + new Date().toLocaleString());
});

app.get('/healthz', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

//Rota de erro simulada
app.get('/simulate-error', (req, res) => {
    errorCounter.inc({ error_type: 'simulated_error' });
    res.status(500).json({ error: 'Erro simulado para teste' });
});

//Rota de usuários
app.get('/users', (req, res) => {
    const users = Math.floor(Math.random() * 100) + 1;
    res.json({ active_users: users });
});

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});