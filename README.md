# sc-banner

Web app to create seamless SoundCloud banner/profile picture combos

## Known issues

- Images that have a width that is not a multiple of 124 will be scaled and the aspect ratio will change very slightly
- Images that are too tall will be cut off and you won't be able to select the bottom part of them
- Safari iOS (maybe other browsers too) can't handle canvas elements with more than 16777216 pixels (4096 x 4096), so images bigger than that won't work
- Resizing the window while cropping the image might cause weird stuff to happen
