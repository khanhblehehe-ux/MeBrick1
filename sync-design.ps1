<#
Sync design folder script
- Edit the variables below if needed
- Runs: clone remote if missing, copy (robocopy) design folder, create branch, commit and push
- DOES NOT include any credentials; when git prompts, enter your GitHub username and PAT (as password)
#>

# === CONFIGURE BELOW ===
$Source = "C:\Users\Admin\Downloads\MeBrick1-main\f\app\design"   # source design folder to copy from
$RepoPath = "C:\Users\Admin\Downloads\mebrick-repo"                 # temporary clone location (will be created if missing)
$RemoteUrl = "https://github.com/Khanhnb254/MeBrick1.git"
$BranchBase = "sync/design"
$GitUserName = "Your Name"
$GitUserEmail = "you@example.com"
# ========================

function ExitWith($msg) {
    Write-Host $msg -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $Source)) { ExitWith "Source folder not found: $Source" }

try {
    if (-not (Test-Path $RepoPath)) {
        Write-Host "Cloning remote $RemoteUrl to $RepoPath ..."
        git clone $RemoteUrl $RepoPath
        if ($LASTEXITCODE -ne 0) { ExitWith "git clone failed" }
    } else {
        Write-Host "Repo path exists, fetching latest..."
        Push-Location $RepoPath
        git fetch origin
        Pop-Location
    }

    # Ensure destination folder exists
    $Dest = Join-Path $RepoPath "f\app\design"
    Write-Host "Copying from $Source to $Dest (mirror)..."
    # Use robocopy to mirror (will delete files in dest not present in source). Remove /MIR if you don't want deletion.
    robocopy $Source $Dest /MIR /R:2 /W:2 | Out-Null

    Push-Location $RepoPath

    # Configure git user if provided
    if ($GitUserName -and $GitUserEmail) {
        git config user.name "$GitUserName"
        git config user.email "$GitUserEmail"
    }

    # Create branch
    $ts = (Get-Date).ToString('yyyyMMddHHmm')
    $newBranch = "$BranchBase-$ts"
    Write-Host "Creating branch: $newBranch"
    git checkout -b $newBranch

    git add f/app/design
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "No changes to commit." -ForegroundColor Yellow
        Write-Host "You can remove the cloned repo at: $RepoPath if you want." -ForegroundColor Cyan
        Pop-Location
        exit 0
    }

    $commitMsg = "Sync design folder from MeBrick1-main`n`nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { ExitWith "git commit failed" }

    Write-Host "Pushing branch to origin: $newBranch"
    git push -u origin $newBranch
    if ($LASTEXITCODE -ne 0) { ExitWith "git push failed" }

    Write-Host "Push complete. Create a PR from branch $newBranch on GitHub to merge into main/master." -ForegroundColor Green

    Pop-Location
} catch {
    ExitWith "Script failed: $_"
}
