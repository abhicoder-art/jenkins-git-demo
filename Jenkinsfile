pipeline {
  agent any

  environment {
    PORT = '3000'     // change to 5050 if needed
    PID_FILE = 'pid.txt'
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Install')  { steps { powershell 'npm ci' } }

    stage('Test')     { steps { powershell 'npm test' } }

    stage('Deploy (restart local app)') {
      steps {
        powershell '''
          $PidFile = $env:PID_FILE
          if ([string]::IsNullOrWhiteSpace($PidFile)) { $PidFile = "pid.txt" }

          if (Test-Path $PidFile) {
            try {
              $oldPid = Get-Content $PidFile
              if ($oldPid) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
            } catch {}
            Remove-Item $PidFile -ErrorAction SilentlyContinue
          }

          $NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
          if (-not $NodePath) { $NodePath = "C:\\Program Files\\nodejs\\node.exe" }

          $WorkDir = $env:WORKSPACE
          Set-Location $WorkDir

          $LogFile = Join-Path $WorkDir "run.log"
          "Starting deploy at $(Get-Date)" | Out-File $LogFile

          $env:PORT = "$($env:PORT)"

          $p = Start-Process -FilePath $NodePath -ArgumentList "server.js" `
               -PassThru -WorkingDirectory $WorkDir `
               -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile

          $p.Id | Out-File $PidFile -Encoding ascii -NoNewline
          "Started node at $NodePath (PID $($p.Id)) in $WorkDir on PORT=$($env:PORT)" | Add-Content $LogFile
        '''
      }
    }
  }

  post {
    success {
      archiveArtifacts artifacts: 'run.log,pid.txt', onlyIfSuccessful: true
      echo "App deployed. Open http://localhost:${env.PORT}"
    }
    failure { echo "Build failed. See console log." }
  }
}
