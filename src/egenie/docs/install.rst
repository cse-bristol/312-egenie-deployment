Installation
============

eGenie can be started as a set of docker containers, avoiding the setup process that would be needed otherwise.

First, install [Docker Compose](https://docs.docker.com/compose/install/) on your local machine. On Linux you will need to first install the [Docker Engine](https://docs.docker.com/engine/installation/#server).

Clone the eGenie repository, or download and extract it.

If you are on Linux, ensure you are a member of the docker user group:

```
$ usermod -a -G docker username
```

cd into the eGenie source folder, and run:

```
$ docker-compose up -d
```
Once that is completed, start a shell on your app container:

```
$ docker-compose exec app /bin/sh
$ cd app
```

Create a superuser - you will be prompted for an email address and password.
```
$ python manage.py createsuperuser --username admin
```

Create the two categories of pinboard post (public and fm messages):
```
$ python manage.py create_spirit_categories
```

Make an anonymous user. This is used to ensure that supporting applications work correctly (e.g. accessing sensor data as a single user).
```
$ python manage.py create_anonymous_user
```

Install some initial models, including a temperature sensor, electricity sensor, deployment, and plinth.
```
$ python manage.py create_deployment_models
```


Initial Configuration
---------------------

TODO: Document env file, settings file.

Deployment
----------

