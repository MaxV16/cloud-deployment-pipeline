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
