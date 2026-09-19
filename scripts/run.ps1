param(
    [Parameter(Position = 0)]
    [ValidateSet('all', 'install', 'test', 'format', 'lint', 'typecheck', 'build', 'dev')]
    [string]$Command = 'all'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ProjectRoot {
    return (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath '..')).Path
}

function Get-NpmCommand {
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npm) {
        $npm = Get-Command npm -ErrorAction SilentlyContinue
    }
    if (-not $npm) {
        Write-Host "🟥 Failed: npm is not installed or not available in PATH." -ForegroundColor Red
        exit 1
    }
    return $npm.Path
}

function Get-PackageJson {
    $path = Join-Path -Path (Get-ProjectRoot) -ChildPath 'package.json'
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "🟥 Failed: package.json not found." -ForegroundColor Red
        exit 1
    }
    return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
}

function Test-NpmScript {
    param([string]$Name)
    $pkg = Get-PackageJson
    if ($null -ne $pkg.scripts) {
        return $null -ne $pkg.scripts.PSObject.Properties[$Name]
    }
    return $false
}

function Get-ExecutionTimeStr {
    param([TimeSpan]$Time)
    if ($Time.TotalSeconds -lt 1) {
        return "$([math]::Round($Time.TotalMilliseconds))ms"
    }
    return "$([math]::Round($Time.TotalSeconds, 2))s"
}

function Invoke-Npm {
    param(
        [string[]]$Arguments,
        [switch]$WarnOnly
    )
    $npm = Get-NpmCommand
    $root = Get-ProjectRoot
    
    $displayCmd = "npm " + ($Arguments -join ' ')
    Write-Host "🟦 Running: $displayCmd" -ForegroundColor Cyan
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $process = Start-Process -FilePath $npm -ArgumentList $Arguments -WorkingDirectory $root -NoNewWindow -Wait -PassThru
    $sw.Stop()
    $timeStr = Get-ExecutionTimeStr -Time $sw.Elapsed
    
    if ($process.ExitCode -eq 0) {
        Write-Host "🟩 Success: $displayCmd ($timeStr)" -ForegroundColor Green
    } else {
        if ($WarnOnly) {
            Write-Host "🟨 Warning: $displayCmd exited with code $($process.ExitCode) ($timeStr)" -ForegroundColor Yellow
        } else {
            Write-Host "🟥 Failed: $displayCmd (Exit Code: $($process.ExitCode)) ($timeStr)" -ForegroundColor Red
        }
    }
    return @{ ExitCode = $process.ExitCode; Time = $timeStr }
}

function Invoke-NpmScript {
    param(
        [string]$Name,
        [switch]$Required
    )
    
    if (-not (Test-NpmScript -Name $Name)) {
        if ($Required) {
            Write-Host "🟥 Failed: Required script '$Name' not found in package.json." -ForegroundColor Red
            exit 1
        } else {
            Write-Host "🟨 Skipped: '$Name' (script not found)" -ForegroundColor Yellow
            return @{ ExitCode = 0; Skipped = $true; Time = "0ms" }
        }
    }
    
    $args = @('run', $Name)
    if ($Name -eq 'test') {
        $args = @('test')
    }
    
    $result = Invoke-Npm -Arguments $args
    return @{ ExitCode = $result.ExitCode; Skipped = $false; Time = $result.Time }
}

function EnsureBuild {
    $build = Join-Path -Path (Get-ProjectRoot) -ChildPath ".next\BUILD_ID"
    if (-not (Test-Path -LiteralPath $build)) {
        Write-Host "🟥 Failed: .next production build not found." -ForegroundColor Red
        exit 1
    }
}

function Clear-Port {
    param([int]$Port = 3000)
    Write-Host "🟦 Running: Clear Port $Port" -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String 'LISTENING'
    if ($connections) {
        foreach ($conn in $connections) {
            $parts = $conn.ToString().Trim() -split '\s+'
            $pidStr = $parts[-1]
            if ($pidStr -match '^\d+$') {
                Write-Host "Freeing port $Port (Killing PID $pidStr)..." -ForegroundColor Yellow
                try {
                    Stop-Process -Id ([int]$pidStr) -Force -ErrorAction SilentlyContinue
                } catch {}
            }
        }
        Start-Sleep -Seconds 1
    }
    $sw.Stop()
    $timeStr = Get-ExecutionTimeStr -Time $sw.Elapsed
    Write-Host "🟩 Success: Clear Port $Port ($timeStr)" -ForegroundColor Green
}

function Print-Summary {
    param([hashtable]$Results)
    
    Write-Host ""
    Write-Host "──────────────────────────────"
    Write-Host "Project Health Check Complete"
    Write-Host ""
    
    $hasFailure = $false
    
    foreach ($step in @('Install', 'Audit', 'Test', 'Format', 'Lint', 'Typecheck', 'Build', 'Dev Server')) {
        $res = $Results[$step]
        $statusStr = ""
        
        if ($res.Skipped) {
            $statusStr = "Skipped"
        } elseif ($res.ExitCode -eq 0) {
            $statusStr = "`u{2713}"
        } elseif ($step -eq 'Audit') {
            $statusStr = "`u{2713} / Warning"
        } else {
            $statusStr = "Failed"
            if ($step -ne 'Dev Server') {
                $hasFailure = $true
            }
        }
        
        $pad = 12 - $step.Length
        $spacing = " " * $pad
        Write-Host "$step$spacing $statusStr"
    }
    
    Write-Host ""
    
    if ($hasFailure) {
        Write-Host "Project is NOT ready for commit." -ForegroundColor Red
        Write-Host "──────────────────────────────"
        exit 1
    } else {
        Write-Host "Project is ready for commit and push." -ForegroundColor Green
        Write-Host "──────────────────────────────"
    }
}

$results = @{}

switch ($Command) {
    'all' {
        $res = Invoke-Npm -Arguments @('install')
        $results['Install'] = @{ ExitCode = $res.ExitCode; Skipped = $false }
        if ($res.ExitCode -ne 0) { exit $res.ExitCode }
        
        $res = Invoke-Npm -Arguments @('audit') -WarnOnly
        $results['Audit'] = @{ ExitCode = $res.ExitCode; Skipped = $false }
        
        $res = Invoke-NpmScript -Name 'test'
        $results['Test'] = @{ ExitCode = $res.ExitCode; Skipped = $res.Skipped }
        
        $res = Invoke-NpmScript -Name 'format'
        $results['Format'] = @{ ExitCode = $res.ExitCode; Skipped = $res.Skipped }
        
        $res = Invoke-NpmScript -Name 'lint'
        $results['Lint'] = @{ ExitCode = $res.ExitCode; Skipped = $res.Skipped }
        
        $res = Invoke-NpmScript -Name 'typecheck'
        $results['Typecheck'] = @{ ExitCode = $res.ExitCode; Skipped = $res.Skipped }
        
        $res = Invoke-NpmScript -Name 'build' -Required
        $results['Build'] = @{ ExitCode = $res.ExitCode; Skipped = $false }
        if ($res.ExitCode -ne 0) { 
            $results['Dev Server'] = @{ ExitCode = 1; Skipped = $false }
            Print-Summary -Results $results
            exit $res.ExitCode 
        }
        
        EnsureBuild
        
        $results['Dev Server'] = @{ ExitCode = 0; Skipped = $false }
        Print-Summary -Results $results
        
        Clear-Port -Port 3000
        $res = Invoke-NpmScript -Name 'dev' -Required
        exit $res.ExitCode
    }
    
    'install' {
        $res = Invoke-Npm -Arguments @('install')
        exit $res.ExitCode
    }
    'test' {
        $res = Invoke-NpmScript -Name 'test'
        exit $res.ExitCode
    }
    'format' {
        $res = Invoke-NpmScript -Name 'format'
        exit $res.ExitCode
    }
    'lint' {
        $res = Invoke-NpmScript -Name 'lint'
        exit $res.ExitCode
    }
    'typecheck' {
        $res = Invoke-NpmScript -Name 'typecheck'
        exit $res.ExitCode
    }
    'build' {
        $res = Invoke-NpmScript -Name 'build' -Required
        exit $res.ExitCode
    }
    'dev' {
        Clear-Port -Port 3000
        $res = Invoke-NpmScript -Name 'dev' -Required
        exit $res.ExitCode
    }
}