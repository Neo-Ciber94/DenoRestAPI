FROM denoland/deno:1.21.2

# The port that your application listens to.
EXPOSE ${PORT:-8000}

WORKDIR /app

# Prefer not to run as root.
#USER deno

# Copies the contents
COPY . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --import-map=./import-map.json src/app.ts

CMD ["deno", "task", "run"]