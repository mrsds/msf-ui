
FROM nginx

COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 80/tcp
