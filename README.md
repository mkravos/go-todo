# go-todo
A todo application created with React-Golang and PostgreSQL.

# Running the app
Requirements:
Go, PostgreSQL, npm, make

First, edit the environment variables in server/.env to suit your configuration.

In the root directory, run the following command to start the backend:
```bash
make run
```

In the client directory, run the following command to install dependencies and start the frontend:
```bash
npm install && npm start
```

# Running the app in Docker

Ensure you have Docker installed.

In the root directory, run the following command to build the Docker container images:
```bash
docker-compose up
```

The container should be accessible at http://localhost:3000
