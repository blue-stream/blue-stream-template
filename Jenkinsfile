def label = "jenkins-slave-${UUID.randomUUID().toString()}"
String determineRepoName() {
    return scm.getUserRemoteConfigs()[0].getUrl().tokenize('/').last().split("\\.")[0]
}

podTemplate(label: label, yaml:
"""
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jenkins-build-slave
    image: adobeplatform/jenkins-dind
    command: ['cat']
    tty: true
    env: 
        - name: DOCKER_HOST 
          value: tcp://localhost:2375 
  - name: dind-daemon 
    image: docker:dind 
    securityContext: 
        privileged: true 
    volumeMounts: 
        - name: docker-graph-storage 
          mountPath: /var/lib/docker 
  volumes: 
    - name: docker-graph-storage 
      emptyDir: {}
""") {

  node(label) {
    stage("GIT INFO") {
        checkout scm
        echo ":::::::::::GIT_SHORT_COMMIT::::::::::::::::::::::::"
        GIT_SHORT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
        //echo in jenkins console
        echo GIT_SHORT_COMMIT
        //wanted to send these info to build artifacts, append to any file
        sh("echo ${GIT_SHORT_COMMIT} > GIT_SHORT_COMMIT")
        def reponame = determineRepoName()
    }

    stage('run a blue-stream-feature-name test') {
      container('jenkins-build-slave') {
        withCredentials([string(credentialsId: 'ACRUSER', variable: 'ACRUSER'), string(credentialsId: 'ACRPASS', variable: 'ACRPASS'), string(credentialsId: 'BS_RMQ_SERVER', variable: 'RMQ_SERVER'), string(credentialsId: 'BS_DB_SERVER', variable: 'DB_SERVER')]) {
          checkout scm
          sh "docker login bluehub.azurecr.io -u $ACRUSER -p $ACRPASS"
          sh "docker build -t bluehub.azurecr.io/blue-stream/blue-stream-feature-name:${GIT_SHORT_COMMIT} ."
          sh "docker run --env DB_SERVER=$DB_SERVER --env RMQ_HOST=$RMQ_SERVER bluehub.azurecr.io/blue-stream/blue-stream-feature-name:${GIT_SHORT_COMMIT} npm test"       
        }
      }
    }
  }
}
