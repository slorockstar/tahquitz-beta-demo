/**
 * TAHQUITZ CORE ENGINE // PROJECT ANTIGRAVITY
 * Arinc429Builder.ts - Hyper-precise 32-bit word construction utility for VVIP cabin assets.
 */
export interface Arinc429Params {
    labelOctal: string;
    sdi: number;
    dataPayload: number;
    ssm: number;
}
export declare class Arinc429Builder {
    /**
     * Reverses the bits of an 8-bit label as required by ARINC 429 standard transmission rules.
     */
    private static reverseLabelBits;
    /**
     * Calculates the Odd Parity bit for a 32-bit word (Bit 32 must ensure total number of 1s is ODD).
     */
    private static calculateOddParity;
    /**
     * Constructs a functional 32-bit ARINC 429 hex word string from web-based parameters.
     */
    static buildWord(params: Arinc429Params): string;
}
//# sourceMappingURL=Arinc429Builder.d.ts.map