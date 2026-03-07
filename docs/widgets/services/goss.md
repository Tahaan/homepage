---
title: Goss
description: Goss Widget Configuration
---

Learn more about [Goss](https://github.com/goss-org/goss).

Displays the results of a Goss health check endpoint, showing total tests, failed tests, and skipped tests. The widget highlights with a red border when any tests are failing.

Note: Goss returns HTTP 503 when tests fail but still provides valid result data. This widget handles that correctly.

```yaml
widget:
  type: goss
  url: http://goss.host.or.ip:port
```

Note: Goss must be run in serve mode with JSON format. Example:
```bash
GOSSFILE=/opt/healthchecks/goss.yaml
LISTEN_PORT=8833
/usr/local/bin/goss --gossfile $GOSSFILE serve --format json --listen-addr :$LISTEN_PORT
```
