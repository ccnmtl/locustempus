# syntax=docker/dockerfile:1
FROM python:3.9
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
WORKDIR /src
COPY requirements.txt /src/
RUN apt-get update
# RUN apt-get install -y libgdal-dev
RUN apt-get install -y \ 
    gdal-bin \
    libgdal-dev

# Set environment variables required by GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN pip install --upgrade pip
RUN pip install wheel setuptools
RUN pip install psycopg2-binary
RUN pip install GDAL==3.2.2.1
RUN pip install --no-deps -r requirements.txt
COPY . /src/