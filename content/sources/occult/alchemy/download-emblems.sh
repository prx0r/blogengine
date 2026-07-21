#!/bin/bash
# Download all alchemical emblem galleries from alchemywebsite.com
# Creates JSON metadata for each image
ALC="/root/projects/blog/content/sources/occult/alchemy"
mkdir -p "$ALC/emblems"

# Emblem metadata: page URL, image prefix, count, base URL
declare -A GALLERIES
GALLERIES[1]="https://www.alchemywebsite.com/amclglr1.html,A,40"
GALLERIES[2]="https://www.alchemywebsite.com/amclglr2.html,B,40"
GALLERIES[3]="https://www.alchemywebsite.com/amclglr3.html,C,40"
GALLERIES[4]="https://www.alchemywebsite.com/amclglr4.html,D,40"
GALLERIES[5]="https://www.alchemywebsite.com/amclglr5.html,E,40"
GALLERIES[6]="https://www.alchemywebsite.com/amclglr6.html,F,40"
GALLERIES[7]="https://www.alchemywebsite.com/amclglr7.html,G,40"
GALLERIES[8]="https://www.alchemywebsite.com/amclglr8.html,H,40"

# First pass: download all gallery HTML pages
for g in "${!GALLERIES[@]}"; do
  IFS=',' read -r url prefix count <<< "${GALLERIES[$g]}"
  echo "Gallery $g: $url"
  curl -sL -o "/tmp/emblem-gallery-$g.html" "$url"
done

echo "--- Galleries downloaded, extracting images ---"

# Extract image filenames and captions from gallery HTML
for g in 1 2 3 4 5 6 7 8; do
  html="/tmp/emblem-gallery-$g.html"
  if [ ! -f "$html" ]; then continue; fi
  
  mkdir -p "$ALC/emblems/gallery-$g"
  
  # Extract image src and data-caption from the MagicSlideshow
  grep -oP 'src="images/[^"]*"|data-caption="[^"]*"' "$html" | paste - - | while read -r img_line caption_line; do
    img=$(echo "$img_line" | sed 's/src="images\///;s/"//')
    caption=$(echo "$caption_line" | sed 's/data-caption="//;s/"//')
    
    # Download the image
    curl -sL -o "$ALC/emblems/gallery-$g/$img" "https://www.alchemywebsite.com/images/$img"
    
    # Create metadata JSON
    json_name="${img%.*}.json"
    cat > "$ALC/emblems/gallery-$g/$json_name" << JSONEOF
{
  "file": "$img",
  "caption": "$caption",
  "source": "alchemywebsite.com",
  "gallery": $g
}
JSONEOF
    echo "  $img saved"
  done
done

echo "=== Done ==="
echo "Images: $(find $ALC/emblems -name '*.jpg' -o -name '*.gif' | wc -l)"
echo "Metadata: $(find $ALC/emblems -name '*.json' | wc -l)"
