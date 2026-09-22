FROM nginx:alpine

RUN apk add --no-cache entr

WORKDIR /usr/share/nginx/html

COPY content/ .

EXPOSE 80

CMD ["sh", "-c", "nginx -g 'daemon off;'"]
