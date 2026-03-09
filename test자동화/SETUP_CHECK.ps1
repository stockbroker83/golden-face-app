Write-Host "[1] Claude 설치 확인" -ForegroundColor Cyan
claude --version

Write-Host "`n[2] 현재 경로 확인" -ForegroundColor Cyan
Get-Location

Write-Host "`n[3] 템플릿 파일 확인" -ForegroundColor Cyan
Get-ChildItem -Recurse | Select-Object FullName
