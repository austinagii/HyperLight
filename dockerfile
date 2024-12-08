FROM python:3.12-bullseye AS base

WORKDIR /hyperlight 

COPY . .

RUN pip install -r requirements.txt 

CMD ["bash"]
