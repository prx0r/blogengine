#!/bin/bash
# API key read from YOUTUBE_API_KEY env var — set in session or .env.local
cd /root/projects/blog
node scripts/daily-search-collection.mjs >> /root/projects/blog/data/research/layer2/daily-query-results/cron.log 2>&1
