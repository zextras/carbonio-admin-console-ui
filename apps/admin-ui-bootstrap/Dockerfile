FROM alpine

COPY dist/source /tmp/build

RUN COMMIT_ID=$(ls /tmp/build) \
    && WEB_PATH="/opt/zextras/admin/iris/carbonio-admin-ui/${COMMIT_ID}" \
    && mkdir -p "${WEB_PATH}" \
    && cp -r /tmp/build/* "${WEB_PATH}" \
    && rm -r /tmp/build
