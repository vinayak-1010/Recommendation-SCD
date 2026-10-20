# Tourist Place Images Download Guide

## Overview
This guide provides direct links and instructions to download high-quality, license-free images for all Dehradun/Mussoorie tourist attractions in the application.

## Quick Links to Verified Free Image Sources

### ✅ Ready to Download (Wikimedia Commons)

1. **FRI Dehradun** → `fri.jpg`
   - Direct page: https://commons.wikimedia.org/wiki/File:FRI_Dehradun,_Uttarakhand.jpg
   - How to download:
     1. Click the link above
     2. Click on the image preview to view full size
     3. Right-click → "Save image as..."
     4. Save as `fri.jpg` in `public/images/`
   - License: CC BY-SA 4.0 ✓
   - Resolution: 4096 × 2304 px

2. **Robber's Cave** → `rob.jpg`
   - Direct page: https://commons.wikimedia.org/wiki/File:Robber's_Cave_Dehradun.jpg
   - Resolution: 3456 × 5184 px
   - License: CC BY-SA 4.0 ✓

### 🔍 Search & Download (Unsplash - Best Quality)

Visit these Unsplash search pages and download the best matching image:

3. **Mindrolling Monastery** → `mind.jpg`
   - Search: https://unsplash.com/s/photos/dehradun
   - Alternative: https://unsplash.com/s/photos/monastery
   - Look for: Golden/colorful Buddhist stupa, large architectural structure
   - Tip: Search "stupa" or "Tibetan monastery" for similar architecture

4. **Landour / Lal Tibba** → `land.jpg`
   - Search: https://unsplash.com/s/photos/mussoorie
   - Look for: Mountain viewpoint, Himalayan peaks, telescope point, or heritage buildings
   - Alternative search: "mountain viewpoint India" or "Himalayan vista"

5. **Mall Road Mussoorie** → `mall.jpg`
   - Search: https://unsplash.com/s/photos/mussoorie
   - Look for: Colonial-era street, shopping area, or hill station market
   - Alternative: Search "hill station India street" or "colonial market India"

6. **Camel's Back Road** → `camels.jpg`
   - Search: https://unsplash.com/s/photos/mussoorie
   - Look for: Walking path with mountain views, ridge walk, sunset viewpoint
   - Alternative: "mountain promenade" or "hill station walk"

7. **Gun Hill** → `gunhill.jpg`
   - Search: https://unsplash.com/s/photos/cable-car-mountains-india
   - Look for: Ropeway/cable car or mountain top viewpoint
   - Alternative: Search "ropeway India" or "mountain cable car"

8. **Sir George Everest House** → `geo.jpg`
   - Search: https://unsplash.com/s/photos/ruins-mountains-india
   - Look for: Historic building ruins, heritage site with mountain backdrop
   - Alternative: Wikimedia - https://commons.wikimedia.org/wiki/Category:George_Everest_House

9. **Bhadraj Temple** → `bha.jpg`
   - Search: https://unsplash.com/s/photos/himalayan-temple
   - Look for: Mountain temple, hilltop shrine with forest surroundings
   - Alternative: "mountain trek temple India"

### 📸 Pixabay Downloads (Easiest - No Account Required)

Visit https://pixabay.com and search for these:

10. **Rishikesh Ganga Aarti** → `rish.jpg`
    - Search: "Ganga Aarti" or "Rishikesh"
    - Direct: https://pixabay.com/images/search/ganga%20aarti/
    - Look for: Evening ceremony with oil lamps on river banks
    - 300+ free options available

11. **Sahastradhara** → `sahas.jpg`
    - Search: "waterfall India" or "mountain spring"
    - Look for: Limestone cascade, natural water pools, or sulphur springs
    - Tip: Can use rob.jpg as fallback since they're both in same cluster

12. **Mussoorie Lake** → `mussoorie-lake.jpg`
    - Search: "lake mountains India" or "artificial lake Uttarakhand"
    - Look for: Calm lake with mountain backdrop, possibly with boats

13. **Maggi Point / Highway Viewpoint** → `maggi.jpg`
    - Search: "mountain highway India" or "valley view"
    - Look for: Road with mountain vista, or valley overlook
    - Tip: Any Mussoorie/Dehradun valley view works

### 🎨 Pexels Alternative

If Unsplash doesn't have good results, try Pexels:
- Base URL: https://www.pexels.com/search/
- Search terms: Same as Unsplash above
- Download: Click "Download" button → Choose "Original" size

## Download Steps

### Method 1: Manual Download (Recommended)

1. Visit the URL for each image source
2. Find a high-quality image (min 1920x1080px)
3. Download using the platform's download button
4. Rename to the correct filename (e.g., `fri.jpg`, `rob.jpg`)
5. Move to `c:\Users\HP\OneDrive\Desktop\travel\Recommendation-SCD\public\images\`
6. Verify all 13 images are in place

### Method 2: Browser Extensions

Install a bulk image downloader extension like:
- Download All Images
- Image Downloader
- Batch Image Downloader

Then visit the search pages and download matching images in bulk.

## Image Requirements

- **Resolution**: Minimum 1920x1080px (Full HD)
- **Format**: JPG preferred, WebP optional
- **File size**: Under 500KB (compress after download if needed)
- **Aspect ratio**: 16:9 landscape preferred
- **Quality**: High clarity, good lighting, authentic tourist photography

## Compression (After Download)

Use these free tools to optimize images:
1. **TinyPNG**: https://tinypng.com/ (drag and drop, download compressed)
2. **Squoosh**: https://squoosh.app/ (advanced compression options)
3. **ImageOptim**: For Mac users
4. **Caesium**: For Windows bulk compression

Target: Compress all images to 200-400KB for optimal web performance.

## Verification Checklist

After downloading, verify you have all these files in `public/images/`:

```
✓ mind.jpg          (Mindrolling Monastery)
✓ fri.jpg           (Forest Research Institute)
✓ rob.jpg           (Robber's Cave)
✓ sahas.jpg         (Sahastradhara)
✓ land.jpg          (Landour / Lal Tibba)
✓ camels.jpg        (Camel's Back Road)
✓ gunhill.jpg       (Gun Hill)
✓ mall.jpg          (Mall Road)
✓ geo.jpg           (George Everest House)
✓ bha.jpg           (Bhadraj Temple)
✓ mussoorie-lake.jpg (Mussoorie Lake)
✓ maggi.jpg         (Maggi Point viewpoint)
✓ rish.jpg          (Rishikesh Ganga Aarti)
✓ ATTRIBUTIONS.txt  (Already created)
```

## License Compliance

All recommended sources use these free licenses:
- **Wikimedia Commons**: CC BY-SA 4.0 (attribution required - see ATTRIBUTIONS.txt)
- **Unsplash**: Free to use, no attribution required
- **Pixabay**: Free for commercial use, no attribution required
- **Pexels**: Free for commercial & personal use, no attribution required

Attribution for Wikimedia images is already documented in `public/images/ATTRIBUTIONS.txt`.

## Fallback Strategy

If you can't find a specific location image:
- **Use similar architectural/natural features**: 
  - Monastery → Any large Buddhist stupa
  - Viewpoints → Generic Himalayan vista
  - Heritage sites → Colonial-era building ruins
  - Temples → Mountain hilltop shrines
- **Use images from the same region**: Dehradun/Mussoorie/Uttarakhand
- **Prioritize authenticity**: Real tourist photos over stock/staged images

## Estimated Time

- Quick download (accept first good match): 30-45 minutes
- Careful selection (compare multiple options): 1.5-2 hours
- With compression and optimization: 2-3 hours total

## Help & Support

If you can't find images for specific locations:
1. Check "Alternative search" terms in each section above
2. Try searching in Hindi (e.g., "मसूरी" for Mussoorie)
3. Use broader geographic terms (Uttarakhand, Garhwal Himalayas)
4. Look for travel blogs that use CC-licensed images

## Next Steps After Download

1. ✓ All 13 images downloaded to `public/images/`
2. ✓ Images compressed to <500KB each
3. ✓ Verify `ATTRIBUTIONS.txt` is present
4. ✓ Test images load correctly in the application
5. ✓ Check `data/places.json` matches filenames

---

Generated: 2026-10-20
Project: Travel Recommendation System - Dehradun/Mussoorie
