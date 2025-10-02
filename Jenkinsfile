pipeline {
  agent any

  environment {
    PORT = '3000'
    PID_FILE = 'pid.txt'   // default value so it never comes through as null
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Install') { steps { powershell 'npm ci' } }

    stage('Test') { steps { powershell 'npm test' } }

    stage('Deploy (restart local app)') {
      steps {
        // Stop old process if running, then start and save PID
        powershell '''
          # Resolve PID file path from env or default
          $PidFile = $env:PID_FILE
          if ([string]::IsNullOrWhiteSpace($PidFile)) { $PidFile = "pid.txt" }

          # Stop previously running node (ignore errors)
          if (Test-Path $PidFile) {
            try {
              $oldPid = Get-Content $PidFile
              if ($oldPid) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
            } catch {}
            Remove-Item $PidFile -ErrorAction SilentlyContinue
          }

          # Start app in background and store PID
          $p = Start-Process "node" "server.js" -PassThru `
               -RedirectStandardOutput run.log -RedirectStandardError run.log
          $p.Id | Out-File $PidFile -Encoding ascii -NoNewline

          Write-Host "Started node with PID $($p.Id). Using PID file: $PidFile"
        '''
      }
    }
  }

  post {
    success { echo "App deployed at http://localhost:${env.PORT}" }
    failure { echo "Build failed. See console log." }
  }
}
