FROM nginx:1.23.4

MAINTAINER LANGK

COPY nginx_bash.conf /etc/nginx/nginx.conf

COPY fastcgi_params /etc/nginx/fastcgi_params

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY dist/ /usr/share/nginx/html/

EXPOSE 80
