# Justfile for vcfgen project

# Run Playwright tests
run-pw-server:
  podman run \
  -p 3001:3000 \
  --rm --init -it \
  --workdir /home/pwuser \
  --user pwuser \
  mcr.microsoft.com/playwright:v1.54.1 \
  /bin/sh -c "npx -y playwright@1.54.1 run-server --port 3000 --host 0.0.0.0"

test:
  PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3001/ npx playwright test


