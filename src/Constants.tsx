// Banner aspect = SoundCloud's canonical 124 : 26 (its stored banner is 2480 x 520 /
// 1240 x 260), so SC re-encodes our banner with no crop or aspect stretch.
export const MIN_WIDTH_PX = 124;
export const MIN_HEIGHT_PX = 26;

// Avatar geometry as fractions of the banner height (measured from SoundCloud's render: a
// 198px avatar inset 28px in a 254px banner => 28 : 198 : 28 = 14 : 99 : 14, total 127).
// The avatar is vertically centered and inset the same amount from the left.
export const PFP_DIAMETER_RATIO = 99 / 127;
export const PFP_MARGIN_RATIO = 14 / 127;
