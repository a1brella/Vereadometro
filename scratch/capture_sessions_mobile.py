import asyncio
import os
from playwright.async_api import async_playwright

OUT_DIR = r"C:\Users\rafae\Documents\Vibecoding\Fiscalizacao Cidada\scratch"
ARTIFACT_DIR = r"C:\Users\rafae\.gemini\antigravity\brain\fba0ca97-faf3-484a-9b85-e742389419a7"

async def capture_sessions():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 412, "height": 915},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
        )
        page = await context.new_page()
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        
        # Scroll to Transcrições section
        tribuna = page.locator("text=O que os vereadores estão falando").first
        if await tribuna.count() > 0:
            await tribuna.scroll_into_view_if_needed()
            await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(ARTIFACT_DIR, "mobile_04_sessoes_tribuna.png"))
            print("Captured mobile_04_sessoes_tribuna.png")
            
            # Click on first card
            card = page.locator("text=Audiência Pública, text=Sessão Ordinária").first
            if await card.count() > 0:
                await card.click()
                await page.wait_for_timeout(1800)
                await page.screenshot(path=os.path.join(ARTIFACT_DIR, "mobile_05_modal_falas_ia.png"))
                print("Captured mobile_05_modal_falas_ia.png")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_sessions())
