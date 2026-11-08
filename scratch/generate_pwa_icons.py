import os
from PIL import Image, ImageDraw

def create_gradient(width, height, c1, c2):
    base = Image.new('RGBA', (width, height), c1)
    top = Image.new('RGBA', (width, height), c2)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        for x in range(width):
            # Diagonal gradient from top-left to bottom-right
            t = (x / width + y / height) / 2.0
            mask_data.append(int(255 * t))
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def draw_civic_symbol(draw, cx, cy, scale, fg_color=(255, 255, 255, 255), gold_color=(251, 191, 36, 255)):
    # cx, cy is center. scale is base size unit (e.g. 1000px scale)
    
    # 1. Pediment / Roof (Triangle roof with civic cornice)
    roof_w = scale * 0.70
    roof_h = scale * 0.16
    roof_top = cy - scale * 0.28
    
    # Dome / Triangle pediment
    pediment = [
        (cx, roof_top),
        (cx - roof_w / 2, roof_top + roof_h),
        (cx + roof_w / 2, roof_top + roof_h)
    ]
    draw.polygon(pediment, fill=fg_color)
    
    # Roof Architrave / Beam
    beam_h = scale * 0.05
    beam_y = roof_top + roof_h + scale * 0.015
    draw.rounded_rectangle(
        [cx - roof_w * 0.52, beam_y, cx + roof_w * 0.52, beam_y + beam_h],
        radius=int(scale * 0.015),
        fill=fg_color
    )
    
    # 2. Columns (4 stately columns)
    col_w = scale * 0.075
    col_h = scale * 0.32
    col_top = beam_y + beam_h + scale * 0.02
    col_spacing = (roof_w * 0.88 - 4 * col_w) / 3
    
    start_x = cx - (roof_w * 0.88) / 2
    for i in range(4):
        x = start_x + i * (col_w + col_spacing)
        draw.rounded_rectangle(
            [x, col_top, x + col_w, col_top + col_h],
            radius=int(col_w * 0.2),
            fill=fg_color
        )
        
    # 3. Base / Plinth Steps (2 steps)
    base_top = col_top + col_h + scale * 0.02
    step1_w = roof_w * 0.95
    step1_h = scale * 0.045
    draw.rounded_rectangle(
        [cx - step1_w / 2, base_top, cx + step1_w / 2, base_top + step1_h],
        radius=int(step1_h * 0.25),
        fill=fg_color
    )
    
    step2_w = roof_w * 1.05
    step2_h = scale * 0.055
    step2_top = base_top + step1_h + scale * 0.01
    draw.rounded_rectangle(
        [cx - step2_w / 2, step2_top, cx + step2_w / 2, step2_top + step2_h],
        radius=int(step2_h * 0.25),
        fill=fg_color
    )
    
    # 4. Civic Star / Balance symbol inside pediment (Golden star or emblem)
    star_r = scale * 0.045
    star_cy = roof_top + roof_h * 0.65
    draw.ellipse(
        [cx - star_r, star_cy - star_r, cx + star_r, star_cy + star_r],
        fill=gold_color
    )

def generate_icons():
    icons_dir = r"c:\Users\rafae\Documents\Vibecoding\Fiscalizacao Cidada\public\icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Supersampling resolution (2048x2048)
    S = 2048
    c_emerald = (16, 185, 129, 255)   # #10b981
    c_teal = (15, 118, 110, 255)       # #0f766e
    c_bg = (2, 6, 23, 255)             # #020617 (slate-950)
    c_white = (255, 255, 255, 255)
    c_gold = (251, 191, 36, 255)       # amber-400
    
    # 1. Standard App Icon (Rounded squircle container on dark base or gradient)
    img_std = create_gradient(S, S, c_emerald, c_teal)
    draw_std = ImageDraw.Draw(img_std)
    # Draw landmark
    draw_civic_symbol(draw_std, S // 2, S // 2, S * 0.68, c_white, c_gold)
    
    # 2. Maskable Icon (Must fit within 80% safe zone with edge padding)
    img_mask = create_gradient(S, S, (10, 20, 35, 255), (6, 78, 59, 255))
    draw_mask = ImageDraw.Draw(img_mask)
    # Smaller scale for safe area (safe circle is 80% of width/height = 0.8 * S)
    draw_civic_symbol(draw_mask, S // 2, S // 2, S * 0.50, c_white, c_gold)
    
    # Export sizes
    sizes = [
        ("icon-192x192.png", 192, img_std),
        ("icon-512x512.png", 512, img_std),
        ("icon-maskable-512x512.png", 512, img_mask),
        ("apple-touch-icon.png", 180, img_std),
        ("icon-384x384.png", 384, img_std),
    ]
    
    for filename, sz, src_img in sizes:
        resized = src_img.resize((sz, sz), Image.Resampling.LANCZOS)
        out_path = os.path.join(icons_dir, filename)
        resized.save(out_path, "PNG", optimize=True)
        print(f"Generated {filename} ({sz}x{sz})")

if __name__ == "__main__":
    generate_icons()
