/**
 * TAHQUITZ CORE ENGINE // PROJECT ANTIGRAVITY
 * Arinc429Builder.ts - Hyper-precise 32-bit word construction utility for VVIP cabin assets.
 */

export interface Arinc429Params {
  labelOctal: string; // e.g., "270" for ALTO Light Controls
  sdi: number;        // Source/Destination Identifier (2 bits: 0-3)
  dataPayload: number;// Raw data value (e.g., dimming level 0-100)
  ssm: number;        // Sign/Status Matrix (2 bits: 0-3)
}

export class Arinc429Builder {
  /**
   * Reverses the bits of an 8-bit label as required by ARINC 429 standard transmission rules.
   */
  private static reverseLabelBits(labelNum: number): number {
    let reversed = 0;
    for (let i = 0; i < 8; i++) {
      if ((labelNum & (1 << i)) !== 0) {
        reversed |= (1 << (7 - i));
      }
    }
    return reversed;
  }

  /**
   * Calculates the Odd Parity bit for a 32-bit word (Bit 32 must ensure total number of 1s is ODD).
   */
  private static calculateOddParity(word: number): number {
    let count = 0;
    // Count bits 1 through 31
    for (let i = 0; i < 31; i++) {
      if ((word & (1 << i)) !== 0) {
        count++;
      }
    }
    // If count is even, parity bit must be 1 to make the total count odd
    return (count % 2 === 0) ? 1 : 0;
  }

  /**
   * Constructs a functional 32-bit ARINC 429 hex word string from web-based parameters.
   */
  public static buildWord(params: Arinc429Params): string {
    const { labelOctal, sdi, dataPayload, ssm } = params;

    // 1. Convert octal string label to base-10 number, then reverse it per standard specs
    const rawLabel = parseInt(labelOctal, 8);
    const transmittedLabel = this.reverseLabelBits(rawLabel) & 0xFF;

    // 2. Format SDI (Bits 9-10)
    const formattedSdi = (sdi & 0x03) << 8;

    // 3. Format Data Payload (Bits 11-29) - Dimming values 0-100 mapped to standard BNR linear scale
    const formattedData = (dataPayload & 0x1FFFF) << 10;

    // 4. Format SSM (Bits 30-31) - Operational Normal code usually 0x03 or 0x00
    const formattedSsm = (ssm & 0x03) << 29;

    // Combine chunks into initial 31-bit word framework
    let finalWord = transmittedLabel | formattedSdi | formattedData | formattedSsm;

    // 5. Compute and append Odd Parity onto Bit 32
    const parityBit = this.calculateOddParity(finalWord);
    if (parityBit === 1) {
      // Set the 32nd bit to 1 (using unsigned right shift operations or standard bitwise OR)
      finalWord |= (1 << 31);
    }

    // Convert to a clean unsigned 32-bit hex presentation string
    const hexOutput = (finalWord >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return `0x${hexOutput}`;
  }
}

// ==========================================
// TEST EXECUTION RUNNER SIMULATOR
// ==========================================
// Example: Light command tapped on Tahquitz Vista iPad UI -> Set Master Suite Valance to 100% (Hex: 64)
const simulatedParams: Arinc429Params = {
  labelOctal: "270",
  sdi: 1,
  dataPayload: 100, // 100% intensity
  ssm: 3            // Normal Operation status matrix
};

const outputHex = Arinc429Builder.buildWord(simulatedParams);
console.log(`[TAHQUITZ TEST] Generated Binary Word: ${outputHex}`);
