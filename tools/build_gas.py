#!/usr/bin/env python3
"""แปลง index.html + assets/ เป็นไฟล์ HTML หลายไฟล์ขนาดเล็กสำหรับวางใน Apps Script (HtmlService)

ไฟล์ index ใน Apps Script เป็น template ที่ดึงไฟล์ย่อยมารวมด้วย include() ใน Code.gs
แบ่งไฟล์ให้แต่ละไฟล์ไม่เกิน ~MAX_LINES บรรทัด เพื่อให้คัดลอก-วางได้ครบ

ใช้: python3 tools/build_gas.py               → เขียนไฟล์ลง apps-script/
     python3 tools/build_gas.py --bundle FILE → เขียนหน้าเว็บรวมไฟล์เดียว (ใช้ทดสอบ)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'apps-script'
MAX_LINES = 345
SECTION = '  // ================= '  # จุดตัดที่ปลอดภัย (อยู่นอก string/template literal)
HEADER = '<!-- สร้างอัตโนมัติจาก tools/build_gas.py — แก้ไขที่ index.html และ assets/ แล้ว build ใหม่ -->'


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def split_js(text):
    """แบ่งโค้ดตามหัวข้อ section ให้แต่ละชิ้นไม่เกิน MAX_LINES บรรทัด"""
    lines = text.split('\n')
    cuts = [i for i, line in enumerate(lines) if line.startswith(SECTION)]
    chunks, start = [], 0
    for i, cut in enumerate(cuts):
        nxt = cuts[i + 1] if i + 1 < len(cuts) else len(lines)
        if nxt - start > MAX_LINES and cut > start:
            chunks.append('\n'.join(lines[start:cut]))
            start = cut
    chunks.append('\n'.join(lines[start:]))
    return chunks


def build():
    html = read('index.html')
    files = {'css': read('assets/styles.css'), 'criteria': read('assets/criteria.js')}
    app_chunks = split_js(read('assets/app.js'))
    for i, chunk in enumerate(app_chunks, 1):
        files[f'app{i}'] = chunk

    inc = lambda name: f"<?!= include('{name}'); ?>"
    shell = html.replace('<link rel="stylesheet" href="assets/styles.css">', '<style>\n' + inc('css') + '\n</style>')
    shell = shell.replace('<script src="assets/criteria.js"></script>', '<script>\n' + inc('criteria') + '\n</script>')
    # ทุกชิ้นของ app.js อยู่ใน <script> เดียวกัน (โค้ดเป็น IIFE เดียว) คั่นด้วยการขึ้นบรรทัด
    shell = shell.replace('<script src="assets/app.js"></script>',
                          '<script>\n' + '\n'.join(inc(f'app{i}') for i in range(1, len(app_chunks) + 1)) + '\n</script>')
    if 'assets/' in shell:
        raise SystemExit('ยังมีการอ้างอิง assets/ ใน index.html')
    first, rest = shell.split('\n', 1)
    files = {'index': first + '\n' + HEADER + '\n' + rest, **files}
    return files


def assemble(files):
    """จำลองการทำงานของ template + include() ใน Apps Script"""
    out = files['index']
    for name, content in files.items():
        if name != 'index':
            out = out.replace(f"<?!= include('{name}'); ?>", content)
    return out


if __name__ == '__main__':
    files = build()
    if len(sys.argv) == 3 and sys.argv[1] == '--bundle':
        Path(sys.argv[2]).write_text(assemble(files), encoding='utf-8')
        print('เขียน', sys.argv[2])
        sys.exit()
    # หน้าเว็บรวมไฟล์เดียว — Code.gs ดาวน์โหลดไฟล์นี้จาก GitHub (ติดตั้งแบบวาง Code.gs ไฟล์เดียว)
    dist = ROOT / 'dist' / 'mugr-app.html'
    dist.parent.mkdir(exist_ok=True)
    dist.write_text(assemble(files), encoding='utf-8')
    print(f'dist/mugr-app.html  {dist.stat().st_size // 1024} KB')
    for old in OUT.glob('*.html'):
        old.unlink()
    parts = sum(1 for n in files if n.startswith('app'))
    code = (OUT / 'Code.gs').read_text(encoding='utf-8')
    code = re.sub(r'var APP_PARTS = \d+;', f'var APP_PARTS = {parts};', code)
    (OUT / 'Code.gs').write_text(code, encoding='utf-8')
    for name, content in files.items():
        (OUT / f'{name}.html').write_text(content if content.endswith('\n') else content + '\n', encoding='utf-8')
        print(f'apps-script/{name}.html  {content.count(chr(10)) + 1:>4} บรรทัด  {len(content.encode()) // 1024:>3} KB')
