# SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

# Makefile for Carbonio Admin Console UI
#
# Usage:
#   make build TARGET=ubuntu-jammy   # Build packages for Ubuntu 22.04
#   make clean                       # Clean build artifacts
#
# Supported targets:
#   ubuntu-jammy, ubuntu-noble, rocky-8, rocky-9

include .env

# Configuration
.DEFAULT_GOAL := help
YAP_IMAGE_PREFIX ?= docker.io/m0rf30/yap
YAP_VERSION ?= 1.49
CONTAINER_RUNTIME ?= $(shell command -v docker >/dev/null 2>&1 && echo docker || echo podman)
TARGET ?= ubuntu-jammy
OUTPUT_DIR ?= artifacts
YAP_IMAGE = $(YAP_IMAGE_PREFIX)-$(TARGET):$(YAP_VERSION)

.PHONY: all help install build build-dev test lint clean reset deploy deploy-dev

all: build

## help: Show this help message
help:
	@echo "Carbonio Admin Console UI - Build System"
	@echo ""
	@echo "This Makefile builds the Carbonio Admin Console UI and packages it"
	@echo "using YAP (Yet Another Packager) in Docker/Podman containers."
	@echo ""
	@echo "Usage:"
	@echo "  make <target> [TARGET=<distro>] [OPTIONS]"
	@echo ""
	@echo "Targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':'
	@echo ""
	@echo "Options:"
	@echo "  TARGET             Distribution target (default: $(TARGET))"
	@echo "  YAP_IMAGE_PREFIX   YAP image prefix (default: $(YAP_IMAGE_PREFIX))"
	@echo "  YAP_VERSION        YAP image version (default: $(YAP_VERSION))"
	@echo "  CONTAINER_RUNTIME  Container runtime (default: $(CONTAINER_RUNTIME))"
	@echo "  OUTPUT_DIR         Output directory for packages (default: $(OUTPUT_DIR))"
	@echo "  TEST_HOST          Remote host for deployment (set in .env or via environment)"
	@echo ""
	@echo "Examples:"
	@echo "  make build TARGET=ubuntu-jammy"
	@echo "  make build TARGET=rocky-9"
	@echo "  make deploy TEST_HOST=myserver"
	@echo ""

## install: Install all dependencies across workspaces
install:
	pnpm install

## build: Build JS apps then package for the specified TARGET
build:
	@echo "Building JS apps..."
	pnpm build
	@echo "Packaging for $(TARGET)..."
	@mkdir -p $(OUTPUT_DIR)/$(TARGET)
	$(CONTAINER_RUNTIME) run --rm \
		--entrypoint=yap \
		-v "$(CURDIR)/$(OUTPUT_DIR)/$(TARGET)":/artifacts \
		-v "$(CURDIR)":/project \
		$(YAP_IMAGE) \
		build $(TARGET) /project

## build-dev: Build JS apps in development mode (no cache), without packaging
build-dev:
	pnpm build:dev

## test: Run tests across all packages
test:
	pnpm test

## lint: Run ESLint and TypeScript type checks
lint:
	pnpm type-lint

## clean: Remove build artifacts and Turbo cache
clean:
	rm -rf .turbo $(OUTPUT_DIR)
	find . -name 'dist' -not -path '*/node_modules/*' -type d -exec rm -rf {} + 2>/dev/null || true

## reset: Full clean reinstall (removes node_modules, lock file, cache)
reset:
	pnpm reset

## deploy: Deploy to TEST_HOST defined in .env
deploy:
	pnpm run deploy ${TEST_HOST}

## deploy-dev: Deploy development build to TEST_HOST defined in .env
deploy-dev:
	pnpm run deploy:dev ${TEST_HOST}
