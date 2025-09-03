---

# 🚀 Auto-Scaling a Kubernetes Deployment with HPA

This project demonstrates how to configure Horizontal Pod Autoscaler (HPA) in Kubernetes to dynamically scale pods based on CPU utilization. It includes a sample Node.js application, Dockerfile, Kubernetes manifests, and load testing setup.


---

## 📌 **Key Concepts**

**Horizontal Pod Autoscaler (HPA):** Automatically adjusts the number of pods in a deployment based on resource utilization (e.g., CPU or memory).

**Metrics Server:** Collects CPU/Memory usage from nodes and pods. Required for HPA to work.

**Resource Requests & Limits:** Ensure fair allocation of cluster resources by defining how much CPU/memory each pod can request and use.



---

## 🛠️ **Prerequisites**

Docker

kubectl

Minikube or any Kubernetes cluster (EKS, GKE, AKS, etc.)

Metrics Server



---

## 📥 **Clone the Repository**
```bash
git clone https://github.com/your-username/hpa-demo.git
cd hpa-demo
```

### 🖥️ **Application Code**

```yaml
app/server.js
const http = require('http');
const os = require('os');
console.log("CPU Stress App starting...");
const handler = (req, res) => {
  // Simulate CPU load: busy loop for 500ms
  const end = Date.now() + 500;
  while (Date.now() < end) {}
  res.writeHead(200);
  res.end("Hello from HPA demo! Host: " + os.hostname() + "\n");
};
http.createServer(handler).listen(8080);
```

### 🔎 **Explanation**

- **Starts a simple HTTP server on port 8080.**

- **On each request, it simulates CPU load by looping for ~500ms.**

- **This artificial stress makes it easier to trigger HPA scaling.**

- **Uses os.hostname() to print the pod name → helpful when multiple pods run.**




---

## 📦 **Kubernetes Resources Explained**


### 1. Deployment (k8s/deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hpa-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hpa-demo
  template:
    metadata:
      labels:
        app: hpa-demo
    spec:
      containers:
      - name: hpa-demo
        image: your-docker-id/hpa-demo:1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

🔎 **Explanation**


- **replicas: 1** → Starts with 1 pod.  
- **image** → Uses the Docker image we build and push.  
- **resources.requests** → Minimum guaranteed CPU/Memory for each pod.  
- **resources.limits** → Maximum allowed CPU/Memory per pod.  
- **Why important** → HPA scales pods based on CPU utilization compared to requests.




---


### 2. Service (k8s/service.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hpa-demo-service
spec:
  selector:
    app: hpa-demo
  ports:
    - port: 80
      targetPort: 80
  type: NodePort
```
🔎 **Explanation**


- **kind: Service** → Exposes pods inside the cluster.
- **metadata.name** → Name of the service (hpa-demo-service).
- **selector.app** → Matches pods with label app: hpa-demo.
- **ports.port (80)** → The port exposed by the service inside the cluster.
- **ports.targetPort (80)** → The container port that traffic is forwarded to.
- **type: ClusterIP** → Default type, makes service accessible only inside the cluster.




---

### 3. HPA (k8s/hpa.yaml)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-demo-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hpa-demo-deployment
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```
🔎 **Explanation**

- **kind**: HorizontalPodAutoscaler → Defines autoscaling rules.
- **scaleTargetRef** → Points to the Deployment (hpa-demo-deployment) to scale.
- **minReplicas:** 1 → Minimum 1 pod always running.
- **maxReplicas:** 5 → Can scale up to 5 pods.
- **metrics.type:** Resource → Uses resource-based metrics (CPU in this case).
- **averageUtilization:** 50 → If average CPU > 50%, HPA adds more pods; if lower, it scales down.



---

### 🐳 **Build & Push Docker Image**

  ```bash
   docker build -t your-docker-id/hpa-demo:1.0 .
   docker push your-docker-id/hpa-demo:1.0
  ```

---

### 🚀 **Deploy to Kubernetes**

```bash
     kubectl apply -f k8s/deployment.yaml
     kubectl apply -f k8s/service.yaml
     kubectl apply -f k8s/hpa.yaml
```

    
**Check:**
```bash
  kubectl get pods
  kubectl get svc
  kubectl get hpa
```


---

### 📊 **Install Metrics Server**


**HPA requires metrics-server:**
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

**For Minikube, patch with:**
```bash
kubectl edit deployment metrics-server -n kube-system
```

**Add under args:**
```bash
- --kubelet-insecure-tls
- --kubelet-preferred-address-types=InternalIP
```


---

### ⚡ **Generate Load**


**Run a test pod:**
```bash
kubectl run -i --tty load-generator \
  --image=busybox --restart=Never -- /bin/sh
```

**Inside it:**
```bash
while true; do wget -q -O- http://hpa-demo-service.default.svc.cluster.local; done
```

---

📈 **Observe Scaling**
```bash
kubectl get hpa --watch
kubectl get pods -l app=hpa-demo
```


### ✅ **Expected behavior:**

- **Start with 1 pod.**
- **Scale up to 5 pods under heavy load.**
- **Scale back down when idle.**



---

---

### 📝 **Conclusion**

 **This project shows how to.:**

- **Deploy an app with CPU requests/limits.**
- **Install Metrics Server.**
- **Configure HPA.**
- **Generate load and observe scaling in real-time.**




---
