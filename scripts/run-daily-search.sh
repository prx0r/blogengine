#!/bin/bash
export YOUTUBE_API_KEY="AIzaSyAoXdXRD1K3A2nIOQLVBDYgo257zqQXy3I"
cd /root/projects/blog
node scripts/daily-search-collection.mjs >> /root/projects/blog/data/research/layer2/daily-query-results/cron.log 2>&1
