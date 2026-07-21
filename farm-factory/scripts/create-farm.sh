#!/bin/bash
# Create a new farm from the template
# Usage: ./scripts/create-farm.sh <farm-id> <niche> <channel-ids-json> <topic-clusters-json>
set -euo pipefail

if [ $# -lt 6 ]; then
  echo "Usage: $0 <farm-id> <niche> <channel-ids> <evidence-standards> <forbidden-framings> <audience-promise>"
  echo "  farm-id: unique identifier (e.g., tantra2)"
  echo "  niche: short description (e.g., 'buddhist-philosophy')"
  echo "  channel-ids: comma-separated YouTube channel IDs"
  echo "  evidence-standards: comma-separated (e.g., 'primary_text,academic_indology')"
  echo "  forbidden-framings: comma-separated (e.g., 'science proves tantra,shocking = common')"
  echo "  audience-promise: quoted string (e.g., 'Hidden history of Indian philosophy')"
  echo ""
  echo "Example:"
  echo "  $0 tantra2 tantra UCxxx,UCyyy 'primary_text,academic_indology' 'science proves tantra,shocking = common' 'Hidden history of Indian philosophy'"
  exit 1
fi

FARM_ID="$1"
NICHE="$2"
IFS=',' read -ra CHANNEL_IDS <<< "$3"
EVIDENCE_STANDARDS="$4"
FORBIDDEN_FRAMINGS="$5"
AUDIENCE_PROMISE="$6"

echo "Creating farm: $FARM_ID ($NICHE)"
echo "Channels: ${#CHANNEL_IDS[@]}"

# 1. Copy template
TARGET="farms/$FARM_ID"
if [ -d "$TARGET" ]; then
  echo "Error: Farm $FARM_ID already exists at $TARGET"
  exit 1
fi

cp -r farm-template "$TARGET"
echo "  Template copied to $TARGET"

# 2. Replace FARM_ID in wrangler.jsonc
sed -i "s/{FARM_ID}/$FARM_ID/g" "$TARGET/wrangler.jsonc"
echo "  wrangler.jsonc patched"

# 3. Create D1 database
npx wrangler d1 create "farm-$FARM_ID-db" 2>/dev/null || {
  echo "  D1 database creation failed (may already exist)"
}
echo "  D1 database registered"

# 4. Apply schema
npx wrangler d1 execute "farm-$FARM_ID-db" --file="$TARGET/src/d1/schema.sql" || true
echo "  Schema applied"

# 5. Create R2 buckets
npx wrangler r2 bucket create "farm-$FARM_ID-sources" 2>/dev/null || true
npx wrangler r2 bucket create "farm-$FARM_ID-assets" 2>/dev/null || true
npx wrangler r2 bucket create "farm-$FARM_ID-outputs" 2>/dev/null || true
echo "  R2 buckets created"

# 6. Create Queues
npx wrangler queues create "farm-$FARM_ID-pipeline" 2>/dev/null || true
npx wrangler queues create "farm-$FARM_ID-render" 2>/dev/null || true
echo "  Queues created"

# 7. Insert channels into DB
for CHANNEL_ID in "${CHANNEL_IDS[@]}"; do
  npx wrangler d1 execute "farm-$FARM_ID-db" \
    --command="INSERT OR IGNORE INTO channels (channel_id, farm_id, name, competitor_type) VALUES ('$CHANNEL_ID', '$FARM_ID', '', 'direct')" 2>/dev/null || true
done
echo "  ${#CHANNEL_IDS[@]} channels registered"

# 8. Install dependencies
cd "$TARGET"
npm install 2>/dev/null || true
cd - > /dev/null
echo "  Dependencies installed"

# 9. Deploy
npx wrangler deploy --config "$TARGET/wrangler.jsonc" 2>/dev/null || {
  echo "  Deploy pending — run 'npm run deploy' in $TARGET"
}
echo ""
echo "Farm $FARM_ID created successfully!"
echo "  Niche: $NICHE"
echo "  Channels: ${#CHANNEL_IDS[@]}"
echo "  Deploy: cd $TARGET && npx wrangler deploy"
echo "  Test: curl https://farm-$FARM_ID.workers.dev/api/research/daily-scan"
