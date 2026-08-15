import { describe, it, expect } from 'vitest';
import { getInvoicePaymentHash, verifyPaymentPreimage } from './lnPaymentProof';

// Real BOLT11 invoice fetched from the marketplace's LNURL endpoint
// (rizful.com/lnurl_two/bitpopart/get_invoice, 1000 msat test invoice).
const REAL_INVOICE =
  "lnbc10n1p4gqfympp5wq5pnmcffsjevmzgwmcl7aa5un2cqt8vwgshpzn03tnznqjtkjtqhp59aqzmwdhk4c3xfxekukgls8yqxg967nem6fzman6ps66z7swp6xscqzysxqrrssrzjqv3dpepm8kfdxrk3sl6wzqdf49s9c0h9ljtjrek6c08r6aejlwcnur0dwyqqvucqqqqqqqlgqqqq86qqjqsp52jud93fn7d3syx6gz8dr7cyfejw8cxxyvw74lmtcydyl9q4c8rwq9qxpqysgqahuka9zd4gkpyqxg5zklt98yggm9lnhls7lslvrwcepc7ypejnu8gxxrkndya9tendgy93wes25m02n8vrw5jugkyzzed78074aacggqz2587j";

// Known-answer vector: sha256(preimage) === hash (generated offline with node:crypto).
const PREIMAGE = 'e639fe5aa43a4e43e363d52c1b1de5b140ab66253d201ac374b111533c5b0ef6';
const PAYMENT_HASH = '3ef50ea38af25673c663c2a75947a9a242c1e98fbfdffaef08a397a5a9d7d148';

describe('getInvoicePaymentHash', () => {
  it('extracts the payment hash from a real BOLT11 invoice', () => {
    const hash = getInvoicePaymentHash(REAL_INVOICE);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns null for invalid input', () => {
    expect(getInvoicePaymentHash('not-an-invoice')).toBeNull();
    expect(getInvoicePaymentHash('')).toBeNull();
  });
});

describe('verifyPaymentPreimage', () => {
  it('accepts the correct preimage for a payment hash', async () => {
    expect(await verifyPaymentPreimage(PREIMAGE, PAYMENT_HASH)).toBe(true);
  });

  it('rejects a preimage that does not match the hash', async () => {
    const other = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(await verifyPaymentPreimage(other, PAYMENT_HASH)).toBe(false);
  });

  it('rejects non-hex input', async () => {
    expect(await verifyPaymentPreimage('zzzz', PAYMENT_HASH)).toBe(false);
  });

  it('is case-insensitive for both arguments', async () => {
    expect(await verifyPaymentPreimage(PREIMAGE.toUpperCase(), PAYMENT_HASH.toUpperCase())).toBe(true);
  });
});
