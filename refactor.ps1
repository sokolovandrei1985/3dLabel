# Rename 'src/lib' to 'src/engine'
$oldPath = "src\lib"
$newPath = "src\engine"
if (Test-Path $oldPath) {
    Rename-Item -Path $oldPath -NewName (Split-Path $newPath -Leaf)
    Write-Host "Folder '$oldPath' renamed to '$newPath'"
} else {
    Write-Host "Folder '$oldPath' not found"
}

# Replace imports in all files
$files = Get-ChildItem -Path . -Recurse -Include *.ts, *.vue, *.json
foreach ($file in $files) {
    (Get-Content $file.FullName) -replace "\.\.\/lib\/", "../engine/" |
        Set-Content $file.FullName
}
Write-Host "All '../lib/' imports replaced with '../engine/'"

# Add alias '@' to vite.config.ts if not exists
$viteConfig = "vite.config.ts"
if (Test-Path $viteConfig) {
    $viteContent = Get-Content $viteConfig -Raw
    if ($viteContent -notmatch "@: path\.resolve") {
        $aliasBlock = @"
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
"@

        $viteContent = $viteContent -replace "defineConfig\(\{", "defineConfig({`n$aliasBlock"
        Set-Content $viteConfig $viteContent
        Write-Host "Alias '@' added to vite.config.ts"
    } else {
        Write-Host "Alias '@' already exists in vite.config.ts"
    }
} else {
    Write-Host "vite.config.ts not found"
}
