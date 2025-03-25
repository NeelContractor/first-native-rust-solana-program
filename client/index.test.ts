import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import borsh from "borsh";

class CounterAccount {
    count = 0;

    constructor({count}: {count: number}) {
        this.count = count;
    }
}

const schema = { struct: { count: 'u32' } };

const GREETING_SIZE = borsh.serialize(
    schema,
    new CounterAccount({count: 0})
).length;

let counterAccountKeypair: Keypair;
let adminKeypair: Keypair;

test("counter does increment",async () => {
    adminKeypair = Keypair.generate();
    counterAccountKeypair = new Keypair;

    const connection = new Connection("http://localhost:8899", "confirmed");
    const res = await connection.requestAirdrop(adminKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(res);

    const programId = new PublicKey("3y881tpFjjgw2rybW2t1pyp1PE5dNn298ZSYbnsb2BzZ");
    const lamports = await connection.getMinimumBalanceForRentExemption(
        GREETING_SIZE
    );

    const createCounterAccIx = SystemProgram.createAccount({
        fromPubkey: adminKeypair.publicKey,
        lamports,
        newAccountPubkey: counterAccountKeypair.publicKey,
        programId: programId,
        space: GREETING_SIZE
    });

    const tx = new Transaction();
    tx.add(createCounterAccIx);

    const txHash = await connection.sendTransaction(tx, [adminKeypair, counterAccountKeypair]);
    await connection.confirmTransaction(txHash);

    const counterAccount = await connection.getAccountInfo(counterAccountKeypair.publicKey);
    if(!counterAccount) {
        throw new Error("Counter account not found");
    }
    const counter = borsh.deserialize(schema, counterAccount.data) as CounterAccount;
    console.log(counter.count);
    expect(counter.count).toBe(0);
});