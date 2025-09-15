/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

library identifier: 'mailbox-packages-lib@master', retriever: modernSCM(
    [
        $class: 'GitSCMSource',
        remote: 'git@github.com:zextras/jenkins-packages-build-library.git',
        credentialsId: 'jenkins-integration-with-github-account'
    ]
)

def packages = ["carbonio-admin-console-ui", "carbonio-admin-ui"]

void npmLogin(String npmAuthToken) {
    if (!fileExists(file: '.npmrc')) {
        sh(
            script: """
                echo "//registry.npmjs.org/:_authToken=${npmAuthToken}" >> .npmrc
            """,
            returnStdout: false
        )
    }
}

def getNodeVersion() {
    return sh(
        script: 'sed "s/^[vV]//" .nvmrc | cut -d. -f1',
        returnStdout: true
    ).trim()
}

pipeline {
    agent {
        node {
            label 'nodejs-v1'
        }
    }
    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    parameters {
        booleanParam defaultValue: true, description: 'Enable SonarQube Stage', name: 'RUN_SONARQUBE'
    }
    stages {
        // stage('Licenses checks') {
        //     steps {
        //         container('reuse') {
        //             sh 'reuse lint'
        //         }
        //     }
        // }
        stage("Read settings") {
            steps {
                script {
                    isReleaseBranch = "${BRANCH_NAME}" ==~ /release/
                    echo "isReleaseBranch: ${isReleaseBranch}"
                    isDevelBranch = "${BRANCH_NAME}" ==~ /devel/
                    echo "isDevelBranch: ${isDevelBranch}"
                    isPullRequest = "${BRANCH_NAME}" ==~ /PR-\d+/
                    echo "isPullRequest: ${isPullRequest}"
                    isSonarQubeEnabled = params.RUN_SONARQUBE == true
                    echo "isSonarQubeEnabled: ${isSonarQubeEnabled}"
                    branchName = env.CHANGE_BRANCH
                    echo "branchName: ${branchName}"
                    nodeVersion = getNodeVersion()
                    echo "NodeJS Major Version: $nodeVersion"
                }
                withCredentials([
                    usernamePassword(
                        credentialsId: "npm-zextras-bot-auth-token",
                        usernameVariable: "NPM_USERNAME",
                        passwordVariable: "NPM_PASSWORD"
                    )
                ]) {
                    script {
                        npmLogin(NPM_PASSWORD)
                    }
                }
            }
        }
        stage('Install pnpm') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'npm install -g pnpm@latest-10'
                    }
                }
            }
        }
        stage('Install dependencies') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'pnpm install'
                    }
                }
            }
        }
        stage('lint projects') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'pnpm lint'
                    }
                }
            }
        }
        stage('type check') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'pnpm type-check'
                    }
                }
            }
        }
        stage('test') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'pnpm exec playwright install --with-deps'
                        sh 'pnpm test'
                    }
                }
            }
        }
        stage('build apps') {
            steps {
                container('nodejs-' + nodeVersion) {
                    script {
                        sh 'pnpm build'
                        stash includes: 'apps/**', excludes: 'apps/**/node_modules/**', name: 'staging'
                    }
                }
            }
        }
        stage('Build deb/rpm') {
            steps {
                script {
                    echo "Building deb/rpm packages"
                    buildStage(packages, 'staging', 'apps')()
                    buildStage([
                        skipStash: true,
                        buildDirs: ['apps'],
                        overrides: [
                            'ubuntu': [
                                preBuildScript: '''
                                apt-get update 
                                apt-get install -y --no-install-recommends rsync
                            '''
                            ]
                        ]
                    ])
                }
            }
        }
        stage('Upload artifacts') {
            steps {
                uploadStage(
                    packages: yapHelper.getPackageNames('apps/yap.json')
                )
            }
        }
    }
}
