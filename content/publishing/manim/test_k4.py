"""
Content-driven test scene — tetrahedron builds vertex by vertex matching narration.
0s:   Title card
3s:   "In 1963, a British monk..." → tetrahedron fade in
6s:   "Subject" → V1 appears + label
9s:   "Object" → V2 appears + label
12s:  "Intention" → V3 appears + label
15s:  "Act" → V4 appears + label
18s:  "Four vertices connected by six edges" → edges connect
21s:  "The minimal shape anything must have to exist" → green core glows, hold

Render: manim -qh test_k4.py QuickK4 -o /tmp/test-scene
"""
from manim import *

PALETTE = {
    "bg": "#0D1117",
    "gold": "#D4A574",
    "gold_dim": "#8B7355",
    "green": "#00FF88",
    "muted": "#6B7280",
    "text": "#E6E1DC",
}

class QuickK4(Scene):
    def construct(self):
        self.camera.background_color = PALETTE["bg"]

        # 0-3s: Title
        title = Text("The Shape at the Bottom of Experience",
                     font="Times New Roman",
                     color=PALETTE["gold"],
                     weight=BOLD).scale(0.9)
        sub = Text("Ñāṇavīra Thera · Ceylon · 1963",
                   font="Times New Roman",
                   color=PALETTE["muted"]).scale(0.45)
        sub.next_to(title, DOWN, buff=0.25)
        title.to_edge(UP, buff=1.2)

        self.play(Write(title, run_time=1.5))
        self.play(FadeIn(sub, run_time=1))
        self.wait(0.5)

        # 3-6s: Tetrahedron wireframe fades in
        r = 1.6
        verts = np.array([
            [0, r, 0],                          # V1: top (Subject)
            [r * 0.94, -r * 0.33, r * 0.7],     # V2: front-right (Object)
            [-r * 0.94, -r * 0.33, r * 0.7],    # V3: front-left (Intention)
            [0, -r * 0.33, -r * 1.15],           # V4: back (Act)
        ])
        verts += np.array([0, -0.3, 0])  # shift center down

        # Build wireframe edges
        edges = VGroup()
        pairs = [(0,1),(0,2),(0,3),(1,2),(1,3),(2,3)]
        for i, j in pairs:
            edges.add(Line3D(verts[i], verts[j], color=PALETTE["gold_dim"], stroke_width=2))

        self.play(Create(edges, run_time=2.5))
        self.wait(0.5)

        # 6-18s: Build vertices one by one matching voiceover
        v_labels = ["SUBJECT", "OBJECT", "INTENTION", "ACT"]
        dot_positions = [UP * 0.4, RIGHT * 0.7, LEFT * 0.7, DOWN * 0.6]
        elements = VGroup()

        for i in range(4):
            # Dot at vertex
            dot_pos = verts[i] + np.array([0, 0.15 * (1 if i == 0 else -0.3), 0])
            d = Dot3D(verts[i], color=PALETTE["gold"], radius=0.1, resolution=(8, 8))
            l = Text(v_labels[i], font="Sans", color=PALETTE["gold"], weight=BOLD).scale(0.5)
            l.next_to(verts[i], dot_positions[i])
            self.play(Create(d), Write(l), run_time=2)
            elements.add(d, l)
            self.wait(0.5)

        # 18-21s: Edges brighten
        self.play(edges.animate.set_color(PALETTE["gold"]), run_time=2)
        self.wait(1)

        # 21-25s: Green core appears with slow rotation
        center3d = np.array([0, -0.3, 0])
        core = Dot3D(center3d, color=PALETTE["green"], radius=0.2, resolution=(8, 8))
        glow = Dot3D(center3d, color=PALETTE["green"], radius=0.5, resolution=(8, 8))
        glow.set_opacity(0.25)

        all_3d = VGroup(edges, elements, core, glow)
        self.play(FadeIn(core), FadeIn(glow), run_time=1.5)
        self.play(Rotate(all_3d, angle=TAU/8, axis=UP, run_time=2.5, rate_func=linear))
        self.wait(0.5)

        # 25-26s: Fade out
        all_mobjects = [title, sub, edges, core, glow] + list(elements)
        self.play(*[FadeOut(m, run_time=1.5) for m in all_mobjects])
