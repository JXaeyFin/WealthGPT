# Company Logo Cache

This directory stores one locally served PNG per ticker in `ASSET_UNIVERSE`.
Rebuild it from the repository root with:

```powershell
$env:LOGO_DEV_PUBLISHABLE_KEY="your_publishable_key"
python scripts/cache-company-logos.py
Remove-Item Env:LOGO_DEV_PUBLISHABLE_KEY
```

The generated `manifest.json` records coverage and identifies monogram
fallbacks. Existing PNGs are retained unless the command uses `--refresh`.
