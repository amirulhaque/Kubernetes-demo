
# 🚀 Nginx Kubernetes Deployment on Amazon Linux EC2 + Minikube

This project sets up:
- A **custom Nginx Docker image** with own `index.html`
- A **Kubernetes Deployment** and **NodePort Service**
- Running on **Amazon Linux 2 EC2** instance with **Minikube**

---

## 🛠️ Step 1: Install Dependencies (EC2)
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

**🛠️ Step 2: Build & Push Docker Image**
# Clone repo
git clone https://github.com/<your-username>/nginx-k8s.git
cd nginx-k8s

# Build Docker image
docker build -t <your-dockerhub-username>/k8s-nginx-app:v1 .

# Login to DockerHub
docker login

# Push image
docker push <your-dockerhub-username>/k8s-nginx-app:v1

**🛠️ Step 3: Start Minikube**

minikube start --driver=docker

**🛠️ Step 4: Deploy to Kubernetes**

kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

Check status:

kubectl get pods
kubectl get svc


---

**🛠️ Step 5: Access the App**

minikube service nginx-service --url

Or open:

http://<EC2-Public-IP>:30080

⚠️ Make sure your EC2 Security Group allows inbound traffic on port 30080.


---

**🧹 Cleanup**

kubectl delete -f deployment.yaml
kubectl delete -f service.yaml

---
sudo install minikube-linux-amd64 /usr/local/bin/minikube
