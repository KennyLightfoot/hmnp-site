"""Generate RAG source PDFs.

Run `pip install -r requirements.txt` before executing.
"""

import os
from pathlib import Path
import markdown
import pdfkit

ROOT = Path(__file__).resolve().parents[1]
SOP_SRC = ROOT / 'SOP_ENHANCED.md'
PRICING_SRC = ROOT / 'fee-schedule.md'
DIST = ROOT / 'dist'
LOGO = ROOT / 'logo.png'

HEADER_TEMPLATE = f"""
<div style='width:100%;text-align:center;padding-bottom:10px;'>
    <img src='{LOGO.as_posix()}' style='height:50px;' />
</div>
"""
FOOTER_TEMPLATE = "<div style='text-align:center;font-size:10px;'>Houston Mobile Notary Pros</div>"

PDF_OPTIONS = {
    'page-size': 'Letter',
    'margin-top': '20mm',
    'margin-right': '15mm',
    'margin-bottom': '20mm',
    'margin-left': '15mm',
    'encoding': 'UTF-8',
}


def convert_markdown_to_pdf(src: Path, dest: Path):
    html_body = markdown.markdown(src.read_text())
    html = f"""
    <html><head><meta charset='utf-8'></head>
    <body>{HEADER_TEMPLATE}{html_body}{FOOTER_TEMPLATE}</body></html>
    """
    pdfkit.from_string(html, dest.as_posix(), options=PDF_OPTIONS)


def main():
    DIST.mkdir(exist_ok=True)
    convert_markdown_to_pdf(SOP_SRC, DIST / 'HMNP_SOP.pdf')
    convert_markdown_to_pdf(PRICING_SRC, DIST / 'HMNP_Pricing_QuickRef.pdf')
    print(f"\u2705 DONE {DIST / 'HMNP_SOP.pdf'} {DIST / 'HMNP_Pricing_QuickRef.pdf'}")


if __name__ == '__main__':
    main()
