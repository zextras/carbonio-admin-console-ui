FROM alpine

RUN apk add --no-cache jq

COPY dist/source/ /tmp/build/

RUN ADMIN_PATH="/opt/zextras/admin/iris/carbonio-admin-ui" \
    && mkdir -p "${ADMIN_PATH}" \
    && cp -r /tmp/build/* "${ADMIN_PATH}/" \
    && rm -r /tmp/build

ENTRYPOINT ["/bin/sh", "-c", "jq -s '{components: .}' $(find /opt/zextras/admin/iris/ -name component.json) > /opt/zextras/admin/iris/components.json"]
