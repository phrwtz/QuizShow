from pathlib import Path
root = Path(__file__).resolve().parent.parent
source = (root / 'index.html').read_text()
for host in ['Monty', 'Haunty']:
    for strategy, contestant in [('Switch', 'female'), ('NoSwitch', 'male')]:
        folder = root / host / strategy
        folder.mkdir(parents=True, exist_ok=True)
        page = source.replace('<head>', '<head>\n  <base href="../../">', 1)
        page = page.replace('<body>', f'<body data-fixed-host="{host.lower()}" data-fixed-contestant="{contestant}">', 1)
        page = page.replace("Let's Win a Car — opening dialogue", f"Let's Win a Car — {host} / {strategy}")
        (folder / 'index.html').write_text(page)
(root / '.nojekyll').touch()
print('Prepared four fixed display pages.')
