/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

library(
    identifier: 'jenkins-lib-common@1.1.2',
    retriever: modernSCM([
        $class: 'GitSCMSource',
        remote: 'git@github.com:zextras/jenkins-lib-common.git',
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
        GITHUB_TOKEN = credentials('jenkins-integration-with-github-account')
    }
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    parameters {
        booleanParam defaultValue: true,
            description: 'Enable SonarQube Stage',
            name: 'RUN_SONARQUBE'
        booleanParam defaultValue: false,
            description: 'Bump Version',
            name: 'BUMP'
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
                    isMergeCommit = sh(
                        script: 'git rev-parse --verify --quiet HEAD^2',
                        returnStatus: true
                    ) == 0
                    isBumpBuild = isReleaseBranch && (isMergeCommit || params.BUMP)
                    echo "Is Merge Commit: $isMergeCommit"
                    echo "Bump Build: $isBumpBuild"
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
        stage('Release automation') {
            when {
                expression { isBumpBuild == true }
            }
            steps {
                container('pnpm') {
                    script {
                        sh 'apt-get update && apt-get install -y jq openssh-client'

                        sh """
                            git config user.name "jenkins-integration-with-github-account"
                            git config user.email "devops@zextras.com"
                        """

                        withCredentials([usernamePassword(credentialsId: 'npm-zextras-bot-auth-token', usernameVariable: 'AUTH_USERNAME', passwordVariable: 'NPM_TOKEN')]) {
                            withCredentials([usernamePassword(credentialsId: 'jenkins-integration-with-github-account', usernameVariable: 'GH_USERNAME', passwordVariable: 'GH_TOKEN')]) {
                                sh 'pnpm run release'
                            }
                        }

                        def latestTag = sh(
                            script: 'git describe --tags --abbrev=0',
                            returnStdout: true
                        ).trim()

                        echo("Latest tag created: ${latestTag}")

                        def versionBranch = "version-bumper/${latestTag}"

                        sh """
                            git checkout -b ${versionBranch}
                            git push origin ${versionBranch}
                        """
                    }
                }
            }
            post {
                success {
                    container('pnpm') {
                        withCredentials([
                            usernamePassword(
                                credentialsId: 'jenkins-integration-with-github-account',
                                passwordVariable: 'GH_TOKEN',
                                usernameVariable: 'GH_USERNAME'
                            )
                        ]) {
                            script {
                                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                                    def latestTag = sh(
                                        script: 'git describe --tags --abbrev=0',
                                        returnStdout: true
                                    ).trim()

                                    def versionBranch = "version-bumper/${latestTag}"

                                    sh """
                                        gh pr create \
                                            --title "Release ${latestTag}" \
                                            --head "${versionBranch}" \
                                            --base "devel" \
                                            --body "Automated release PR for version ${latestTag}"
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('semantic-release') {
            when {
                not {
                    anyOf {
                        expression { isPullRequest == true }
                    }
                }
            }
            steps {
                container('pnpm') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'npm-zextras-bot-auth-token', usernameVariable: 'AUTH_USERNAME', passwordVariable: 'NPM_TOKEN')]) {
                            withCredentials([usernamePassword(credentialsId: 'jenkins-integration-with-github-account', usernameVariable: 'GH_USERNAME', passwordVariable: 'GH_TOKEN')]) {
                                sh 'pnpm run release'
                            }
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
                }
            }
            steps {
                container('dind') {
                    withDockerRegistry(credentialsId: 'private-registry', url: 'https://registry.dev.zextras.com') {
                        script {
                            tags = ['latest', 'devel']
                            dockerHelper.buildImage([
                                imageName: 'registry.dev.zextras.com/dev/carbonio-admin-ui-console',
                                imageTags: tags,
                                ocLabels: [
                                    title: 'Carbonio Admin Console UI',
                                    description: 'Carbonio Admin Console UI Container'
                                ]
                            ])
                        }
                    }
                }
            }
        }
        stage('Upload artifacts') {
            when {
                expression { return uploadStage.shouldUpload() }
            }
            tools {
                jfrog 'jfrog-cli'
            }
            steps {
                uploadStage(
                    packages: yapHelper.resolvePackageNames()
                )
            }
        }
    }
}
