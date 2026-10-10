# CloudOps Health Monitor

A containerized Node.js web application deployed to Azure Virtual Machines and Azure Container Instances, with Docker image publishing and CI/CD automation using GitHub Actions.

## Overview

CloudOps Health Monitor is a lightweight web application built to demonstrate practical cloud engineering concepts, including application health checks, Docker containerization, Azure deployment options, container registries, and CI/CD automation.

The application provides a simple dashboard and a `/health` endpoint that returns the application's status, version, environment, and timestamp.

This project demonstrates how to move an application from local development to containerized cloud deployment and automate parts of the delivery process.

## Project Objectives

- Build and test a Node.js web application.
- Containerize the application using Docker.
- Publish Docker images to Docker Hub and Azure Container Registry (ACR).
- Deploy the application to an Azure Linux Virtual Machine.
- Deploy the application to Azure Container Instances (ACI).
- Automate image publishing and VM deployment using GitHub Actions.
- Verify application availability through an HTTP health endpoint.

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Application server |
| HTML and CSS | Dashboard interface |
| Docker | Containerization |
| Docker Hub | Container image storage |
| Azure Container Registry | Private container image registry |
| Azure Virtual Machines | VM-based application hosting |
| Azure Container Instances | Managed container hosting |
| Azure CLI | Azure authentication and resource interaction |
| GitHub Actions | CI/CD automation |
| SSH | Secure connection from GitHub Actions to the VM |

## Application Features

- Dashboard served through a Node.js HTTP server.
- `/health` endpoint returning JSON health information.
- Configurable application port through the `PORT` environment variable.
- Environment information controlled by `NODE_ENV`.
- Docker image with a Node.js runtime.
- Deployment to different Azure hosting environments.

**Note:** The dashboard's status labels are currently static. The `/health` endpoint returns live response data, but the dashboard does not yet fetch that endpoint to update its display dynamically.

## Project Structure

```text
CloudOps-Health-Monitor/
├── index.html
├── style.css
├── server.js
├── package.json
├── Dockerfile
├── .gitignore
└── .github/
    └── workflows/
        ├── deploy.yml
        └── deploy-vm-dockerhub.yml
```

## Run the Application Locally

### Prerequisites

Install:

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository

```bash
git clone https://github.com/ufuomaorieruo/cloudops-health-monitor.git
cd CloudOps-Health-Monitor
```

### 2. Start the application

```bash
node server.js
```

The application listens on port `3000` by default.

### 3. Test the dashboard

Open:

```text
http://localhost:3000
```

### 4. Test the health endpoint

Open:

```text
http://localhost:3000/health
```

A successful response contains fields similar to:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-10-10T12:00:00.000Z"
}
```

The timestamp shown is an example; the actual response uses the request time.

## Docker Deployment

### 1. Build the image

Run this command from the project root:

```bash
docker build -t cloudops-health-monitor:v1 .
```

### 2. Run the container

```bash
docker run -d \
  --name cloudops-dashboard \
  -p 3000:3000 \
  cloudops-health-monitor:v1
```

### 3. Verify the container

```bash
docker ps
```

Visit `http://localhost:3000` and `http://localhost:3000/health` to verify that the application responds.

## Azure Deployment

### Azure Virtual Machine

The application was deployed to an Ubuntu Linux VM using Docker.

The deployment involved:

1. Creating an Azure Virtual Machine.
2. Connecting to the VM using SSH.
3. Installing and verifying Docker.
4. Pulling the image from Docker Hub.
5. Running the container with port `80` on the VM mapped to port `3000` inside the container.
6. Testing the public dashboard and `/health` endpoint.

### Azure Container Instances

The application was also deployed to Azure Container Instances using images from two registries:

- **Docker Hub:** `ufuomaorieruo/cloudops-health-monitor:v1`
- **Azure Container Registry:** `cloudopsmonitoracr.azurecr.io/cloudops-health-monitor:v1`

For the ACR deployment, the image was tagged for the registry, pushed to ACR, verified in the Azure Portal, and selected during ACI creation.


## CI/CD with GitHub Actions

This project contains two separate workflows.

### 1. Build and Push to Azure Container Registry

Workflow file:

`.github/workflows/deploy.yml`

This workflow:

1. Runs when code is pushed to `main` or manually triggered.
2. Checks out the repository.
3. Authenticates to Azure Container Registry.
4. Builds the Docker image.
5. Pushes the image using the `latest` tag and a commit SHA tag.

The workflow publishes images to ACR. It does not deploy them to ACI.

### 2. Deploy to Azure VM through Docker Hub

Workflow file:

`.github/workflows/deploy-vm-dockerhub.yml`

This workflow:

1. Checks out the repository.
2. Authenticates to Docker Hub.
3. Builds and pushes the Docker image.
4. Connects to the Azure VM over SSH.
5. Pulls the image associated with the current commit.
6. Replaces the running container.
7. Checks the `/health` endpoint after deployment.

This provides an automated deployment path from a code change to the running application on the VM.

## GitHub Actions Secrets

Configure the following repository secrets under **Settings → Secrets and variables → Actions**.

| Secret | Purpose |
|---|---|
| `ACR_USERNAME` | ACR username used by the image-publishing workflow |
| `ACR_PASSWORD` | ACR password or token used by the image-publishing workflow |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `VM_HOST` | Azure VM public IP address |
| `VM_SSH_USER` | VM SSH username |
| `VM_SSH_PRIVATE_KEY` | Private key used by GitHub Actions to connect to the VM |

Use credentials appropriate to your registry configuration. Never commit passwords, tokens, private keys, or other secrets to the repository.

For production environments, prefer least-privilege credentials and suitable identity-based authentication where supported.

## Health Check

The `/health` endpoint provides a basic way to verify that the application responds.

Example:

```text
GET /health
```

Expected response fields:

- `status`
- `version`
- `environment`
- `timestamp`

The endpoint is used for post-deployment verification. It is not a complete monitoring system and does not independently monitor VM health, Docker infrastructure, uptime history, or cloud spending.

## Troubleshooting

### The dashboard does not open

Check whether the container is running:

```bash
docker ps
```

Inspect the container logs:

```bash
docker logs cloudops-dashboard
```

Confirm that the port mapping matches the port used by the application.

### The VM is unreachable

Check the Azure network security group, host firewall, public IP address, and SSH configuration. Confirm that inbound HTTP traffic is permitted on the configured port.

### ACR image publishing fails

Verify the registry name, registry login server, image tag, authentication credentials, and GitHub Actions run logs.

### GitHub Actions cannot connect to the VM

Verify the VM host, SSH username, public key installed on the VM, and private key stored in the GitHub repository secret.

### ACI cannot pull the image

Confirm that the repository and tag exist in ACR and that the container instance has valid permission to pull from the private registry.

## Lessons Learned

Working through this project provided practical experience with:

- Building and testing a Node.js application.
- Containerizing an application using Docker.
- Understanding the difference between Docker Hub and ACR.
- Comparing VM-based hosting with managed container hosting.
- Configuring container networking and port mappings.
- Managing authentication for registry access and SSH automation.
- Separating image publishing from application deployment.
- Verifying deployments with an HTTP health endpoint.
- Troubleshooting failures across the application, container, registry, and cloud infrastructure.

## Future Improvements

Potential improvements include:

- Connecting the dashboard to the `/health` endpoint for dynamic status updates.
- Adding automated application tests.
- Implementing deployment rollback and safer rollout strategies.
- Using managed identities or other least-privilege authentication methods.
- Enabling HTTPS.
- Adding uptime monitoring, logs, and alerting.
- Automating ACI deployments.
- Provisioning Azure infrastructure with ARM templates or Bicep.
- Scanning container images for vulnerabilities.

## Project Links


- **Docker Hub: https://hub.docker.com/r/ufuomaorieruo/cloudops-health-monitor
- **Project Documentation: https://medium.com/@akpeziorieruo/from-docker-to-azure-containerizing-an-application-deploying-on-a-vm-and-aci-and-automating-a521265a1fb5?sharedUserId=akpeziorieruo



Built as a hands-on cloud engineering portfolio project to practise containerization, Azure deployment, and CI/CD automation.
