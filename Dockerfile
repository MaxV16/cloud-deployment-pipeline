# nginx-unprivileged runs as a non-root user on port 8080 by default,
# which matches how OpenShift runs containers (random UID, no root).
FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root

COPY index.html styles.css script.js /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf

# OpenShift runs containers with an arbitrary UID that belongs to the root group (GID 0).
# Make the copied files group-writable so nginx can read/replace them.
RUN chgrp -R 0 /usr/share/nginx/html /etc/nginx/conf.d \
    && chmod -R g+rwX /usr/share/nginx/html /etc/nginx/conf.d

USER 101

EXPOSE 8080
