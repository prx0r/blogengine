"""
tight_escape.py — "No Escape" — You cannot leave the tetrahedron because you ARE it.

Beat-synced to narration. 2D projection for diagrammatic clarity.
Render: manim -qh tight_escape.py NoEscape -o /tmp/tight
"""
from manim import *

P = {
    "bg": "#0D1117", "gold": "#D4A574", "dim": "#8B7355",
    "green": "#00FF88", "red": "#FF4444", "muted": "#6B7280", "text": "#E6E1DC",
}

class NoEscape(Scene):
    def construct(self):
        self.camera.background_color = P["bg"]

        # ── Beat 0: Setup — "You are the subject." (0-7s) ──
        # Single vertex appears labeled "YOU"
        you = Dot(ORIGIN, color=P["gold"], radius=0.15)
        you_label = Text("YOU", font="Sans", color=P["gold"], weight=BOLD).scale(0.7)
        you_label.next_to(you, DOWN, buff=0.35)

        self.play(Create(you), Write(you_label), run_time=2)
        self.wait(4.5)

        # ── Beat 1: Introduce three — objects, intention, act (7-13s) ──
        obj_dot = Dot(RIGHT * 2.5 + UP * 0.8, color=P["dim"], radius=0.12)
        obj_label = Text("OBJECT", font="Sans", color=P["muted"]).scale(0.4)
        obj_label.next_to(obj_dot, RIGHT, buff=0.15)

        int_dot = Dot(LEFT * 2.2 + UP * 0.4, color=P["dim"], radius=0.12)
        int_label = Text("INTENTION", font="Sans", color=P["muted"]).scale(0.4)
        int_label.next_to(int_dot, LEFT, buff=0.15)

        act_dot = Dot(DOWN * 2.5, color=P["dim"], radius=0.12)
        act_label = Text("ACT", font="Sans", color=P["muted"]).scale(0.4)
        act_label.next_to(act_dot, DOWN, buff=0.15)

        # Edge previews (dim)
        e_you_obj = DashedLine(you.get_center(), obj_dot.get_center(), color=P["dim"], stroke_width=1.5)
        e_you_int = DashedLine(you.get_center(), int_dot.get_center(), color=P["dim"], stroke_width=1.5)
        e_you_act = DashedLine(you.get_center(), act_dot.get_center(), color=P["dim"], stroke_width=1.5)
        full_edges = VGroup(e_you_obj, e_you_int, e_you_act)

        self.play(Create(e_you_obj, run_time=0.8))
        self.play(Create(obj_dot), Write(obj_label), run_time=1)
        self.wait(0.8)
        self.play(Create(e_you_int, run_time=0.6))
        self.play(Create(int_dot), Write(int_label), run_time=0.8)
        self.wait(0.3)
        self.play(Create(e_you_act, run_time=0.6))
        self.play(Create(act_dot), Write(act_label), run_time=0.8)
        self.wait(0.8)

        # ── Beat 2: Try to leave (13-22s) ──
        # "YOU" slides to a new position — but edges + other vertices follow
        # Show attempt: YOU slides right, stops. Still connected. Slides further.
        # Eventually — snap — a new tetrahedron forms with YOU still the subject.

        # First attempt: slide right
        you.shift(RIGHT * 1.5)
        you_label.clear_updaters()
        self.play(you.animate.shift(RIGHT * 1.5), you_label.animate.shift(RIGHT * 1.5),
                  run_time=1.2)
        # Edges stretch
        new_e1 = Line(you.get_center(), obj_dot.get_center(), color=P["dim"], stroke_width=1.5)
        new_e2 = Line(you.get_center(), int_dot.get_center(), color=P["dim"], stroke_width=1.5)
        new_e3 = Line(you.get_center(), act_dot.get_center(), color=P["dim"], stroke_width=1.5)
        self.play(Transform(e_you_obj, new_e1), Transform(e_you_int, new_e2),
                  Transform(e_you_act, new_e3), run_time=0.5)
        self.wait(1)

        # Second attempt: slide left
        self.play(you.animate.shift(LEFT * 2), you_label.animate.shift(LEFT * 2), run_time=1)
        new_e1b = Line(you.get_center(), obj_dot.get_center(), color=P["dim"], stroke_width=1.5)
        new_e2b = Line(you.get_center(), int_dot.get_center(), color=P["dim"], stroke_width=1.5)
        new_e3b = Line(you.get_center(), act_dot.get_center(), color=P["dim"], stroke_width=1.5)
        self.play(Transform(e_you_obj, new_e1b), Transform(e_you_int, new_e2b),
                  Transform(e_you_act, new_e3b), run_time=0.5)
        self.wait(0.8)

        # Third: you stretch to the edge — edges track you. Can't escape.
        you.move_to(RIGHT * 4 + UP * 2)
        you_label.next_to(you, DOWN, buff=0.35)
        self.play(you.animate.move_to(RIGHT * 4 + UP * 2), run_time=1.5)
        e_final1 = Line(you.get_center(), obj_dot.get_center(), color=P["dim"], stroke_width=1.5)
        e_final2 = Line(you.get_center(), int_dot.get_center(), color=P["dim"], stroke_width=1.5)
        e_final3 = Line(you.get_center(), act_dot.get_center(), color=P["dim"], stroke_width=1.5)
        self.play(Transform(e_you_obj, e_final1), Transform(e_you_int, e_final2),
                  Transform(e_you_act, e_final3), run_time=0.5)
        self.wait(0.5)

        # ── Beat 3: "A new tetrahedron forms. You are still the subject." (22-28s) ──
        # The whole structure warps into a new tetrahedron — YOU snaps back to center,
        # but with new object/intention/act positions.

        new_obj = Dot(RIGHT * 3 + UP * 1.5, color=P["gold"], radius=0.12)
        new_int = Dot(LEFT * 3 + UP * 0.5, color=P["gold"], radius=0.12)
        new_act = Dot(ORIGIN + DOWN * 2.8, color=P["gold"], radius=0.12)

        # Fade out old, fade in new simultaneously
        anims = [
            you.animate.move_to(ORIGIN),
            Transform(obj_dot, new_obj), Transform(int_dot, new_int), Transform(act_dot, new_act),
            obj_label.animate.next_to(new_obj, RIGHT, buff=0.15),
            int_label.animate.next_to(new_int, LEFT, buff=0.15),
            act_label.animate.next_to(new_act, DOWN, buff=0.15),
        ]
        self.play(*anims, run_time=2)
        self.wait(1)

        # New edges snap gold
        e1 = Line(you.get_center(), obj_dot.get_center(), color=P["gold"], stroke_width=2)
        e2 = Line(you.get_center(), int_dot.get_center(), color=P["gold"], stroke_width=2)
        e3 = Line(you.get_center(), act_dot.get_center(), color=P["gold"], stroke_width=2)
        self.play(Transform(e_you_obj, e1), Transform(e_you_int, e2),
                  Transform(e_you_act, e3), run_time=1.5)
        self.wait(1)

        # ── Beat 4: "Try to observe yourself." (28-35s) ──
        # A mirror copy: a second tetrahedron appears, old YOU becomes an OBJECT.
        # New "YOU" observes it.

        # First: copy the existing structure but fade it to dim
        ghost_you = you.copy().set_color(P["dim"])
        ghost_label = you_label.copy().set_color(P["muted"]).scale(0.7)
        ghost_label.next_to(ghost_you, DOWN, buff=0.35)

        self.play(you.animate.set_color(P["muted"]).scale(0.8),
                  you_label.animate.set_color(P["muted"]).scale(0.7),
                  run_time=1.5)
        self.wait(0.5)

        # New YOU appears observing
        observer = Dot(LEFT * 4 + UP * 2, color=P["gold"], radius=0.15)
        obs_label = Text("YOU", font="Sans", color=P["gold"], weight=BOLD).scale(0.7)
        obs_label.next_to(observer, LEFT, buff=0.3)

        self.play(Create(observer), Write(obs_label), run_time=1.5)
        self.wait(0.5)

        # Line from observer to old-you (now an object)
        gaze_line = DashedLine(observer.get_center(), you.get_center(),
                               color=P["green"], stroke_width=2)
        self.play(Create(gaze_line), run_time=1)
        self.wait(1.5)

        # ── Beat 5: "Now you are the object." (35-42s) ──
        # The old-you label changes to OBJECT. The observer's tetrahedron forms.
        old_obj_label = Text("OBJECT", font="Sans", color=P["muted"]).scale(0.45)
        old_obj_label.next_to(you, DOWN, buff=0.35)

        self.play(Transform(you_label, old_obj_label), run_time=1)
        self.wait(1)

        # Observer's tetrahedron edges snap
        obs_obj = Dot(observer.get_center() + RIGHT * 2.5 + UP * 0.5, color=P["gold"], radius=0.1)
        obs_int = Dot(observer.get_center() + RIGHT * 2 + DOWN * 1, color=P["gold"], radius=0.1)
        obs_e1 = Line(observer.get_center(), obs_obj.get_center(), color=P["gold"], stroke_width=1.5)
        obs_e2 = Line(observer.get_center(), obs_int.get_center(), color=P["gold"], stroke_width=1.5)
        obs_e3 = Line(observer.get_center(), you.get_center(), color=P["gold"], stroke_width=1.5)

        self.play(Create(obs_obj), Create(obs_int), Create(obs_e1), Create(obs_e2),
                  Transform(gaze_line, obs_e3), run_time=3)
        self.wait(1)

        # ── Beat 6: Meta loop — "The attempt to leave IS the act." (42-49s) ──
        # Clear everything except the core insight loop
        self.play(*[FadeOut(m) for m in [obs_obj, obs_int, obs_e1, obs_e2, obs_e3,
                                          ghost_label, observer, obs_label, you, you_label,
                                          obj_dot, int_dot, act_dot, obj_label, int_label, act_label,
                                          e_you_obj, e_you_int, e_you_act, gaze_line]], run_time=1.5)

        # Build the clean tetrahedron with all four vertices equal
        verts_2d = [
            UP * 1.8,                     # SUBJECT
            RIGHT * 2.5 + DOWN * 0.5,     # OBJECT
            LEFT * 2.5 + DOWN * 0.5,      # INTENTION
            DOWN * 2.2,                   # ACT
        ]
        vnames = ["SUBJECT", "OBJECT", "INTENTION", "ACT"]
        vpos = [UP * 0.45, RIGHT * 0.4, LEFT * 0.4, DOWN * 0.4]
        dots = [Dot(p, color=P["gold"], radius=0.14) for p in verts_2d]
        labels = [Text(n, font="Sans", color=P["gold"], weight=BOLD).scale(0.5) for n in vnames]
        for l, p, d in zip(labels, verts_2d, vpos):
            l.next_to(p, d)

        pairs = [(0,1),(0,2),(0,3),(1,2),(1,3),(2,3)]
        edges = VGroup(*[
            Line(verts_2d[i], verts_2d[j], color=P["gold"], stroke_width=2)
            for i, j in pairs
        ])

        self.play(*[Create(d) for d in dots], *[Write(l) for l in labels],
                  Create(edges), run_time=3.5)
        self.wait(2)

        # Highlight each vertex as the narration lists them
        self.play(dots[0].animate.scale(1.8), labels[0].animate.set_color(P["green"]), run_time=0.6)
        self.play(dots[0].animate.scale(1/1.8), labels[0].animate.set_color(P["gold"]), run_time=0.3)
        self.play(dots[1].animate.scale(1.8), labels[1].animate.set_color(P["green"]), run_time=0.6)
        self.play(dots[1].animate.scale(1/1.8), labels[1].animate.set_color(P["gold"]), run_time=0.3)
        self.play(dots[2].animate.scale(1.8), labels[2].animate.set_color(P["green"]), run_time=0.6)
        self.play(dots[2].animate.scale(1/1.8), labels[2].animate.set_color(P["gold"]), run_time=0.3)
        self.play(dots[3].animate.scale(1.8), labels[3].animate.set_color(P["green"]), run_time=0.6)
        self.play(dots[3].animate.scale(1/1.8), labels[3].animate.set_color(P["gold"]), run_time=0.3)
        self.wait(1)

        # ── Beat 7: "Remove any one — just a triangle." (49-56s) ──
        # Remove SUBJECT vertex → triangle, grey, flat
        self.play(FadeOut(dots[0]), FadeOut(labels[0]), run_time=1)
        # Remove the 3 edges connected to SUBJECT
        subject_edges = [e for e in edges if
                         np.allclose(e.get_start(), verts_2d[0]) or
                         np.allclose(e.get_end(), verts_2d[0])]
        self.play(*[FadeOut(e) for e in subject_edges], run_time=1)
        # Remaining 3 vertices + 3 edges = triangle
        remaining_edges = [e for e in edges if e not in subject_edges]
        self.play(*[e.animate.set_color(P["muted"]) for e in remaining_edges],
                  *[d.animate.set_color(P["muted"]) for d in dots[1:]],
                  *[l.animate.set_color(P["muted"]) for l in labels[1:]],
                  run_time=1.5)

        # Draw triangle fill to emphasize "flat"
        tri = Polygon(verts_2d[1], verts_2d[2], verts_2d[3],
                       color=P["muted"], fill_opacity=0.1, stroke_width=0)
        flat_text = Text("FLAT · NO INSIDE", font="Sans", color=P["muted"]).scale(0.5)
        flat_text.move_to(DOWN * 0.5)
        self.play(FadeIn(tri), Write(flat_text), run_time=1.5)
        self.wait(1.5)

        # ── Beat 8: "Four. Always four. The minimum for an inside." (56-62s) ──
        # Subject vertex returns, edges snap back gold, green core appears
        self.play(FadeOut(tri), FadeOut(flat_text), run_time=1)
        self.play(FadeIn(dots[0]), Write(labels[0]), run_time=1)
        self.play(*[e.animate.set_color(P["gold"]).set_stroke(width=2) for e in subject_edges],
                  *[e.animate.set_color(P["gold"]).set_stroke(width=2) for e in remaining_edges],
                  *[d.animate.set_color(P["gold"]) for d in dots[1:]],
                  *[l.animate.set_color(P["gold"]) for l in labels[1:]],
                  run_time=2)

        # Green core
        center = sum(verts_2d) / 4
        core = Dot(center, color=P["green"], radius=0.2)
        glow = Dot(center, color=P["green"], radius=0.5)
        glow.set_opacity(0.2)
        self.play(FadeIn(core), FadeIn(glow), run_time=1.5)
        self.wait(2)

        # Final title
        final_text = Text("The shape of having a world at all.",
                          font="Times New Roman", color=P["gold"]).scale(0.7)
        final_text.to_edge(DOWN, buff=0.8)
        self.play(Write(final_text), run_time=2)
        self.wait(3)

        # Fade
        everything = VGroup(*dots, *labels, edges, core, glow, final_text)
        self.play(everything.animate.set_opacity(0), run_time=2)
