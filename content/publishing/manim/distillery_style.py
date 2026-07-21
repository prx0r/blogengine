"""
Manim color palette and scene templates for Distillery videos.

Style: Dark void background, gold wireframe geometry, green core accent.
Install: pip install manim
Usage:   manim -pql scenes/nanavira_k4_build.py K4Build
"""

from manim import *

# ── Distillery Color Palette ──────────────────────────────────
PALETTE = {
    "bg": "#0D1117",           # Deep void — matches GitHub dark
    "gold": "#D4A574",         # Primary geometry — warm alchemical gold
    "gold_dim": "#8B7355",     # Dimmed gold for inactive elements
    "green_core": "#00FF88",   # 550nm — the green core accent
    "amber": "#C4956A",        # Text highlights, emphasis
    "white_text": "#E6E1DC",   # Body text — not pure white, softer
    "muted": "#6B7280",        # Muted grey for secondary labels
    "red_error": "#FF4444",    # Error/blocked edges
    "manuscript": "#2A1F14",   # Dark warm brown for quote backgrounds
}

# ── Base Scene Class ──────────────────────────────────────────
class DistilleryScene(ThreeDScene):
    """Base class for all Distillery videos."""

    def setup(self):
        self.camera.background_color = PALETTE["bg"]
        # Optional: add subtle grain/noise overlay

    def title_card(self, text, subtitle=None, duration=3):
        """Serif title card with gold text."""
        title = Text(text, font="Times New Roman", color=PALETTE["gold"], weight=BOLD)
        title.scale(1.2)
        self.play(Write(title, run_time=1.5))
        if subtitle:
            sub = Text(subtitle, font="Times New Roman", color=PALETTE["white_text"])
            sub.scale(0.6)
            sub.next_to(title, DOWN, buff=0.3)
            self.play(FadeIn(sub, shift=UP * 0.2, run_time=1))
        self.wait(duration - 2)
        return title

    def vertex_label(self, text, color=PALETTE["gold"], scale=0.5):
        """Small label for tetrahedron vertices."""
        return Text(text, font="Sans", color=color).scale(scale)

    def gold_tetrahedron(self, radius=2.5):
        """Create a gold wireframe tetrahedron."""
        vertices = [
            np.array([0, radius * 0.7, 0]),          # Top
            np.array([radius, -radius * 0.3, radius * 0.7]),   # Front-right
            np.array([-radius, -radius * 0.3, radius * 0.7]),  # Front-left
            np.array([0, -radius * 0.3, -radius * 1.2]),        # Back
        ]
        lines = VGroup()
        for i in range(4):
            for j in range(i + 1, 4):
                line = Line3D(vertices[i], vertices[j], color=PALETTE["gold"], stroke_width=2)
                lines.add(line)
        return lines, vertices

    def green_core_glow(self, center=np.array([0, 0, 0]), radius=0.4):
        """A pulsing green dot at the tetrahedron center."""
        dot = Dot3D(center, color=PALETTE["green_core"], radius=radius)
        glow = Dot3D(center, color=PALETTE["green_core"], radius=radius * 2.5)
        glow.set_opacity(0.3)
        return VGroup(dot, glow)

    def quote_card(self, text, source, duration=6):
        """Manuscript-textured quote card."""
        bg = Rectangle(
            width=config.frame_width * 0.85,
            height=config.frame_height * 0.4,
            color=PALETTE["manuscript"],
            fill_opacity=0.92,
            stroke_color=PALETTE["gold"],
            stroke_width=1,
        )
        quote = Text(text, font="Times New Roman", color=PALETTE["amber"], line_spacing=1.3)
        quote.scale_to_fit_width(bg.width * 0.85)
        quote.move_to(bg.get_center() + UP * 0.3)

        citation = Text(f"— {source}", font="Times New Roman", color=PALETTE["muted"])
        citation.scale(0.5)
        citation.next_to(quote, DOWN, buff=0.4)

        self.play(FadeIn(bg), Write(quote, run_time=3), FadeIn(citation))
        self.wait(duration - 3)
        return VGroup(bg, quote, citation)


# ── Example Scene: K4 Build ───────────────────────────────────
class K4Build(DistilleryScene):
    """Build the tetrahedron vertex by vertex."""

    def construct(self):
        self.setup()
        self.next_section("intro")
        self.title_card("Ñāṇavīra's Fundamental Structure",
                        "The shape at the bottom of experience")

        # Fade out title, rotate camera
        self.move_camera(phi=65 * DEGREES, theta=-45 * DEGREES, run_time=2)

        self.next_section("vertices")
        lines, verts = self.gold_tetrahedron(radius=2.2)

        # Labels
        labels = {
            0: self.vertex_label("SUBJECT"),
            1: self.vertex_label("OBJECT"),
            2: self.vertex_label("INTENTION"),
            3: self.vertex_label("ACT"),
        }
        for i, label in labels.items():
            label.next_to(verts[i], UP * 0.4)
            dot = Dot3D(verts[i], color=PALETTE["gold"], radius=0.12)
            self.play(Create(dot), Write(label), run_time=1.5)
            self.wait(0.5)

        self.next_section("edges")
        self.play(Create(lines), run_time=3)

        self.next_section("core")
        core = self.green_core_glow()
        self.play(FadeIn(core, scale=1.5), run_time=2)
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        self.next_section("out")
        self.play(FadeOut(lines), FadeOut(core), *[FadeOut(l) for l in labels.values()], run_time=2)


# ── Example: Quote Scene ──────────────────────────────────────
class NanaviraQuote(DistilleryScene):
    """Display a quote card with ghost tetrahedron."""

    def construct(self):
        self.setup()

        # Ghost tetrahedron in background
        lines, verts = self.gold_tetrahedron(radius=1.5)
        lines.set_opacity(0.08)
        self.add(lines)

        self.quote_card(
            "Positive or abstract thinking abstracts from existence\n"
            "and is thus incapable of thinking it continuously.",
            "Ñāṇavīra Thera, Clearing the Path (1963)",
            duration=8,
        )

        # Tetrahedron pulses on completion
        self.play(lines.animate.set_opacity(0.25), run_time=1)
        self.play(lines.animate.set_opacity(0.08), run_time=1)
        self.wait(2)
