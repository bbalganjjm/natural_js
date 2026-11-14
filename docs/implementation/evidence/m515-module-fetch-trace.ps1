$ErrorActionPreference = 'Stop'
$taskTrace = 'docs/implementation/evidence/m515-browser-chromium-suite-failures/grid-columns-invalid-repla-35b20-returned-state-is-immutable-chromium/trace.zip'
function Get-TaskReference([string]$taskPath) {
    @{ path = $taskPath; sha256 = (Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash.ToLowerInvariant(); bytes = (Get-Item -LiteralPath $taskPath).Length }
}
$taskZip = [System.IO.Compression.ZipFile]::OpenRead((Join-Path (Get-Location) $taskTrace))
try {
    $taskReader = [System.IO.StreamReader]::new($taskZip.GetEntry('1-trace.network').Open())
    try {
        $taskSnapshots = @($taskReader.ReadToEnd() -split "`n" | Where-Object { $_.Trim() } | ForEach-Object { ($_ | ConvertFrom-Json).snapshot })
    } finally { $taskReader.Dispose() }
} finally { $taskZip.Dispose() }
$taskFailed = @($taskSnapshots | Where-Object { $_.response.status -lt 0 -or $_.response._failureText })
if ($taskFailed.Count -ne 1 -or $taskFailed[0].request.url -notlike '*/src/ui/grid-selection.ts' -or $taskFailed[0].response._failureText -ne 'net::ERR_NO_BUFFER_SPACE') { throw 'Unexpected trace failure' }
$taskGrid = @($taskSnapshots | Where-Object { $_.request.url -like '*/src/ui/grid.ts' })
if ($taskGrid.Count -ne 1 -or $taskGrid[0].response.status -ne 200) { throw 'Unexpected root module response' }
$taskResult = [ordered]@{
    stage = 'M5.15'
    kind = 'recorded_module_fetch_trace_diagnostic'
    helper = (Get-TaskReference 'node_modules/.cache/m515-module-fetch-trace.ps1')
    trace = (Get-TaskReference $taskTrace)
    failure_report = (Get-TaskReference 'docs/implementation/evidence/m515-browser-chromium-suite-run-1.json.gz')
    aggregate_record = (Get-TaskReference 'docs/implementation/evidence/m515-browser-chromium-suite-result.json')
    network_entry = '1-trace.network'
    root_response = @{ url = $taskGrid[0].request.url; status = $taskGrid[0].response.status }
    failed_requests = @($taskFailed | ForEach-Object { @{ url = $_.request.url; status = $_.response.status; failure = $_.response._failureText; started = $_.startedDateTime } })
    cause_scope = 'The dependency request reports ERR_NO_BUFFER_SPACE. The trace does not establish why buffers were unavailable or a production defect/fix.'
    credit = 'Metadata-only reading of an existing trace; zero compiler/unit/browser-suite/canonical credit and no source/test/configuration change.'
}
$taskBytes = [System.Text.UTF8Encoding]::new($false).GetBytes(($taskResult | ConvertTo-Json -Depth 8) + "`n")
$taskOutput = 'docs/implementation/evidence/m515-module-fetch-trace.json'
$taskStream = [System.IO.File]::Open($taskOutput, [System.IO.FileMode]::CreateNew)
try { $taskStream.Write($taskBytes, 0, $taskBytes.Length) } finally { $taskStream.Dispose() }
Get-TaskReference $taskOutput | ConvertTo-Json -Compress
