param(
  [string]$CommitMessage = "chore: deploy update",
  [switch]$Push,
  [switch]$DiagnoseOnly
)

$ErrorActionPreference = "Stop"

function Write-Stage {
  param([string]$Message)
  Write-Host $Message -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Message)
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Message)
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Bad {
  param([string]$Message)
  Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Get-RepoFromRemote {
  $remote = (git remote get-url origin) 2>$null
  if (-not $remote) { return $null }

  if ($remote -match "github.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$") {
    return [PSCustomObject]@{ owner = $matches.owner; repo = $matches.repo; remote = $remote }
  }

  return [PSCustomObject]@{ owner = $null; repo = $null; remote = $remote }
}

function Show-GitHubLinks {
  param($RepoInfo)

  if (-not $RepoInfo -or -not $RepoInfo.owner -or -not $RepoInfo.repo) {
    return
  }

  $repoUrl = "https://github.com/$($RepoInfo.owner)/$($RepoInfo.repo)"
  $actionsUrl = "$repoUrl/actions"
  $pagesSettingsUrl = "$repoUrl/settings/pages"
  $workflowUrl = "$actionsUrl/workflows/deploy.yml"
  $siteUrl = "https://$($RepoInfo.owner).github.io/$($RepoInfo.repo)/"

  Write-Host ""
  Write-Host "GitHub quick links:" -ForegroundColor Cyan
  Write-Host "- Actions: $actionsUrl" -ForegroundColor Yellow
  Write-Host "- Deploy workflow: $workflowUrl" -ForegroundColor Yellow
  Write-Host "- Pages settings: $pagesSettingsUrl" -ForegroundColor Yellow
  Write-Host "- Expected site URL: $siteUrl" -ForegroundColor Yellow
}

function Show-WorkflowFailureGuide {
  param($RepoInfo)

  if (-not $RepoInfo -or -not $RepoInfo.owner -or -not $RepoInfo.repo) {
    return
  }

  $workflowRunsUrl = "https://github.com/$($RepoInfo.owner)/$($RepoInfo.repo)/actions/workflows/deploy.yml"
  Write-Host ""
  Write-Host "If deployment fails:" -ForegroundColor Cyan
  Write-Host "1) Open workflow runs: $workflowRunsUrl" -ForegroundColor Yellow
  Write-Host "2) Click latest failed run (red X)" -ForegroundColor Yellow
  Write-Host "3) Open failed step logs (usually build or deploy)" -ForegroundColor Yellow
  Write-Host "4) Ensure Settings > Pages > Source is GitHub Actions" -ForegroundColor Yellow
}

function Run-PreflightDiagnostics {
  $hasFailure = $false
  $repoInfo = $null

  Write-Stage "[Diag 1/6] Checking required files..."
  $required = @(
    ".github/workflows/deploy.yml",
    "vite.config.ts",
    "package.json"
  )

  foreach ($file in $required) {
    if (Test-Path $file) {
      Write-Ok "$file exists"
    } else {
      Write-Bad "$file is missing"
      $hasFailure = $true
    }
  }

  Write-Stage "[Diag 2/6] Checking git remote..."
  $repoInfo = Get-RepoFromRemote
  if (-not $repoInfo) {
    Write-Bad "Git remote origin is not configured"
    $hasFailure = $true
  } else {
    Write-Ok "origin -> $($repoInfo.remote)"
  }

  Write-Stage "[Diag 3/6] Checking Vite base path..."
  if (Test-Path "vite.config.ts") {
    $vite = Get-Content "vite.config.ts" -Raw
    if ($repoInfo -and $repoInfo.repo) {
      $expectedBase = "/$($repoInfo.repo)/"
      $singleQuotedBase = "base: '$expectedBase'"
      $doubleQuotedBase = "base: `"$expectedBase`""
      if ($vite.Contains($singleQuotedBase) -or $vite.Contains($doubleQuotedBase)) {
        Write-Ok "vite base matches repository: $expectedBase"
      } elseif ($vite -match "base\s*:") {
        Write-Warn "vite base exists but may not match repository ($expectedBase)"
      } else {
        Write-Warn "vite base is missing (recommended: $expectedBase)"
      }
    } else {
      Write-Warn "Could not infer repo name from origin; skipped strict base check"
    }
  }

  Write-Stage "[Diag 4/6] Checking workflow trigger..."
  if (Test-Path ".github/workflows/deploy.yml") {
    $workflow = Get-Content ".github/workflows/deploy.yml" -Raw
    if ($workflow -match "push:" -and $workflow -match "branches:\s*\[\s*main\s*\]") {
      Write-Ok "Workflow push trigger for main branch found"
    } else {
      Write-Warn "Workflow trigger may be missing or not set to main"
    }

    if ($workflow -match "actions/deploy-pages@v4") {
      Write-Ok "actions/deploy-pages@v4 found"
    } else {
      Write-Warn "deploy-pages action not found"
    }
  }

  Write-Stage "[Diag 5/6] Checking Node modules and lockfile..."
  if (Test-Path "package-lock.json") {
    Write-Ok "package-lock.json exists (good for npm ci)"
  } else {
    Write-Warn "package-lock.json missing (GitHub Actions npm ci may fail)"
  }

  if (Test-Path "node_modules") {
    Write-Ok "node_modules exists"
  } else {
    Write-Warn "node_modules missing (will be installed during deploy)"
  }

  Write-Stage "[Diag 6/6] Optional GitHub API checks (if gh CLI logged in)..."
  $ghCmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($ghCmd -and $repoInfo -and $repoInfo.owner -and $repoInfo.repo) {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Ok "gh CLI authenticated"
      $pagesResult = gh api "repos/$($repoInfo.owner)/$($repoInfo.repo)/pages" 2>&1
      if ($LASTEXITCODE -eq 0) {
        Write-Ok "GitHub Pages API reachable (Pages likely configured)"
      } else {
        Write-Warn "Pages API check failed. Set Settings > Pages > Source to GitHub Actions"
      }
    } else {
      Write-Warn "gh CLI found but not authenticated; skipping online checks"
    }
  } else {
    Write-Warn "gh CLI not available/authenticated; skipped online checks"
  }

  if ($hasFailure) {
    Write-Bad "Preflight diagnostics found blocking issues. Fix failures above."
    Show-GitHubLinks -RepoInfo $repoInfo
    Show-WorkflowFailureGuide -RepoInfo $repoInfo
    return $false
  }

  Write-Ok "Preflight diagnostics completed."
  Show-GitHubLinks -RepoInfo $repoInfo
  return $true
}

Set-Location $PSScriptRoot

$preflightOk = Run-PreflightDiagnostics
if (-not $preflightOk) {
  exit 1
}

if ($DiagnoseOnly) {
  Write-Host "Diagnose-only mode complete." -ForegroundColor Green
  exit 0
}

Write-Stage "[Deploy 1/4] Installing dependencies..."
npm install

Write-Stage "[Deploy 2/4] Building project..."
npm run build

Write-Stage "[Deploy 3/4] Checking git status..."
$hasChanges = (git status --porcelain)
if (-not $hasChanges) {
  Write-Warn "No changes to commit."
  Write-Ok "Build completed successfully."
  Show-GitHubLinks -RepoInfo (Get-RepoFromRemote)
  exit 0
}

Write-Stage "[Deploy 4/4] Commit changes..."
git add .
git commit -m $CommitMessage

if ($Push) {
  Write-Stage "Pushing to origin/main..."
  git push origin main
  Write-Ok "Push completed."
  Show-GitHubLinks -RepoInfo (Get-RepoFromRemote)
  Show-WorkflowFailureGuide -RepoInfo (Get-RepoFromRemote)
} else {
  Write-Warn "Commit completed. Push skipped."
  Write-Host "Run: git push origin main" -ForegroundColor Yellow
  Show-GitHubLinks -RepoInfo (Get-RepoFromRemote)
}
