stage('Deploy (restart local app)') {
  steps {
    powershell '''
      $PidFile = $env:PID_FILE
      if ([string]::IsNullOrWhiteSpace($PidFile)) { $PidFile = "pid.txt" }

      # Stop previously recorded process (if any)
      if (Test-Path $PidFile) {
        try {
          $oldPid = Get-Content $PidFile
          if ($oldPid) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
        } catch {}
        Remove-Item $PidFile -ErrorAction SilentlyContinue
      }

      # Resolve absolute node path and set workspace as working dir
      $NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
      if (-not $NodePath) { $NodePath = "C:\\Program Files\\nodejs\\node.exe" }  # common default
      $WorkDir  = $env:WORKSPACE
      Set-Location $WorkDir

      # Prepare log and envs
      $LogFile = Join-Path $WorkDir "run.log"
      "Starting deploy at $(Get-Date)" | Out-File $LogFile
      $env:PORT = "$($env:PORT)"

      # Start in background and capture PID
      $p = Start-Process -FilePath $NodePath -ArgumentList "server.js" `
           -PassThru -WorkingDirectory $WorkDir `
           -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile

      $p.Id | Out-File $PidFile -Encoding ascii -NoNewline
      "Started node at $NodePath (PID $($p.Id)) in $WorkDir on PORT=$($env:PORT)" | Add-Content $LogFile
    '''
  }
}
