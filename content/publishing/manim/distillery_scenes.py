"""
distillery_scenes.py — Reusable Manim scenes for Distillery videos.

Color palette: Black (#0D1117) bg, Gold (#D4A574) geometry,
Purple (#A855F7) secondary, Green (#00FF88) core, White (#E6E1DC) text.

Usage:
  manim -qh distillery_scenes.py TetrahedronBuild -o /tmp/scene_name
  manim -qh distillery_scenes.py TimelineFour -o /tmp/scene_name
"""
from manim import *

P = {
    "bg": "#0D1117", "gold": "#D4A574", "gold_dim": "#8B7355",
    "purple": "#A855F7", "green": "#00FF88", "white": "#E6E1DC",
    "muted": "#6B7280", "red": "#FF4444",
}

# ═══════════════════════════════════════════════════════════════
# S00 — Tetrahedron Build (vertex by vertex with labels)
# ═══════════════════════════════════════════════════════════════
class TetrahedronBuild(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]
        verts = np.array([
            [0, 1.5, 0], [1.4, -0.5, 1.0], [-1.4, -0.5, 1.0], [0, -0.5, -1.8]
        ]) + np.array([0, 0, 0])

        pairs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
        names = ["SUBJECT", "OBJECT", "INTENTION", "ACT"]
        positions = [UP * 0.5, RIGHT * 0.6, LEFT * 0.6, DOWN * 0.5]

        # Build edges dim
        edges = VGroup(*[Line3D(verts[i], verts[j], color=P["gold_dim"], stroke_width=2) for i, j in pairs])
        self.play(Create(edges, run_time=2))

        # Build vertices one by one
        elements = VGroup()
        for i in range(4):
            d = Dot3D(verts[i], color=P["gold"], radius=0.12)
            l = Text(names[i], font="Sans", color=P["gold"], weight=BOLD).scale(0.5)
            l.next_to(d, positions[i])
            self.play(Create(d), Write(l), run_time=1.5)
            elements.add(d, l)
            self.wait(0.5)

        # Brighten edges
        self.play(edges.animate.set_color(P["gold"]), run_time=1.5)

        # Green core
        core = Dot3D(np.array([0, -0.15, 0.2]), color=P["green"], radius=0.2)
        glow = Dot3D(np.array([0, -0.15, 0.2]), color=P["green"], radius=0.6)
        glow.set_opacity(0.25)
        self.play(FadeIn(core), FadeIn(glow), run_time=1.5)
        self.wait(2)

        all_mobs = VGroup(edges, elements, core, glow)
        self.play(all_mobs.animate.set_opacity(0), run_time=1.5)


# ═══════════════════════════════════════════════════════════════
# S01 — Triangle to Tetrahedron (flat → volume)
# ═══════════════════════════════════════════════════════════════
class TriangleToTetrahedron(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]

        # Triangle (flat, grey)
        tri_verts_2d = [LEFT * 2 + DOWN, RIGHT * 2 + DOWN, UP * 1.8]
        tri = Polygon(*tri_verts_2d, color=P["muted"], fill_opacity=0.05, stroke_width=2)
        flat_label = Text("FLAT · NO INSIDE", font="Sans", color=P["muted"]).scale(0.5)
        flat_label.move_to(DOWN * 0.2)

        self.play(Create(tri), Write(flat_label), run_time=2)
        self.wait(1.5)

        # Fourth vertex rises
        v4 = Dot(UP * 0.3, color=P["gold"], radius=0.12)
        self.play(Create(v4), run_time=1.5)

        # Edges from three vertices to new vertex
        e1 = Line(tri_verts_2d[0], UP * 0.3, color=P["gold"], stroke_width=2)
        e2 = Line(tri_verts_2d[1], UP * 0.3, color=P["gold"], stroke_width=2)
        e3 = Line(tri_verts_2d[2], UP * 0.3, color=P["gold"], stroke_width=2)
        self.play(Create(e1), Create(e2), Create(e3), run_time=2)

        # "FLAT" → "VOLUME"
        vol_label = Text("VOLUME", font="Sans", color=P["gold"], weight=BOLD).scale(0.6)
        vol_label.move_to(DOWN * 0.2)
        self.play(Transform(flat_label, vol_label), run_time=1)

        # Green core
        core = Dot(UP * 0.3, color=P["green"], radius=0.25)
        glow = Dot(UP * 0.3, color=P["green"], radius=0.7)
        glow.set_opacity(0.2)
        self.play(FadeIn(core), FadeIn(glow), run_time=1.5)
        self.wait(2)

        self.play(*[FadeOut(m) for m in [tri, flat_label, v4, e1, e2, e3, core, glow]], run_time=1.5)


# ═══════════════════════════════════════════════════════════════
# S02 — Timeline with Four Tetrahedra
# ═══════════════════════════════════════════════════════════════
class TimelineFour(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]

        # Timeline line
        line = Line(LEFT * 5.5, RIGHT * 5.5, color=P["gold_dim"], stroke_width=1.5)
        self.play(Create(line), run_time=1.5)

        dates = ["475 CE", "1000 CE", "1963", "2013"]
        labels = ["PROCLUS", "ABHINAVAGUPTA", "ÑĀṆAVĪRA", "ARKANI-HAMED\n& TRNKA"]
        x_positions = [-4, -1.5, 1.5, 4]

        tetrahedra = []
        for i, (date, label, x) in enumerate(zip(dates, labels, x_positions)):
            # Marker on timeline
            marker = Dot(np.array([x, 0, 0]), color=P["gold"], radius=0.1)
            date_text = Text(date, font="Sans", color=P["gold"]).scale(0.4)
            date_text.next_to(marker, DOWN, buff=0.25)

            # Small tetrahedron above
            size = 0.6
            t_verts = np.array([
                [0, size, 0], [size * 0.9, -size * 0.3, size * 0.7],
                [-size * 0.9, -size * 0.3, size * 0.7], [0, -size * 0.3, -size * 1.1]
            ]) + np.array([x, 1.5, 0])

            pairs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
            edges = VGroup(*[Line3D(t_verts[a], t_verts[b], color=P["gold"], stroke_width=1.5) for a, b in pairs])
            lab = Text(label, font="Sans", color=P["white"], weight=BOLD).scale(0.35)
            lab.next_to(np.array([x, 2.3, 0]), UP, buff=0.1)

            self.play(Create(marker), Write(date_text), Create(edges), Write(lab), run_time=2)
            tetrahedra.append((marker, date_text, edges, lab))
            self.wait(0.5)

        # All four in sync
        convergence_text = Text("1,500 years · 4 cultures · 1 shape",
                                font="Times New Roman", color=P["gold"]).scale(0.7)
        convergence_text.to_edge(DOWN, buff=0.8)
        self.play(Write(convergence_text), run_time=2)
        self.wait(3)

        all_mobs = [line, convergence_text]
        for group in tetrahedra:
            all_mobs.extend(group)
        self.play(*[FadeOut(m) for m in all_mobs], run_time=2)


# ═══════════════════════════════════════════════════════════════
# S03 — 5×10 Phoneme Grid
# ═══════════════════════════════════════════════════════════════
class PhonemeGrid(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]

        rows_labels = ["THROAT", "PALATE", "ROOF", "TEETH", "LIPS"]
        phonemes = [
            ["ka", "kha", "ga", "gha", "ṅa"],
            ["ca", "cha", "ja", "jha", "ña"],
            ["ṭa", "ṭha", "ḍa", "ḍha", "ṇa"],
            ["ta", "tha", "da", "dha", "na"],
            ["pa", "pha", "ba", "bha", "ma"],
        ]

        rows = []
        for r, (label, phons) in enumerate(zip(rows_labels, phonemes)):
            row_texts = []
            y = 2 - r * 0.9
            row_label = Text(label, font="Sans", color=P["purple"]).scale(0.4)
            row_label.move_to(LEFT * 4.5 + UP * y)

            for c, ph in enumerate(phons):
                x = -2 + c * 1.0
                cell = Text(ph, font="Sans", color=P["gold"]).scale(0.5)
                cell.move_to(RIGHT * x + UP * y)
                self.play(Write(cell), run_time=0.3)
                row_texts.append(cell)

            self.play(Write(row_label), run_time=0.5)
            rows.append((row_label, row_texts))

        # Vowels above
        vowels = ["a  ā  i  ī  u  ū  ṛ  ṝ  ḷ  e  ai  o  au  aṃ  aḥ"]
        vowel_text = Text(vowels, font="Sans", color=P["purple"]).scale(0.4)
        vowel_text.to_edge(UP, buff=0.5)
        self.play(Write(vowel_text), run_time=1.5)

        grid_label = Text("MĀTṚKĀ · 50 PHONEMES",
                         font="Times New Roman", color=P["gold"], weight=BOLD).scale(0.6)
        grid_label.to_edge(DOWN, buff=0.6)
        self.play(Write(grid_label), run_time=1.5)
        self.wait(3)

        all_mobs = [vowel_text, grid_label]
        for rl, rts in rows:
            all_mobs.append(rl)
            all_mobs.extend(rts)
        self.play(*[FadeOut(m) for m in all_mobs], run_time=2)


# ═══════════════════════════════════════════════════════════════
# S04 — Nested Tetrahedra (9 levels → 36 tattvas)
# ═══════════════════════════════════════════════════════════════
class NestedTetrahedra(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]

        sizes = [0.5, 0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6, 2.9]
        all_tets = VGroup()
        for size in sizes:
            r = size
            verts = np.array([
                [0, r, 0], [r * 0.94, -r * 0.33, r * 0.7],
                [-r * 0.94, -r * 0.33, r * 0.7], [0, -r * 0.33, -r * 1.15]
            ])
            pairs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
            edges = VGroup(*[Line3D(verts[a], verts[b], color=P["gold"], stroke_width=1.5) for a, b in pairs])
            all_tets.add(edges)

        # Reveal from smallest to largest
        for tet in all_tets:
            self.play(Create(tet, run_time=0.8))
            self.wait(0.2)

        label = Text("9 TETRAHEDRA · 36 EDGES · 36 TATTVAS",
                    font="Times New Roman", color=P["gold"], weight=BOLD).scale(0.6)
        label.to_edge(DOWN, buff=0.6)

        core = Dot3D(np.array([0, 0, 0]), color=P["green"], radius=0.15)

        self.play(Write(label), FadeIn(core), run_time=2)
        self.play(Rotate(all_tets, angle=PI/6, axis=UP, run_time=4, rate_func=linear))
        self.wait(2)

        self.play(FadeOut(all_tets), FadeOut(core), FadeOut(label), run_time=2)


# ═══════════════════════════════════════════════════════════════
# S05 — Rotating Tetrahedron with Green Core
# ═══════════════════════════════════════════════════════════════
class RotatingTetrahedron(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]
        r = 2.2
        verts = np.array([
            [0, r, 0], [r * 0.94, -r * 0.33, r * 0.7],
            [-r * 0.94, -r * 0.33, r * 0.7], [0, -r * 0.33, -r * 1.15]
        ])
        pairs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
        edges = VGroup(*[Line3D(verts[a], verts[b], color=P["gold"], stroke_width=2.5) for a, b in pairs])

        core = Dot3D(np.array([0, 0, 0]), color=P["green"], radius=0.25)
        glow = Dot3D(np.array([0, 0, 0]), color=P["green"], radius=0.7)
        glow.set_opacity(0.2)

        self.play(Create(edges), FadeIn(core), FadeIn(glow), run_time=3)
        self.play(Rotate(edges, angle=2*PI, axis=UP, run_time=20, rate_func=linear))
        self.wait(1)
        self.play(FadeOut(edges), FadeOut(core), FadeOut(glow), run_time=2)


# ═══════════════════════════════════════════════════════════════
# S06 — Opening Title Card
# ═══════════════════════════════════════════════════════════════
class TitleCard(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]
        title = Text("", font="Times New Roman", color=P["gold"], weight=BOLD).scale(0.9)
        # Will be overridden per video
        self.play(Write(title), run_time=2)
        self.wait(2)
