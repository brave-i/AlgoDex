// @ts-nocheck
import * as constants from './constants';
import algosdk from 'algosdk';

export default async function swapToken1ForToken2(
  from: string,
  escrowAddr: string,
  token1Amount: number,
  token1Index: number,
  minToken2Received: number
) {
  const enc = new TextEncoder();
  try {
    const encodedAppArgs = [
      enc.encode('s1'), enc.encode(minToken2Received.toString()),
    ];

    const txParams = await AlgoSigner.algod({
      ledger: constants.LEDGER_NAME,
      path: '/v2/transactions/params',
    });

    console.log(txParams);


    // Call to validator
    let txn1 = {
      type: 'appl',
      from: from,
      appIndex: constants.VALIDATOR_APP_ID,
      appOnComplete: 0, // 0 == NoOp
      appArgs: encodedAppArgs,
      // appAccounts: [escrowAddr],
      fee: txParams['min-fee'],
      firstRound: txParams['last-round'],
      lastRound: txParams['last-round'] + 1000,
      genesisID: txParams['genesis-id'],
      genesisHash: txParams['genesis-hash'],
    };

    // Call to manager
    let txn2 = {
      type: 'appl',
      from: from,
      appIndex: constants.MANAGER_APP_ID,
      appOnComplete: 0, // 0 == NoOp
      appArgs: encodedAppArgs,
      // appAccounts: [escrowAddr],
      fee: txParams['min-fee'],
      firstRound: txParams['last-round'],
      lastRound: txParams['last-round'] + 1000,
      genesisID: txParams['genesis-id'],
      genesisHash: txParams['genesis-hash'],
    };

    // Send Token1 to Escrow
    let txn3 = {
      type: 'axfer',
      from: from,
      to: escrowAddr,
      amount: token1Amount,
      assetIndex: token1Index,
      fee: txParams['min-fee'],
      firstRound: txParams['last-round'],
      lastRound: txParams['last-round'] + 1000,
      genesisID: txParams['genesis-id'],
      genesisHash: txParams['genesis-hash'],
    };

    console.log([txn1, txn2, txn3])

    let txnGroup = await algosdk.assignGroupID([txn1, txn2, txn3]);

    console.log(txnGroup);

    // Modify the group fields in orginal transactions to be base64 encoded strings
    txn1.group = txnGroup[0].group.toString('base64');
    txn2.group = txnGroup[1].group.toString('base64');
    txn3.group = txnGroup[2].group.toString('base64');

    let signedTxn1 = await AlgoSigner.sign(txn1);
    let signedTxn2 = await AlgoSigner.sign(txn2);
    let signedTxn3 = await AlgoSigner.sign(txn3);

    if (!(signedTxn1 && signedTxn2 && signedTxn3)) {
      return console.error('User rejected signatures');
    }

    // Get the decoded binary Uint8Array values from the blobs
    const decoded_1 = new Uint8Array(
      atob(signed1.blob)
        .split('')
        .map(x => x.charCodeAt(0))
    );
    const decoded_2 = new Uint8Array(
      atob(signed2.blob)
        .split('')
        .map(x => x.charCodeAt(0))
    );
    const decoded_3 = new Uint8Array(
      atob(signed3.blob)
        .split('')
        .map(x => x.charCodeAt(0))
    );

    // Use their combined length to create a 3rd array
    let combined_decoded_txns = new Uint8Array(
      decoded_1.byteLength + decoded_2.byteLength + decoded_3.byteLength
    );

    // Starting at the 0 position, fill in the binary for the first object
    combined_decoded_txns.set(new Uint8Array(decoded_1), 0);
    // Starting at the first object byte length, fill in the 2nd binary value
    combined_decoded_txns.set(new Uint8Array(decoded_2), decoded_1.byteLength);
    // Starting at the first+second object byte length, fill in the 3rd binary value
    combined_decoded_txns.set(
      new Uint8Array(decoded_3),
      decoded_1.byteLength + decoded_2.byteLength
    );

    // Modify our combined array values back to an encoded 64bit string
    const grouped_txns = btoa(String.fromCharCode.apply(null, combined_decoded_txns));

    const res = await AlgoSigner.send({
      ledger: constants.LEDGER_NAME,
      tx: grouped_txns,
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
