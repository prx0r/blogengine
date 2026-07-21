"use client";
import { useScrollSave } from "./ScrollSaver";
import ScrollProgress from "./ScrollProgress";

export default function EssayReader({
  essayId,
  title,
  children,
  isSufism,
}: {
  essayId: string;
  title: string;
  children: React.ReactNode;
  isSufism: boolean;
}) {
  useScrollSave(essayId, title);

  return (
    <>
      <ScrollProgress isSufism={isSufism} />
      {children}
    </>
  );
}
