"""Ping test — minimal Python Worker"""
async def on_fetch(request, env):
    return __new__(Response(), 200, {"Content-Type": "application/json"}, '{"ok":true}')
