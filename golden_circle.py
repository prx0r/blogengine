from PIL import Image, ImageDraw

def draw_golden_circle(size=400, output_path="golden_circle.png"):
    """Draw a golden circle centered on a dark background."""
    img = Image.new("RGB", (size, size), (20, 20, 30))
    draw = ImageDraw.Draw(img)

    cx = cy = size // 2
    r = size // 2 - 20  # padding

    # Gold fill, dark gold outline
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 215, 0), outline=(180, 140, 0), width=3)
    img.save(output_path)
    return output_path


if __name__ == "__main__":
    path = draw_golden_circle()
    print(f"Saved to {path}")
