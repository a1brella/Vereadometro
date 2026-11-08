import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 850})
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Click on the session card
        card = page.locator("text=Audiência Pública").first
        await card.click()
        await page.wait_for_timeout(2500)
        await page.screenshot(path=r"C:\Users\rafae\.gemini\antigravity\brain\11d7638a-ea86-4c91-a988-5f0abeed6bcc\screenshot_modal_speaker.png")
        print("Captured modal with speakers!")

        # Also click on Professora PG speaker filter button
        spk_btn = page.locator("button:has-text('Professora PG')").first
        if await spk_btn.count() > 0:
            await spk_btn.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path=r"C:\Users\rafae\.gemini\antigravity\brain\11d7638a-ea86-4c91-a988-5f0abeed6bcc\screenshot_modal_speaker_filtered.png")
            print("Captured filtered by Professora PG!")

        await browser.close()

asyncio.run(capture())
