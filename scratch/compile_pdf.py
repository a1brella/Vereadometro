import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        pdf_path = r"C:\Users\rafae\.gemini\antigravity\brain\11d7638a-ea86-4c91-a988-5f0abeed6bcc\vereadometro_juazeiro_preview.pdf"
        await page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            margin={"top": "15mm", "bottom": "15mm", "left": "15mm", "right": "15mm"}
        )
        print(f"PDF gerado com sucesso em: {pdf_path}")
        await browser.close()

asyncio.run(run())
