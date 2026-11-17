# cloud-deployment-pipeline

a simple static website (html, css, js) served by nginx. github actions builds it into a
docker image, and pipecd deploys that image to openshift.

## build and run it locally

```bash
docker build --build-arg APP_VERSION=$(git rev-parse --short HEAD) -t cloud-deployment-pipeline .
docker run --rm -p 8080:8080 cloud-deployment-pipeline
```

`APP_VERSION` is passed in at build time and shown as the app version on the page and in
`/api/host`. the workflow sets it to the commit sha, so the page always says what is running.

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

- `k8s/app.pipecd.yaml` is the pipecd application config
- `piped/piped-config.example.yaml` is the config for the piped agent
- `docs/pipecd-setup.md` has the install steps
