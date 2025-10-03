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

def buildContainer(String dockerfile, String imageName, List < String > versions, String commitHash, String source) {
    tagsToAdd = []
    versions.each {
        version -> tagsToAdd.add("-t " + imageName + ":" + version)
    }
    sh 'docker build ' + '--label org.opencontainers.image.vendor="Zextras" ' + '--label org.opencontainers.image.revision="' 
        + commitHash + '" ' + '-f ' + dockerfile + ' ' + tagsToAdd.join(" ") + ' ' 
        + source
    sh 'docker push --all-tags ' + imageName
}

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
    environment {
        GITHUB_BOT_PR_CREDS = credentials('jenkins-integration-with-github-account')
    }
    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    parameters {
        booleanParam defaultValue: true, description: 'Enable SonarQube Stage', name: 'RUN_SONARQUBE'
    }
    stages {
        stage('Licenses checks') {
            steps {
                container('reuse') {
                    sh 'reuse lint'
                }
            }
        }
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
        stage('Install dependencies') {
            steps {
                container('pnpm') {
                    script {
                        sh 'pnpm install'
                    }
                }
            }
        }
        stage('Code quality') {
            parallel {
                stage('lint') {
                    steps {
                        container('pnpm') {
                            script {
                                sh 'pnpm lint'
                            }
                        }
                    }
                }
                stage('type check') {
                    steps {
                        container('pnpm') {
                            script {
                                sh 'pnpm type-check'
                            }
                        }
                    }
                }
                stage('test') {
                    steps {
                        container('pnpm') {
                            script {
                                sh 'pnpm exec playwright install --with-deps'
                                sh 'pnpm test:ci'
                            }
                        }
                    }
                }
            }
        }
        stage('SonarQube console') {
            steps {
                container('pnpm') {
                    withSonarQubeEnv(credentialsId: 'sonarqube-user-token', installationName: 'SonarQube instance') {
                        script {
                            sh "npm install -g @sonar/scan"
                            sh "sonar-scanner -Dsonar.projectKey=carbonio-admin-console-ui"
                        }
                    }
                }
            }
        }
        stage('build apps') {
            steps {
                container('pnpm') {
                    script {
                        sh 'pnpm build'
                    }
                }
            }
        }
        stage('Build deb/rpm') {
            steps {
                script {
                    echo "Building deb/rpm packages"
                    buildStage([
                        skipStash: true,
                        buildDirs: ['apps'],
                    ])
                }
            }
        }
        stage('Publish containers - devel') {
            // when {
            //     allOf {
            //         expression {
            //             isDevelBranch == true
            //         }
            //     }
            // }
            steps {
                // build bootstrap container
                script {
                    def dir = 'admin-ui-bootstrap/'
                    def dockerfilePath = "apps/${dir}/Dockerfile"
                    def projectName = 'carbonio-admin-ui'
                    def commitId = sh(
                        script: "find apps/${dir}/dist/source -maxdepth 1 -mindepth 1 -type d -printf '%f\\n' | grep -v 'current' | head -n 1",
                        returnStdout: true
                    ).trim()
                    echo "Building container for ${dir}, project name ${projectName}"
                    container('dind') {
                        withDockerRegistry(credentialsId: 'private-registry', url: 'https://registry.dev.zextras.com') {
                            buildContainer(
                                dockerfilePath,
                                "registry.dev.zextras.com/dev/${projectName}",
                                ['latest', 'devel'],
                                commitId,
                                "apps/${dir}"
                            )
                        }
                    }
                }
                // build console container
                script {
                    def dir = 'admin-ui-console/'
                    def dockerfilePath = "apps/${dir}/Dockerfile"
                    def projectName = 'carbonio-admin-console-ui'
                    def commitId = sh(
                        script: "find apps/${dir}/dist/source -maxdepth 1 -mindepth 1 -type d -printf '%f\\n' | grep -v 'current' | head -n 1",
                        returnStdout: true
                    ).trim()
                    echo "Building container for ${dir}, project name ${projectName}"
                    container('dind') {
                        withDockerRegistry(credentialsId: 'private-registry', url: 'https://registry.dev.zextras.com') {
                            buildContainer(
                                dockerfilePath,
                                "registry.dev.zextras.com/dev/${projectName}",
                                ['latest', 'devel'],
                                commitId,
                                "apps/${dir}"
                            )
                        }
                    }
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
