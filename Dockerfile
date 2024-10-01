FROM deno:alpine
WORKDIR /shinysocks.net
COPY . .
CMD ["deno", "run", "release"]
