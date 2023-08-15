# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
WORKDIR /src
COPY requirements.txt /src/
RUN pip install --no-deps -r requirements.txt
COPY . /src/