This repo contains 2 parts:

- Server: Contains the flask api for using the models
- Client: Contains the nextjs app for acting as a client for the models

# Running the Server (DEV)

To run the server in the dev environment, we need to create a virtual environment and then install all the dependencies present in the requirements.txt. Then run the server after activating the virtual environment. The entrypoint is `run.py`

Also create a `ml-model` folder inside the src directory of the server and then paste the contents of the extracted zip file (the models)

# Running the Client (DEV)

Use `bun run dev` or `npm run dev` or use any package manager after running the install command to install all the dependencies. In the dev mode, it is not required to create a .env as the API_URL defaults to the `localhost:5000`
