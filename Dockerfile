FROM nginx:alpine

RUN apk add --no-cache entr

WORKDIR /usr/share/nginx/html

COPY Mind-Trails-website/site/ .

EXPOSE 80

CMD ["sh", "-c", "nginx -g 'daemon off;'"]
