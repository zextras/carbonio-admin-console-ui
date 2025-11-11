/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

library(
    identifier: 'jenkins-packages-build-library@1.0.5',
    retriever: modernSCM([
        $class: 'GitSCMSource',
        remote: 'git@github.com:zextras/jenkins-packages-build-library.git',
        credentialsId: 'jenkins-integration-with-github-account'
    ])
)

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
        booleanParam defaultValue: true,
            description: 'Enable SonarQube Stage',
            name: 'RUN_SONARQUBE'
        booleanParam defaultValue: false,
            description: 'Whether to upload the packages in playground repositories',
            name: 'PLAYGROUND'
    }
    tools {
        jfrog 'jfrog-cli'
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
                    gitMetadata()

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
                    nodeVersion = sh(
                        script: 'sed "s/^[vV]//" .nvmrc | cut -d. -f1',
                        returnStdout: true
                    ).trim()
                    echo "NodeJS Major Version: $nodeVersion"
                }
                withCredentials([
                    usernamePassword(
                        credentialsId: 'npm-zextras-bot-auth-token',
                        usernameVariable: 'NPM_USERNAME',
                        passwordVariable: 'NPM_PASSWORD'
                    )
                ]) {
                    script {
                        sh '''
                            if [ -f '.npmrc' ]; then
                                echo 'File .npmrc already exists'
                            else
                                echo "//registry.npmjs.org/:_authToken=${NPM_PASSWORD}" >> .npmrc
                            fi
                        '''
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
                                sh '''
                                    pnpm exec playwright install --with-deps
                                    pnpm test:ci
                                '''
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
                            sh '''
                                npm install -g @sonar/scan
                                sonar-scanner \
                                    -Dsonar.projectKey=carbonio-admin-console-ui \
                                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            '''
                        }
                    }
                }
            }
        }
        stage('build apps') {
            steps {
                container('pnpm') {
                    script {
                        sh 'node build_unified.js'
                    }
                    stash includes: 'package/**', name: 'staging'
                }
            }
        }
        stage('Build deb/rpm') {
            steps {
                script {
                    echo 'Building deb/rpm packages'
                    buildStage([
                        skipStash: false,
                        buildDirs: ['.'],
                        ubuntuSinglePkg: true,
                        rockySinglePkg: true,
                    ])
                }
            }
        }
        stage('Publish containers - devel') {
            when {
                anyOf {
                    expression {
                        isDevelBranch == true
                    }
                    expression {
                        params.PLAYGROUND == true
                    }
                }
            }
            steps {
                container('dind') {
                    withDockerRegistry(credentialsId: 'private-registry', url: 'https://registry.dev.zextras.com') {
                        script {
                            tags = ['latest', 'devel']
                            dir('apps/admin-ui-bootstrap/') {
                                dockerHelper.buildImage([
                                    imageName: 'registry.dev.zextras.com/dev/carbonio-admin-ui',
                                    imageTags: tags,
                                    ocLabels: [
                                        title: 'Carbonio Admin UI',
                                        description: 'Carbonio Admin UI Bootstrap Container'
                                    ]
                                ])
                            }
                            dir('apps/admin-ui-console/') {
                                dockerHelper.buildImage([
                                    imageName: 'registry.dev.zextras.com/dev/admin-ui-console',
                                    imageTags: tags,
                                    ocLabels: [
                                        title: 'Carbonio Admin Console',
                                        description: 'Carbonio Admin Console Container'
                                    ]
                                ])
                            }
                            dir('apps/admin-ui-cos/') {
                                dockerHelper.buildImage([
                                    imageName: 'registry.dev.zextras.com/dev/admin-ui-cos',
                                    imageTags: tags,
                                    ocLabels: [
                                        title: 'Carbonio Admin COS module',
                                        description: 'Carbonio Admin COS module Container'
                                    ]
                                ])
                            }
                        }
                    }
                }
            }
        }
        stage('Upload artifacts') {
            steps {
                uploadStage(
                    packages: yapHelper.getPackageNames('yap.json'),
                    ubuntuSinglePkg: true,
                    rockySinglePkg: true,
                )
            }
        }
    }
}
