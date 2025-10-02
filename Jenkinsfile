pipeline {
  agent any

  environment {
    PORT = '3000'
    PID_FILE = 'pid.txt'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        // install dependencies
        powershell 'npm ci'
      }
    }

    stage('Test') {
      steps {
        // run a tiny unit test
        powershell 'npm test'
      }
    }

    stage('Deploy (restart local app)') {
      steps {
        // stop existing app if running (using stored PID)
        powershell '''
          if (Test-Path ${env.PID_FILE}) {
            try {
              $pid = Get-Content ${env.PID_FILE}
              if ($pid) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
            } catch {}
            Remove-Item ${env.PID_FILE} -ErrorAction SilentlyContinue
          }
        '''

        // start app in background and store PID
        powershell '''
          $p = Start-Process "node" "server.js" -PassThru -RedirectStandardOutput run.log -RedirectStandardError run.log
          $p.Id | Out-File ${env.PID_FILE} -Encoding ascii -NoNewline
        '''
      }
    }
  }

  post {
    success {
      echo "App is (re)deployed at http://localhost:${env.PORT}"
    }
    failure {
      echo "Build failed. Check Console Output."
    }
  }
}
