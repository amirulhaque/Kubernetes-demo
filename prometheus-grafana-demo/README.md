

# 📘Monitoring Flask App on Kubernetes with Prometheus and Grafana




---

## 📘 Introduction

This project demonstrates how to deploy a Flask web application on Kubernetes, expose metrics with Prometheus, and visualize them in Grafana. It provides an end-to-end monitoring setup using Minikube on an Amazon EC2 instance.

You will learn:

🐍 How a simple Python web app exposes metrics.

📦 How Kubernetes manifests (Deployment, Service, ServiceMonitor) tie everything together.

📊 How Prometheus scrapes metrics.

📈 How Grafana visualizes those metrics.







## Prometheus and Grafana Overview  

### 🔹 Prometheus  
→ **Open-source monitoring system**  

→ Works by scraping metrics endpoints (`/metrics`) over **HTTP**  

→ Stores data in a **time-series database**  

→ Supports **PromQL queries** for analysis 

→ Integrates with **Alertmanager** for alerts  

### 🔸 Grafana  
→ **Visualization platform** for time-series data  

→ Connects to **Prometheus** (and many other sources)  

→ Lets you build dashboards with **charts, tables, gauges** 

→ Provides **real-time observability** and alerting  


### 🔗 How They Work Together  

1. **Flask App** → Exposes `/metrics` endpoint
   
2. **Prometheus** → Scrapes data and stores it
   
3. **Grafana** → Queries Prometheus and visualizes metrics  

> ℹ️ **Info:** Prometheus is the data collector and storage, while Grafana is the visualizer.  


---


**⚙️ Prerequisites**

An Amazon EC2 instance (Ubuntu 20.04+ recommended).

Installed tools:

docker

kubectl

minikube

helm


**⚠️ Note: Use at least a t3.medium EC2 instance for enough CPU & memory.**


---

**🐍 Application Code**
```bash
from flask import Flask, request
from prometheus_client import Counter, Histogram, generate_latest
import time, random

app = Flask(__name__)

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests',
    ['method', 'endpoint', 'http_status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'Histogram for request latency'
)

@app.route("/")
def index():
    start = time.time()
    time.sleep(random.uniform(0.1, 0.5)) # simulate latency
    REQUEST_COUNT.labels(method="GET", endpoint="/", http_status=200).inc()
    REQUEST_LATENCY.observe(time.time() - start)
    return "Hello from Flask with Prometheus!"

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {'Content-Type': 'text/plain'}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```


**💡 Explanation:**

🟢 Counter → Tracks total requests by method, endpoint, and status.

🟠 Histogram → Records latency distribution.

⚡ time.sleep() → Adds fake delay to generate realistic latency.

🔗 /metrics → Exposes all Prometheus-compatible metrics.



---

 ### **📦 Dockerfile**
```yaml
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY app.py app.py
EXPOSE 5000
CMD ["python", "app.py"]
```

**💡 Explanation:**

Uses lightweight Python 3.9 base image.

Installs dependencies from requirements.txt.

Exposes port 5000 (Flask default).

Runs the Flask app with CMD.



---

 ### **🚀 Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flask-app
  labels:
    app: flask-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: flask-app
  template:
    metadata:
      labels:
        app: flask-app
    spec:
      containers:
      - name: flask-app
        image: your-dockerhub-user/flask-metrics:latest
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /
            port: 5000
        readinessProbe:
          httpGet:
            path: /
            port: 5000
```

**💡 Explanation:**

Runs 2 replicas of the Flask app.

**livenessProbe →** Restarts container if it hangs.

**readinessProbe →** Ensures only healthy pods receive traffic.



---

**🌐 Kubernetes Service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: flask-service
  labels:
    app: flask-app
spec:
  selector:
    app: flask-app
  ports:
    - name: http
      port: 5000
      targetPort: 5000
  type: ClusterIP
```


**💡 Explanation:**

Exposes Flask app internally in the cluster.

Uses ClusterIP (default service type).

Named port http helps Prometheus ServiceMonitor discovery.



---

**📡 Prometheus ServiceMonitor**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: flask-servicemonitor
  labels:
    release: monitoring
spec:
  selector:
    matchLabels:
      app: flask-app
  endpoints:
  - port: http
    path: /metrics
    interval: 15s
```

**💡 Explanation:**

release: monitoring → Matches Prometheus Helm release.

Tells Prometheus to scrape http://flask-service:5000/metrics every 15s.



---

**📊 Grafana Dashboard JSON**
```yaml
{
  "title": "Flask App Metrics",
  "panels": [
    {
      "type": "graph",
      "title": "HTTP Requests",
      "targets": [
        { "expr": "rate(http_requests_total[1m])" }
      ]
    },
    {
      "type": "graph",
      "title": "Request Latency",
      "targets": [
        { "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))" }
      ]
    }
  ]
}
```
**💡 Explanation:**

First panel → Request rate (RPS).

Second panel → 95th percentile latency.



---
## 📥 **Clone the Repository**
```bash
git clone https://github.com/amirulhaque/Kubernetes-demo.git
cd prometheus-grafana-demo
```

**🛠 Step-by-Step Deployment**

 ## **Start Minikube**
 ```bash
minikube start --driver=docker
```
## **Deploy Prometheus & Grafana via Helm**
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

## **Deploy app**
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```


## **Apply ServiceMonitor**
```bash
kubectl apply -f servicemonitor.yaml
```
**✅ At this point:**

Flask app is running in Kubernetes.

Prometheus scrapes metrics.

Grafana can query and visualize them.



---

**🔍 Verification**

## **Check pods**
```bash
kubectl get pods -n monitoring
```

## **Port-forward Grafana**
```bash
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
```
Visit http://localhost:3000 → Log in with admin/prom-operator (default).

**✅ Import the dashboard JSON to see live graphs.**


---

## **🧹 Cleanup**
```bash
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml
kubectl delete -f servicemonitor.yaml
helm uninstall monitoring -n monitoring
minikube stop
```

---
