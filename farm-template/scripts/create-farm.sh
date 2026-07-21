#!/bin/bash
# scripts/create-farm.sh — Provision all Cloudflare resources for a new farm
# Usage: ./create-farm.sh <farm-id> <niche> <channel1,channel2,...>
set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <farm-id> <niche> <channel-ids> [evidence-standards] [forbidden-framings] [audience-promise]"
  echo "  farm-id: unique slug (e.g., 'tantra')"
  echo "  niche: description (e.g., 'religious-history/tantra')"
  echo "  channel-ids: comma-separated YouTube channel IDs"
  echo "  evidence-standards: comma-separated (e.g., 'primary_text,academic_indology')"
  exit 1
fi

FARM_ID="$1"
NICHE="$2"
IFS=',' read -ra CHANNEL_IDS <<< "$3"
EVIDENCE_STANDARDS="${4:-primary_text,academic}"
FORBIDDEN_FRAMINGS="${5:-science proves X,shocking = common}"
AUDIENCE_PROMISE="${6:-Hidden history}"

echo "=== Creating farm: $FARM_ID ($NICHE) ==="
echo "Channels: ${#CHANNEL_IDS[@]}"

# 1. Create D1 database
echo "→ Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create "farm-${FARM_ID}-db" 2>&1 || true)
DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id: \K\S+' || echo "manual")
echo "  Database: farm-${FARM_ID}-db (id: $DB_ID)"

# 2. Create R2 buckets
echo "→ Creating R2 buckets..."
npx wrangler r2 bucket create "farm-${FARM_ID}-assets" 2>/dev/null || true

# 3. Create Queues
echo "→ Creating Queues..."
npx wrangler queues create "farm-${FARM_ID}-pipeline" 2>/dev/null || true
npx wrangler queues create "farm-${FARM_ID}-render" 2>/dev/null || true

# 4. Copy template, replace placeholders
echo "→ Generating farm config..."
mkdir -p "farms/${FARM_ID}"
cp -r farm-template/src "farms/${FARM_ID}/"
cp farm-template/wrangler.jsonc "farms/${FARM_ID}/"
cp farm-template/package.json "farms/${FARM_ID}/"
cp farm-template/tsconfig.json "farms/${FARM_ID}/"

# Replace {FARM_ID} placeholders
sed -i "s/{FARM_ID}/${FARM_ID}/g" "farms/${FARM_ID}/wrangler.jsonc"
sed -i "s/{FARM_ID}/${FARM_ID}/g" "farms/${FARM_ID}/package.json"

# Add database ID to wrangler config
sed -i "s/\"database_id\": \"\"/\"database_id\": \"${DB_ID}\"/" "farms/${FARM_ID}/wrangler.jsonc"

# 5. Apply schema
echo "→ Applying schema..."
npx wrangler d1 execute "farm-${FARM_ID}-db" --file="farm-template/src/d1/schema.sql" 2>/dev/null || true

# 6. Insert channels
echo "→ Registering channels..."
for CHANNEL_ID in "${CHANNEL_IDS[@]}"; do
  npx wrangler d1 execute "farm-${FARM_ID}-db" \
    --command="INSERT OR IGNORE INTO channels (channel_id, farm_id, name, competitor_type) VALUES ('${CHANNEL_ID}', '${FARM_ID}', '', 'direct');" \
    2>/dev/null || true
done

# 7. Install dependencies
echo "→ Installing dependencies..."
cd "farms/${FARM_ID}"
npm install 2>/dev/null || true
cd - > /dev/null

echo ""
echo "=== Farm $FARM_ID created ==="
echo "Next steps:"
echo "  1. Add API keys: wrangler secret put YOUTUBE_API_KEY"
echo "  2. Deploy: cd farms/${FARM_ID} && npx wrangler deploy"
echo "  3. Verify: curl https://farm-${FARM_ID}.workers.dev/__cron/daily-research"
echo "  4. Set up Docker (optional): docker run -d --name farm-${FARM_ID} ..."
