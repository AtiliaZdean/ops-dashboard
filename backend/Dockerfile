# this file tells Docker how to build our FastAPI backend image
# think of it as a recipe for creating a container

# start from official Python image
FROM python:3.11-slim

# set working directory inside the container
WORKDIR /app

# copy requirements first (better caching)
# if requirements don't change, Docker reuses this layer
COPY requirements.txt .

# install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of the backend code
COPY . .

# expose port 8000 so it's accessible outside the container
EXPOSE 8000

# command to run when container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
