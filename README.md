# 🚀 Kubernetes ConfigMap & Secret Demo

This project is a **Node.js web application** that demonstrates how to securely manage configuration and sensitive data in Kubernetes.

It shows how you can:
- ✅ Use **ConfigMap values** as environment variables
- ✅ Mount **ConfigMap JSON files** as volumes
- ✅ Use **Secrets** as environment variables
- ✅ Mount a **Secret key** as a volume file

---

## ✨ **What are ConfigMaps and Secrets?**

- **ConfigMap** → Stores non-sensitive configuration data (like app settings, file paths, or JSON configs).  
  Example: App environment (`APP_MODE` = production), feature flags, URLs.

- **Secret** → Stores sensitive information (like database passwords, AWS keys, API tokens).  

---

## 🔒 **Why use them?**

- **Separation of configs and code** → You don’t need to rebuild images for config changes.  
- **Security** → Sensitive data stays outside container images and repos.  
- **Portability** → Same app can run in different environments by just changing ConfigMap/Secret.  
- **Flexibility** → Configs can be injected as env vars or files mounted into the pod.  

---

## ⚙️ **Prerequisites**

1. An **EC2 instance (or VM)** with Kubernetes setup (Minikube, kubeadm, or EKS).  
2. **Docker** installed & running.  
3. **kubectl** CLI installed.  
4. GitHub repo cloned to your system.  

---

## 🚀 **How to Deploy**

1. **Build the Docker image**
   ```bash
   docker build -t config-secret-demo .
     

2. **Push the image to Docker Hub (or ECR/GCR)**
   ```bash
   docker tag config-secret-demo <your-dockerhub-username>/config-secret-demo
   docker push <your-dockerhub-username>/config-secret-demo


3. **Apply Kubernetes manifests**
   ```bash
   kubectl apply -f k8s/ns.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml


4. **Check resources**
   ```bash
   kubectl get all -n config-secret-demo


5. **Access the app**
   
   If using Minikube → run
   ```bash
   minikube service demo-service -n config-secret-demo

   If using NodePort → access via <NodeIP>:<NodePort>





---

