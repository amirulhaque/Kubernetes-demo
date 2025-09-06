from flask import Flask, jsonify
import time, random
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)

# Custom app metrics
REQUEST_COUNT = Counter(
    "sample_app_request_total",
    "Total number of HTTP requests handled",
    ["endpoint", "method", "http_status"],
)
REQUEST_LATENCY = Histogram(
    "sample_app_request_latency_seconds",
    "Request latency",
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5)
)

@app.route("/")
def index():
    start = time.time()
    # Simulate work
    time.sleep(random.uniform(0.005, 0.2))
    latency = time.time() - start
    REQUEST_LATENCY.observe(latency)
    REQUEST_COUNT.labels(endpoint="/", method="GET", http_status=200).inc()
    return jsonify({"ok": True, "latency_seconds": latency})

@app.route("/healthz")
def healthz():
    return "ok", 200

@app.route("/metrics")
def metrics():
    # Expose default process/python metrics + our custom ones
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
