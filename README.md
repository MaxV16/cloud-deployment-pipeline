# cloud-deployment-pipeline

a simple static website (html, css, js) served by nginx. it gets built into a docker
image and deployed to openshift with github actions.

## build and run it locally

```bash
docker build -t cloud-deployment-pipeline .
docker run --rm -p 8080:8080 cloud-deployment-pipeline
```

## push it to docker hub

```bash
docker login
docker tag cloud-deployment-pipeline mk758/cloud-deployment-pipeline:latest
docker push mk758/cloud-deployment-pipeline:latest
```

## continuous delivery with pipecd

the github actions workflow only builds the image and pushes it to docker hub. it then registers
an image update event with pipecd, and the piped agent updates the image tag in `k8s/app.yaml`
and syncs the manifests to openshift.

- `app.pipecd.yaml` is the pipecd application config
- `piped/piped-config.example.yaml` is the config for the piped agent
- `docs/pipecd-setup.md` has the install steps
