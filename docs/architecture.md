# Architecture Diagram

## Cloud Deployment Pipeline

```mermaid
flowchart TD
    subgraph GitHub
        direction LR
        GC[Git Commit<br/>push to master] --> GA[GitHub Actions<br/>workflow: build-and-deploy]
    end

    subgraph Docker[Docker Hub]
        direction LR
        GA -->|build & push| DI[Image: mk758/cloud-deployment-pipeline:<tag>]
    end

    subgraph PipeCD[PipeCD Control Plane]
        direction LR
        DI -->|image-update event| PC[PipeCD piped agent]
    end

    subgraph OpenShift[OpenShift Cluster]
        direction LR
        PC -->|Git commit & sync| K8s[k8s/app.yaml manifests]
        K8s -->|Deployment| Deploy[Deployment: cloud-deployment-pipeline (2 replicas)]
        Deploy -->|Service| Svc[Service: cloud-deployment-pipeline]
        Svc -->|Route| Route[Route: cloud-deployment-pipeline<br/>HTTPS edge termination]
    end

    subgraph App[Web Application]
        direction LR
        Route -->|HTTPS| App
        App -->|/api/host| JSON[{"hostname": "$hostname", "version": "1.0.0"}]
        App -->|/healthz| Health[{"status": "ok"}]
    end

    style GitHub fill:#f0f,stroke:#333,stroke-width:2px
    style Docker fill:#bbf,stroke:#333,stroke-width:2px
    style PipeCD fill:#cfc,stroke:#333,stroke-width:2px
    style OpenShift fill:#ffd,stroke:#333,stroke-width:2px
    style App fill:#dfd,stroke:#333,stroke-width:2px
```

**Figure 9** – End-to-end cloud deployment pipeline: GitHub Actions builds and pushes the Docker image, registers the update with PipeCD, the piped agent syncs the manifests to OpenShift, and the app becomes available via the OpenShift route.