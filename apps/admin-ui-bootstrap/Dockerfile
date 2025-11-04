FROM alpine

RUN apk add --no-cache jq

COPY dist/source/ /tmp/build/
COPY dist/current/ /tmp/current/

RUN ADMIN_PATH="/opt/zextras/admin/iris/carbonio-admin-ui" \
    && mkdir -p "${ADMIN_PATH}" \
    && cp -r /tmp/build/* "${ADMIN_PATH}/" \
    && cp -r /tmp/current "${ADMIN_PATH}/" \
    && rm -r /tmp/build /tmp/current

ENTRYPOINT ["/bin/sh", "-c", "jq -s '{components: .}' $(find /opt/zextras/admin/iris/ -name component.json) > /opt/zextras/admin/iris/components.json"]
