#!/usr/bin/env python3
"""รวม index.html + assets/*.css/*.js เป็นไฟล์เดียว apps-script/index.html สำหรับวางใน Apps Script (HtmlService)

ใช้: python3 tools/build_gas.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def inline_js(path):
    return '<script>\n' + (ROOT / path).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>'


html = (ROOT / 'index.html').read_text(encoding='utf-8')
parts = {
    '<link rel="stylesheet" href="assets/styles.css">': '<style>\n' + (ROOT / 'assets/styles.css').read_text(encoding='utf-8') + '\n</style>',
    '<script src="assets/criteria.js"></script>': inline_js('assets/criteria.js'),
    '<script src="assets/app.js"></script>': inline_js('assets/app.js'),
}
for tag, content in parts.items():
    if tag not in html:
        raise SystemExit('ไม่พบแท็ก ' + tag + ' ใน index.html')
    html = html.replace(tag, content)

header = '<!-- ไฟล์นี้สร้างอัตโนมัติจาก tools/build_gas.py — แก้ไขที่ index.html และ assets/ แล้ว build ใหม่ -->\n'
out = ROOT / 'apps-script' / 'index.html'
first, rest = html.split('\n', 1)  # คง <!doctype html> ไว้บรรทัดแรก
out.write_text(first + '\n' + header + rest, encoding='utf-8')
print(f'เขียน {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB, {html.count(chr(10)) + 2} บรรทัด)')
