use dep::sha256::digest;

/// Balance threshold proof circuit.
///
/// Proves that a private balance exceeds a public threshold,
/// without revealing the balance itself.
///
/// Commitment scheme: sha256(balance_le_bytes || blinder)
/// where balance_le_bytes is the 8-byte little-endian encoding of the balance
/// as a u64 (whole COP pesos, decimal truncated).
///
/// Public inputs:
///   - commitment: sha256 hash binding the private balance to the proof
///   - threshold:  minimum balance (e.g., 1_000_000 for 1M COP)
///
/// Private inputs:
///   - balance: actual balance in whole pesos
///   - blinder: random 16-byte salt preventing commitment preimage attacks
fn main(
    balance: u64,
    blinder: [u8; 16],
    commitment: pub [u8; 32],
    threshold: pub u64,
) {
    // 1. Threshold check
    assert(balance > threshold, "Balance does not exceed threshold");

    // 2. Commitment check: sha256(balance_le_bytes || blinder)
    //    balance_le_bytes: 8 bytes, little-endian
    let b0: u8 = (balance & 0xff) as u8;
    let b1: u8 = ((balance >> 8) & 0xff) as u8;
    let b2: u8 = ((balance >> 16) & 0xff) as u8;
    let b3: u8 = ((balance >> 24) & 0xff) as u8;
    let b4: u8 = ((balance >> 32) & 0xff) as u8;
    let b5: u8 = ((balance >> 40) & 0xff) as u8;
    let b6: u8 = ((balance >> 48) & 0xff) as u8;
    let b7: u8 = ((balance >> 56) & 0xff) as u8;

    let preimage: [u8; 24] = [
        b0, b1, b2, b3, b4, b5, b6, b7,
        blinder[0], blinder[1], blinder[2],  blinder[3],
        blinder[4], blinder[5], blinder[6],  blinder[7],
        blinder[8], blinder[9], blinder[10], blinder[11],
        blinder[12], blinder[13], blinder[14], blinder[15],
    ];

    let computed = digest(preimage);
    assert(computed == commitment, "Commitment mismatch");
}

#[test]
fn test_balance_above_threshold() {
    let balance: u64 = 2_000_000; // 2M COP > 1M threshold
    let threshold: u64 = 1_000_000;
    let blinder: [u8; 16] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    // Compute expected commitment
    let b0: u8 = (balance & 0xff) as u8;
    let b1: u8 = ((balance >> 8) & 0xff) as u8;
    let b2: u8 = ((balance >> 16) & 0xff) as u8;
    let b3: u8 = ((balance >> 24) & 0xff) as u8;
    let b4: u8 = ((balance >> 32) & 0xff) as u8;
    let b5: u8 = ((balance >> 40) & 0xff) as u8;
    let b6: u8 = ((balance >> 48) & 0xff) as u8;
    let b7: u8 = ((balance >> 56) & 0xff) as u8;

    let preimage: [u8; 24] = [
        b0, b1, b2, b3, b4, b5, b6, b7,
        blinder[0], blinder[1], blinder[2],  blinder[3],
        blinder[4], blinder[5], blinder[6],  blinder[7],
        blinder[8], blinder[9], blinder[10], blinder[11],
        blinder[12], blinder[13], blinder[14], blinder[15],
    ];
    let commitment = digest(preimage);

    main(balance, blinder, commitment, threshold);
}

#[test(should_fail)]
fn test_balance_below_threshold() {
    let balance: u64 = 500_000; // below threshold
    let threshold: u64 = 1_000_000;
    let blinder: [u8; 16] = [0; 16];

    let b0: u8 = (balance & 0xff) as u8;
    let b1: u8 = ((balance >> 8) & 0xff) as u8;
    let b2: u8 = ((balance >> 16) & 0xff) as u8;
    let b3: u8 = ((balance >> 24) & 0xff) as u8;
    let b4: u8 = ((balance >> 32) & 0xff) as u8;
    let b5: u8 = ((balance >> 40) & 0xff) as u8;
    let b6: u8 = ((balance >> 48) & 0xff) as u8;
    let b7: u8 = ((balance >> 56) & 0xff) as u8;

    let preimage: [u8; 24] = [
        b0, b1, b2, b3, b4, b5, b6, b7,
        blinder[0], blinder[1], blinder[2],  blinder[3],
        blinder[4], blinder[5], blinder[6],  blinder[7],
        blinder[8], blinder[9], blinder[10], blinder[11],
        blinder[12], blinder[13], blinder[14], blinder[15],
    ];
    let commitment = digest(preimage);

    main(balance, blinder, commitment, threshold);
}

#[test(should_fail)]
fn test_wrong_commitment() {
    let balance: u64 = 2_000_000;
    let threshold: u64 = 1_000_000;
    let blinder: [u8; 16] = [1; 16];
    let wrong_commitment: [u8; 32] = [0; 32]; // all zeros - wrong

    main(balance, blinder, wrong_commitment, threshold);
}
