"""Shared schemas for the atlas-astrology plugin."""

from typing import TypedDict, Optional


class BirthData(TypedDict):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    lat: float
    lon: float
    name: Optional[str]
    timezone: Optional[int]


class AstrologyReading(TypedDict):
    date: str
    age: int
    name: str
    chart: dict
    oikodespotes: Optional[dict]
    signals: list
    dominant_mode: str
    interpretation: dict
    graph: dict


class Snapshot(TypedDict):
    id: str
    date: str
    packet: dict
    createdAt: str


class GraphQuery(TypedDict):
    id: Optional[str]
    planet: Optional[str]
    type: Optional[str]


class JournalEntry(TypedDict):
    id: str
    content: str
    kind: str
    created_at: str
