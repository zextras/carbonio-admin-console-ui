FROM --platform=$BUILDPLATFORM backplane/jq:latest AS builder

# Define path variables
ENV IRIS_BASE_PATH="/opt/zextras/admin/iris" \
    WEB_PATH="/opt/zextras/admin/iris/carbonio-admin-ui-subscription"

# Set up directories
RUN mkdir -p "${WEB_PATH}"

# Copy application files
COPY dist/source/ ${WEB_PATH}/

# Final stage - built for all target platforms
FROM backplane/jq:latest

# Just copy the prepared files (no execution needed)
COPY --from=builder /opt/zextras /opt/zextras

# Generate components.json from all component.json files
ENTRYPOINT ["/bin/sh", "-c", "jq -s '{components: .}' $(find ${IRIS_BASE_PATH}/ -name component.json) > ${IRIS_BASE_PATH}/components.json"]
