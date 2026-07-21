#!/bin/bash
# Download ALL images from alchemywebsite.com with metadata
ALC="/root/projects/blog/content/sources/occult/alchemy"

# Image sources on the site
declare -A IMAGE_SOURCES
IMAGE_SOURCES["emblems-1-8"]="amclglr1.html amclglr2.html amclglr3.html amclglr4.html amclglr5.html amclglr6.html amclglr7.html amclglr8.html"
IMAGE_SOURCES["coloured-emblems"]="amcldraw.html"

echo "=== Scanning site for all image paths ==="

# Find all image references across the site
mkdir -p $ALC/images/all-with-metadata

# Get all HTML pages that contain images
for page in $(find $ALC/texts -name "*.html"); do
    grep -oP 'src="[^"]*\.(jpg|gif|png)"' "$page" | sed 's/src="//;s/"//' >> /tmp/all_images_raw.txt
done

# Also check emblem galleries
for gal in 1 2 3 4 5 6 7 8; do
    grep -oP 'src="images/[^"]*"' "/tmp/emblem-gallery-$gal.html" 2>/dev/null | sed 's/src="//;s/"//' >> /tmp/all_images_raw.txt
done

# Deduplicate and sort
sort -u /tmp/all_images_raw.txt > /tmp/all_images_unique.txt
echo "Total unique image references: $(wc -l < /tmp/all_images_unique.txt)"

# Download each image with metadata
while read -r img; do
    filename=$(basename "$img")
    # Don't re-download if we already have it
    if [ -f "$ALC/images/all-with-metadata/$filename" ]; then
        continue
    fi
    curl -sL -o "$ALC/images/all-with-metadata/$filename" "https://www.alchemywebsite.com/$img"
    echo "Downloaded: $filename"
done < /tmp/all_images_unique.txt

echo "=== Done ==="
echo "Total images: $(ls $ALC/images/all-with-metadata/ | wc -l)"
du -sh $ALC/images/all-with-metadata/
