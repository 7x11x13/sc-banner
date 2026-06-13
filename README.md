# sc-banner

Web app to create seamless SoundCloud banner/profile picture combos

## Known issues

- If an image's width is not a multiple of 124, you won't be able to select the whole width of the image (the rightmost `width % 124` pixels are cropped off so the banner can be exported at native resolution with no scaling)
- Images that are too tall will be cut off and you won't be able to select the bottom part of them
- Safari iOS (maybe other browsers too) can't handle canvas elements with more than 16777216 pixels (4096 x 4096), so images bigger than that won't work
- Resizing the window while cropping the image might cause weird stuff to happen
- When looking at your own profile, the profile picture is not centered vertically and will not look seamless. Use a different browser session to see the effect on your own profile
- The seamless look is not preserved on mobile, or any window less than 1080px wide (will be offset by 8px horizontally)
