import asyncio
import os
from playwright.async_api import async_playwright

OUT_DIR = r"C:\Users\rafae\.gemini\antigravity\brain\fba0ca97-faf3-484a-9b85-e742389419a7"

async def capture_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Android viewport (Galaxy S24 / Pixel 7 aspect ratio: 412x915, 2x DPR)
        context = await browser.new_context(
            viewport={"width": 412, "height": 915},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
        )
        page = await context.new_page()
        
        # 1. Home Screen / Top Stats
        print("Navigating to home...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(OUT_DIR, "mobile_01_home_stats.png"))
        print("Captured mobile_01_home_stats.png")
        
        # 2. Ranking Cards
        ranking_header = page.locator("text=Ranking dos 21 Vereadores").first
        if await ranking_header.count() > 0:
            await ranking_header.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
        else:
            await page.mouse.wheel(0, 900)
            await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(OUT_DIR, "mobile_02_ranking_cards.png"))
        print("Captured mobile_02_ranking_cards.png")
        
        # 3. Vereador Detail Modal (Click first card)
        first_card = page.locator(".group.cursor-pointer").first
        if await first_card.count() > 0:
            await first_card.click()
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(OUT_DIR, "mobile_03_vereador_detail.png"))
            print("Captured mobile_03_vereador_detail.png")
            
            # Close modal
            close_btn = page.locator("button:has(svg.lucide-x)").first
            if await close_btn.count() > 0:
                await close_btn.click()
                await page.wait_for_timeout(800)
                
        # 4. Sessions Section
        sessoes_title = page.locator("text=Sessões Transcritas").first
        if await sessoes_title.count() > 0:
            await sessoes_title.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(OUT_DIR, "mobile_04_sessoes_ai.png"))
            print("Captured mobile_04_sessoes_ai.png")
            
            # Click on the first session card to open detail
            sessao_card = page.locator("div.cursor-pointer:has-text('Sessão'), div.cursor-pointer:has-text('Audiência')").first
            if await sessao_card.count() > 0:
                await sessao_card.click()
                await page.wait_for_timeout(1500)
                await page.screenshot(path=os.path.join(OUT_DIR, "mobile_05_sessao_discursos_modal.png"))
                print("Captured mobile_05_sessao_discursos_modal.png")
                
                # Close modal
                close_btn2 = page.locator("button:has(svg.lucide-x)").first
                if await close_btn2.count() > 0:
                    await close_btn2.click()
                    await page.wait_for_timeout(800)

        # 5. Iniciativa Popular Section
        iniciativa = page.locator("text=Projeto de Lei de Iniciativa Popular").first
        if await iniciativa.count() > 0:
            await iniciativa.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(OUT_DIR, "mobile_06_iniciativa_popular.png"))
            print("Captured mobile_06_iniciativa_popular.png")

        # 6. Share / WhatsApp modal
        share_btn = page.locator("button:has(svg.lucide-share-2), button:has-text('Compartilhar')").first
        if await share_btn.count() > 0:
            await share_btn.click()
            await page.wait_for_timeout(1200)
            await page.screenshot(path=os.path.join(OUT_DIR, "mobile_07_share_card.png"))
            print("Captured mobile_07_share_card.png")

        await browser.close()
        print("All mobile flows captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture_all())
