FROM python:alpine

RUN apk --update add build-base jpeg-dev zlib-dev mariadb-client-libs linux-headers git mariadb-dev libmagic

COPY requirements.txt /app/
RUN pip3 install -r /app/requirements.txt

RUN mkdir -p /media/

COPY . /app

CMD /app/uwsgi.sh
