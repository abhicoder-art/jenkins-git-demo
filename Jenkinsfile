pipeline {
  agent any

  environment {
    PORT = '3000'         // change if 3000 is busy
    PID_FILE = 'pid.txt'
    ARTIFACT = 'app.zip'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        // Install deps & run build script (harmless in our simple app)
        powershell '''
          npm ci
          if (Test-Path package.json) { npm run build --if-present }
        '''
      }
    }

    stage('Test') {
      steps {
        powershell 'npm test'
      }
    }

    stage('Package') {
      steps {
        // Create a clean, lightweight artifact for demo purposes
        powershell '''
          # Make a temp folder with only what we need to run
          Remove-Item -Recurse -Force dist  -ErrorAction SilentlyContinue
          New-Item -ItemType Directory dist | Out-Null
          Copy-Item server.js,app.js,package.json package-lock.json -Destination dist -Force
          # production deps only to keep artifact small (optional)
          pushd dist
          npm ci --omit=dev
          popd

          # Zip it
          Remove-Item $env:ARTIFACT -ErrorAction SilentlyContinue
          Compress-Archive -Path dist\\* -DestinationPath $env:ARTIFACT
        '''
      }
    }

    stage('Deploy') {
      steps {
        powershell '''
          $PidFile = $env:PID_FILE
          if ([string]::IsNullOrWhiteSpace($PidFile)) { $PidFile = "pid.txt" }

          # Stop old process if recorded
          if (Test-Path $PidFile) {
            try {
              $oldPid = Get-Content $PidFile
              if ($oldPid) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
            } catch {}
            Remove-Item $PidFile -ErrorAction SilentlyContinue
          }

          # Expand artifact to a fresh run folder
          $RunDir = Join-Path $env:WORKSPACE "run"
          Remove-Item -Recurse -Force $RunDir -ErrorAction SilentlyContinue
          New-Item -ItemType Directory $RunDir | Out-Null
          Expand-Archive -Path $env:ARTIFACT -DestinationPath $RunDir -Force

          # Resolve node path
          $NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
          if (-not $NodePath) { $NodePath = "C:\\Program Files\\nodejs\\node.exe" }

          # Start app from the run folder and capture logs
          $LogFile = Join-Path $RunDir "run.log"
          $env:PORT = "$($env:PORT)"
          $p = Start-Process -FilePath $NodePath -ArgumentList "server.js" `
               -PassThru -WorkingDirectory $RunDir `
               -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile

          $p.Id | Out-File $PidFile -Encoding ascii -NoNewline
          Write-Host "Started node at $NodePath (PID $($p.Id)) on PORT=$($env:PORT)"
        '''
      }
    }
  }

  post {
    success {
      archiveArtifacts artifacts: 'run.log,pid.txt,app.zip', onlyIfSuccessful: false, allowEmptyArchive: true
      echo "App deployed. Open http://localhost:${env.PORT}"
    }
    failure {
      echo "Build failed. Check Console Output."
    }
  }
}
