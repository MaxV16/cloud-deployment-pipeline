# pipecd setup

this is how the continuous delivery part of the pipeline is put together.

## the flow

1. a push to `master` starts the github actions workflow.
2. github actions builds the docker image and pushes it to docker hub with two tags: `latest` and the commit sha.
3. the workflow registers an `image-update` event with pipecd, including the image tag and the commit hash/url.
4. piped picks up the event, updates the image field in `k8s/app.yaml`, and pushes that change back to the repo.
5. piped sees the new commit, applies the manifests to openshift, and reports the deployment in the pipecd web ui.

the `commit-hash` and `commit-url` fields are what make the deployment trace work: from the pipecd ui you can go straight from a deployment back to the commit that caused it.

## 1. install the control plane

follow the pipecd quickstart to install the control plane and the `pipectl` cli. the control plane does not have to run on the same cluster as the app.

```bash
pipectl version
```

create a project in the control plane and keep the project id.

## 2. register piped

generate the piped id and key from the control plane, then register the agent:

```bash
pipectl piped register \
  --address=<control-plane-host>:443 \
  --api-key=<api-key> \
  --name=openshift-sandbox
```

this returns a piped id and a key. save the key to a file and create the kubernetes secret:

```bash
kubectl create secret generic piped-secret \
  --from-file=piped-key=./piped-key \
  -n pipecd
```

## 3. install piped on openshift

the sandbox runs containers with an arbitrary uid, so use the okd variant of the piped image. it uses `nss_wrapper` to deal with the random uid instead of needing root.

copy `piped/piped-config.example.yaml`, fill in `projectID`, `pipedID` and `apiAddress`, then install the agent with the pipecd helm chart (or the manifests from the pipecd installation guide). the config is passed in as the piped config file.

check that it came up:

```bash
oc get pods -n pipecd
oc logs deployment/piped -n pipecd
```

## 4. add the application

the application config is `app.pipecd.yaml` in the repo root. it tells piped which manifests to apply and how to handle the image update event.

```bash
pipectl app add \
  --address=<control-plane-host>:443 \
  --api-key=<api-key> \
  --name=cloud-deployment-pipeline \
  --piped-id=<piped-id> \
  --repo-id=cloud-deployment-pipeline \
  --app-dir=. \
  --platform-provider=openshift
```

after that the app shows up in the pipecd ui and the first sync can be triggered from there.

## 5. github secrets

the workflow needs these secrets:

| secret | used for |
| --- | --- |
| `DOCKERHUB_USERNAME` | docker hub login |
| `DOCKERHUB_TOKEN` | docker hub login |
| `PIPECD_API_ADDRESS` | control plane grpc address, `host:443` |
| `PIPECD_API_KEY` | api key with the `READ_WRITE` role |

## 6. test it

push a small change to `master` and watch the run. after the workflow finishes you should see:

1. a new commit from piped changing the image tag in `k8s/app.yaml`
2. a new deployment in the pipecd ui linked to your commit
3. the new pod running in openshift

to test a rollback, open the deployment in the pipecd ui, pick the previous version and roll back. piped will apply the older manifests again.
