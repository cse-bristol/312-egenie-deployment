# Set nginx base image
FROM nginx

# File Author / Maintainer
MAINTAINER Anand Mani Sankar

RUN rm -v /etc/nginx/conf.d/default.conf

# Copy custom configuration file from the current directory
ADD egenie.conf /etc/nginx/conf.d/