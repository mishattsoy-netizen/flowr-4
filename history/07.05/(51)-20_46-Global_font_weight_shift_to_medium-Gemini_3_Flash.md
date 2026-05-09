User request: "change all light, regular or normal font in the app to medium"

Objective Reconstruction:
The user requested a global UI change to standardize all typography to "Medium" (500) weight, effectively eliminating "Light" (300) and "Normal/Regular" (400) weights from the application to achieve a more robust and high-density visual aesthetic.

Strategic Reasoning:
Instead of manually updating hundreds of individual components, a global CSS override was implemented in the main stylesheet. This ensures 100% coverage across all existing and future components while maintaining the ability for semibold or bold weights to remain distinct. Using `!important` on the utility classes ensures that Tailwind's specific classes are overridden as requested.

Detailed Blueprint:
- Target: `src/app/globals.css`
- Action: Add a global `body` font-weight reset.
- Action: Override `.font-thin`, `.font-extralight`, `.font-light`, and `.font-normal` classes to `font-weight: 500`.

Operational Trace:
- Modified `src/app/globals.css`:
    - Added `@layer base { body { font-weight: 500; } }`
    - Added a combined rule for `.font-thin, .font-extralight, .font-light, .font-normal` setting them to `500 !important`.

Status Assessment:
Completed. The entire application now utilizes a Medium weight as its baseline. All light/normal utility classes are forced to medium.
