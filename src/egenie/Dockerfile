FROM python:3
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
RUN apt-get update && apt-get install -y \
  python3-dev \
  libmysqlclient-dev

ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/

RUN mkdir -p /media/
CMD /app/uwsgi.sh